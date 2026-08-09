import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend, ReferenceLine, AreaChart, Area
} from 'recharts';
import {
  Heart, Activity, Thermometer, Stethoscope, AlertTriangle, Play, Pause,
  RefreshCw, ShieldAlert, Sparkles, Filter, ChevronDown, Bell, Eye, CheckCircle2
} from 'lucide-react';
import { Patient } from '../types';

interface PatientVitalsChartProps {
  patients: Patient[];
  onTriggerEmergencyAlert?: (title: string, message: string) => void;
}

interface VitalDataPoint {
  time: string;
  heartRate: number;
  systolicBP: number;
  diastolicBP: number;
  spO2: number;
  temperature: number;
  respirationRate: number;
  status: 'Optimal' | 'Elevated' | 'Critical';
}

export const PatientVitalsChart: React.FC<PatientVitalsChartProps> = ({
  patients,
  onTriggerEmergencyAlert
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || 'pat-1');
  const [timeRange, setTimeRange] = useState<'24h' | '12h' | '6h'>('24h');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(false);
  const [showThresholds, setShowThresholds] = useState<boolean>(true);
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  // Toggle active vital curves
  const [visibleVitals, setVisibleVitals] = useState({
    heartRate: true,
    systolicBP: true,
    diastolicBP: true,
    spO2: true,
    temperature: false
  });

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  // Generator function for realistic initial 24h vitals
  const generateInitialData = (patientName?: string, age?: number): VitalDataPoint[] => {
    const isCriticalPatient = patientName?.toLowerCase().includes('sophia') || patientName?.toLowerCase().includes('alex');
    const baseHR = isCriticalPatient ? 92 : 72;
    const baseSys = isCriticalPatient ? 142 : 120;
    const baseDia = isCriticalPatient ? 90 : 80;
    const baseSpO2 = isCriticalPatient ? 94 : 98;
    const baseTemp = isCriticalPatient ? 100.2 : 98.6;

    const timestamps = [
      '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
      '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
    ];

    return timestamps.map((time, idx) => {
      // Simulate diurnal variation + small random variance
      const hrVar = Math.floor(Math.sin(idx) * 6) + (idx === 5 ? 12 : 0);
      const sysVar = Math.floor(Math.cos(idx) * 8) + (idx === 5 ? 14 : 0);
      const diaVar = Math.floor(Math.cos(idx) * 4) + (idx === 5 ? 8 : 0);
      const spO2Var = idx === 5 ? -3 : Math.floor(Math.sin(idx * 2) * 1.5);

      const hr = Math.max(50, Math.min(160, baseHR + hrVar));
      const sys = Math.max(80, Math.min(200, baseSys + sysVar));
      const dia = Math.max(50, Math.min(120, baseDia + diaVar));
      const spO2 = Math.max(85, Math.min(100, baseSpO2 + spO2Var));
      const temp = Number((baseTemp + (Math.sin(idx) * 0.4)).toFixed(1));

      let status: 'Optimal' | 'Elevated' | 'Critical' = 'Optimal';
      if (hr > 105 || sys > 140 || spO2 < 94) {
        status = hr > 120 || sys > 160 || spO2 < 90 ? 'Critical' : 'Elevated';
      }

      return {
        time,
        heartRate: hr,
        systolicBP: sys,
        diastolicBP: dia,
        spO2,
        temperature: temp,
        respirationRate: 16 + (hr > 90 ? 4 : 0),
        status
      };
    });
  };

  const [vitalsStream, setVitalsStream] = useState<VitalDataPoint[]>(() =>
    generateInitialData(selectedPatient?.name, selectedPatient?.age)
  );

  // Regenerate stream when selected patient changes
  useEffect(() => {
    setVitalsStream(generateInitialData(selectedPatient?.name, selectedPatient?.age));
  }, [selectedPatientId]);

  // Live real-time telemetry simulator interval
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setVitalsStream(prev => {
        const last = prev[prev.length - 1];
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Add realistic minor delta
        const hrDelta = Math.floor((Math.random() - 0.48) * 5);
        const sysDelta = Math.floor((Math.random() - 0.48) * 6);
        const diaDelta = Math.floor((Math.random() - 0.48) * 4);
        const spO2Delta = Math.floor((Math.random() - 0.45) * 2);

        const newHr = Math.max(55, Math.min(150, last.heartRate + hrDelta));
        const newSys = Math.max(85, Math.min(180, last.systolicBP + sysDelta));
        const newDia = Math.max(55, Math.min(115, last.diastolicBP + diaDelta));
        const newSpO2 = Math.max(88, Math.min(100, last.spO2 + spO2Delta));
        const newTemp = Number((last.temperature + (Math.random() - 0.5) * 0.1).toFixed(1));

        let status: 'Optimal' | 'Elevated' | 'Critical' = 'Optimal';
        if (newHr > 105 || newSys > 140 || newSpO2 < 94) {
          status = newHr > 120 || newSys > 160 || newSpO2 < 90 ? 'Critical' : 'Elevated';
        }

        const newPoint: VitalDataPoint = {
          time: timeStr,
          heartRate: newHr,
          systolicBP: newSys,
          diastolicBP: newDia,
          spO2: newSpO2,
          temperature: newTemp,
          respirationRate: 16 + (newHr > 90 ? 4 : 0),
          status
        };

        // Keep last 15 points in live stream
        const updated = [...prev.slice(1), newPoint];
        return updated;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Filtered dataset based on time range selection
  const displayData = React.useMemo(() => {
    if (timeRange === '6h') return vitalsStream.slice(-4);
    if (timeRange === '12h') return vitalsStream.slice(-7);
    return vitalsStream;
  }, [vitalsStream, timeRange]);

  const latestPoint = vitalsStream[vitalsStream.length - 1] || {
    heartRate: 75,
    systolicBP: 120,
    diastolicBP: 80,
    spO2: 98,
    temperature: 98.6,
    status: 'Optimal'
  };

  const isCurrentCritical = latestPoint.status === 'Critical' || latestPoint.heartRate > 110 || latestPoint.spO2 < 93;
  const isCurrentElevated = latestPoint.status === 'Elevated' || latestPoint.heartRate > 95 || latestPoint.systolicBP > 135;

  const handleManualRefresh = () => {
    setVitalsStream(generateInitialData(selectedPatient?.name, selectedPatient?.age));
  };

  const toggleVital = (key: keyof typeof visibleVitals) => {
    setVisibleVitals(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
      
      {/* HEADER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold ${
            isCurrentCritical
              ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
              : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
          }`}>
            <Heart className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Real-Time Patient Vitals & Telemetry Trends
              </h3>

              {isLiveStreaming ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-sm flex items-center gap-1 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" /> LIVE SENSOR STREAM
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  24-HOUR TELEMETRY
                </span>
              )}

              {isCurrentCritical && (
                <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase animate-bounce">
                  CRITICAL BOUND WARNING
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Continuous multi-lead telemetry monitoring Heart Rate, Blood Pressure (Sys/Dia), SpO2 Saturation, and Temperature.
            </p>
          </div>
        </div>

        {/* TOP CONTROLS & PATIENT SELECTOR */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Patient Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Eye className="w-3.5 h-3.5 text-cyan-600 ml-1.5" />
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer pr-2"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id} className="bg-white dark:bg-slate-900">
                  {p.name} ({p.admittedStatus || 'Inpatient'})
                </option>
              ))}
            </select>
          </div>

          {/* Live Auto-Update Stream Toggle */}
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3 py-2 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
              isLiveStreaming
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
            title={isLiveStreaming ? 'Pause Live Telemetry Feed' : 'Start Live Telemetry Auto-Stream'}
          >
            {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLiveStreaming ? 'Streaming...' : 'Live Stream'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={handleManualRefresh}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            title="Reset telemetry baseline"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CURRENT LIVE STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Heart Rate */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          latestPoint.heartRate > 100
            ? 'bg-rose-500/10 border-rose-500/50 text-rose-900 dark:text-rose-200'
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" /> Heart Rate
            </span>
            <span className="text-[10px] text-rose-500 font-black">BPM</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {latestPoint.heartRate}
            </span>
            <span className="text-[10px] text-slate-500">
              {latestPoint.heartRate > 100 ? '⚠️ High' : 'Normal (60-100)'}
            </span>
          </div>
        </div>

        {/* Systolic & Diastolic BP */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          latestPoint.systolicBP > 135
            ? 'bg-amber-500/10 border-amber-500/50 text-amber-900 dark:text-amber-200'
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-500" /> Blood Pressure
            </span>
            <span className="text-[10px] text-cyan-500 font-black">mmHg</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">
              {latestPoint.systolicBP}
            </span>
            <span className="text-lg font-bold text-slate-400">/</span>
            <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {latestPoint.diastolicBP}
            </span>
          </div>
        </div>

        {/* Oxygen Saturation */}
        <div className={`p-3.5 rounded-2xl border transition-all ${
          latestPoint.spO2 < 95
            ? 'bg-rose-500/10 border-rose-500/50 text-rose-900 dark:text-rose-200'
            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-500" /> SpO2 Saturation
            </span>
            <span className="text-[10px] text-emerald-500 font-black">%</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {latestPoint.spO2}%
            </span>
            <span className="text-[10px] text-slate-500">
              {latestPoint.spO2 < 95 ? '⚠️ Low Oxygen' : 'Optimal (≥95%)'}
            </span>
          </div>
        </div>

        {/* Temperature & Respiration */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-amber-500" /> Temperature
            </span>
            <span className="text-[10px] text-amber-500 font-black">°F</span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {latestPoint.temperature}°F
            </span>
            <span className="text-[10px] text-slate-500">
              Resp: {latestPoint.respirationRate} rpm
            </span>
          </div>
        </div>
      </div>

      {/* FILTER & TOGGLE TOOLBAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
        
        {/* Metric Line Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Metrics:</span>

          <button
            onClick={() => toggleVital('heartRate')}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              visibleVitals.heartRate
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-200" /> Heart Rate
          </button>

          <button
            onClick={() => toggleVital('systolicBP')}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              visibleVitals.systolicBP
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-200" /> Systolic BP
          </button>

          <button
            onClick={() => toggleVital('diastolicBP')}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              visibleVitals.diastolicBP
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-200" /> Diastolic BP
          </button>

          <button
            onClick={() => toggleVital('spO2')}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              visibleVitals.spO2
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-200" /> SpO2 %
          </button>

          <button
            onClick={() => toggleVital('temperature')}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-all cursor-pointer ${
              visibleVitals.temperature
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-500 opacity-60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-200" /> Temp °F
          </button>
        </div>

        {/* Secondary controls: Time Window & Threshold Lines */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowThresholds(!showThresholds)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
              showThresholds
                ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200'
            }`}
          >
            {showThresholds ? '✓ Safety Bounds On' : 'Show Bounds'}
          </button>

          <div className="flex items-center p-0.5 bg-slate-200 dark:bg-slate-700 rounded-xl">
            <button
              onClick={() => setTimeRange('6h')}
              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer ${
                timeRange === '6h' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              6H
            </button>
            <button
              onClick={() => setTimeRange('12h')}
              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer ${
                timeRange === '12h' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              12H
            </button>
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer ${
                timeRange === '24h' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              24H
            </button>
          </div>
        </div>

      </div>

      {/* RECHARTS MAIN VISUALIZATION STAGE */}
      <div className="h-80 w-full pt-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorHR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorSpO2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.18} />
            <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[50, 180]} />

            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload as VitalDataPoint;

                return (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white shadow-2xl space-y-2 min-w-56 text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <span className="font-extrabold text-cyan-400">Time: {label}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        data.status === 'Critical'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : data.status === 'Elevated'
                          ? 'bg-amber-500 text-black'
                          : 'bg-emerald-500 text-white'
                      }`}>
                        {data.status}
                      </span>
                    </div>

                    <div className="space-y-1 pt-1 font-mono">
                      {visibleVitals.heartRate && (
                        <div className="flex items-center justify-between text-rose-400">
                          <span>Heart Rate:</span>
                          <span className="font-bold">{data.heartRate} bpm</span>
                        </div>
                      )}
                      {visibleVitals.systolicBP && (
                        <div className="flex items-center justify-between text-cyan-400">
                          <span>Systolic BP:</span>
                          <span className="font-bold">{data.systolicBP} mmHg</span>
                        </div>
                      )}
                      {visibleVitals.diastolicBP && (
                        <div className="flex items-center justify-between text-indigo-400">
                          <span>Diastolic BP:</span>
                          <span className="font-bold">{data.diastolicBP} mmHg</span>
                        </div>
                      )}
                      {visibleVitals.spO2 && (
                        <div className="flex items-center justify-between text-emerald-400">
                          <span>SpO2 Oxygen:</span>
                          <span className="font-bold">{data.spO2}%</span>
                        </div>
                      )}
                      {visibleVitals.temperature && (
                        <div className="flex items-center justify-between text-amber-400">
                          <span>Temperature:</span>
                          <span className="font-bold">{data.temperature}°F</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />

            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

            {/* Critical Safety Boundary Lines */}
            {showThresholds && (
              <>
                <ReferenceLine
                  y={100}
                  stroke="#f43f5e"
                  strokeDasharray="4 4"
                  label={{ value: 'High HR Threshold (100 bpm)', fill: '#f43f5e', fontSize: 10, position: 'right' }}
                />
                <ReferenceLine
                  y={140}
                  stroke="#38bdf8"
                  strokeDasharray="4 4"
                  label={{ value: 'High Systolic BP (140 mmHg)', fill: '#38bdf8', fontSize: 10, position: 'right' }}
                />
              </>
            )}

            {/* Recharts Area / Line Layers */}
            {visibleVitals.heartRate && (
              <Area
                type="monotone"
                dataKey="heartRate"
                name="Heart Rate (bpm)"
                stroke="#f43f5e"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorHR)"
                dot={{ r: 3, fill: '#f43f5e' }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {visibleVitals.systolicBP && (
              <Area
                type="monotone"
                dataKey="systolicBP"
                name="Systolic BP (mmHg)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorSys)"
                dot={{ r: 3, fill: '#06b6d4' }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {visibleVitals.diastolicBP && (
              <Line
                type="monotone"
                dataKey="diastolicBP"
                name="Diastolic BP (mmHg)"
                stroke="#818cf8"
                strokeWidth={2}
                strokeDasharray="3 3"
                dot={{ r: 2 }}
              />
            )}

            {visibleVitals.spO2 && (
              <Area
                type="monotone"
                dataKey="spO2"
                name="SpO2 Saturation (%)"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSpO2)"
                dot={{ r: 2, fill: '#10b981' }}
              />
            )}

            {visibleVitals.temperature && (
              <Line
                type="monotone"
                dataKey="temperature"
                name="Temperature (°F)"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 2 }}
              />
            )}

          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* FOOTER ACTION BANNER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="text-slate-600 dark:text-slate-400">
            Assigned Attending: <strong className="text-slate-900 dark:text-white font-bold">{selectedPatient?.name || 'Selected Patient'}</strong>
          </span>
        </div>

        {onTriggerEmergencyAlert && (
          <button
            onClick={() => {
              onTriggerEmergencyAlert(
                `🚨 Urgent Vitals Alert: ${selectedPatient?.name}`,
                `Continuous telemetry flagged critical readings (HR: ${latestPoint.heartRate} bpm, BP: ${latestPoint.systolicBP}/${latestPoint.diastolicBP}, SpO2: ${latestPoint.spO2}%). Immediate bedside evaluation requested.`
              );
            }}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Bell className="w-3.5 h-3.5 animate-bounce" />
            <span>Dispatch Vitals Emergency Alert</span>
          </button>
        )}
      </div>

    </div>
  );
};
