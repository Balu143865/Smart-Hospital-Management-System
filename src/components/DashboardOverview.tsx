import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { useAuth } from '../context/AuthContext';
import { useHospital } from '../context/HospitalContext';
import { PatientVitalsChart } from './PatientVitalsChart';
import { HospitalFloorMap } from './HospitalFloorMap';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid,
  LineChart, Line, Legend
} from 'recharts';
import {
  Users, UserCheck, Calendar, DollarSign, Activity, Building2,
  AlertTriangle, Plus, ArrowUpRight, TrendingUp, Sparkles, ShieldCheck,
  ShieldAlert, FlaskConical, CheckCircle2, ArrowRight, Zap, RefreshCw, Eye,
  Download, FileText, Heart, Thermometer, Stethoscope, Flame, Clock, Filter
} from 'lucide-react';

export const DashboardOverview: React.FC<{ onGoToTab: (t: any) => void }> = ({ onGoToTab }) => {
  const { user, activeRole } = useAuth();
  const {
    analytics, doctors, patients, appointments, invoices, departments,
    labOrders, placeLabOrder, triggerEmergencyAlert
  } = useHospital();

  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<string[]>([]);
  const [simulating, setSimulating] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  // Hospital Consultation Peak Traffic Heatmap State
  const [selectedHeatmapDept, setSelectedHeatmapDept] = useState<string>('All Departments');
  const [hoveredCell, setHoveredCell] = useState<{ day: string; time: string; count: number } | null>(null);

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

  // Base raw consultation traffic matrix (Day x Hour Slot)
  const baseTrafficMatrix: Record<string, number[]> = {
    Mon: [28, 46, 38, 26, 20, 14, 6],
    Tue: [24, 42, 36, 28, 22, 12, 5],
    Wed: [30, 48, 40, 31, 25, 16, 8],
    Thu: [22, 38, 32, 24, 18, 10, 4],
    Fri: [26, 44, 35, 29, 21, 15, 7],
    Sat: [15, 28, 24, 18, 12, 8, 3],
    Sun: [10, 18, 16, 12, 8, 5, 2],
  };

  const getTrafficCount = (day: string, hourIdx: number) => {
    const raw = baseTrafficMatrix[day][hourIdx];
    if (selectedHeatmapDept === 'Cardiology') return Math.round(raw * 0.35);
    if (selectedHeatmapDept === 'Pediatrics') return Math.round(raw * 0.40);
    if (selectedHeatmapDept === 'Orthopedics') return Math.round(raw * 0.25);
    if (selectedHeatmapDept === 'Emergency & ICU') return Math.round(raw * 0.20 + 8);
    return raw;
  };

  const getHeatmapBg = (count: number) => {
    if (count >= 38) return 'bg-rose-500 text-white font-extrabold shadow-md shadow-rose-500/20 ring-2 ring-rose-400 dark:ring-rose-500';
    if (count >= 25) return 'bg-cyan-600 text-white font-bold shadow-sm';
    if (count >= 15) return 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-900 dark:text-cyan-200 font-semibold border border-cyan-200 dark:border-cyan-800';
    if (count >= 6) return 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-medium';
    return 'bg-slate-50 dark:bg-slate-900 text-slate-400 opacity-60';
  };

  const totalPatients = patients.length;
  const totalDoctors = doctors.length;
  const totalAppointments = appointments.length;
  const totalRevenue = invoices.filter(i => i.paymentStatus === 'Paid').reduce((sum, i) => sum + i.totalAmount, 0);

  // Monitor lab orders for abnormal or critical laboratory values
  const allCriticalOrders = (labOrders || []).filter(order => {
    const hasAbnormalValue = order.resultValues?.some(
      v => v.flag === 'Critical' || v.flag === 'High' || v.flag === 'Low'
    );
    const hasAbnormalText = order.resultSummary && (
      order.resultSummary.toLowerCase().includes('critical') ||
      order.resultSummary.toLowerCase().includes('abnormal') ||
      order.resultSummary.toLowerCase().includes('elevated') ||
      order.resultSummary.toLowerCase().includes('hyperkalemia')
    );
    return hasAbnormalValue || hasAbnormalText;
  });

  const activeCriticalOrders = allCriticalOrders.filter(
    order => !acknowledgedAlerts.includes(order.id)
  );

  const hasAbnormalValues = activeCriticalOrders.length > 0;

  const handleSimulateAbnormalResult = async () => {
    setSimulating(true);
    const simId = `sim-lab-${Date.now()}`;
    const randomPatient = patients[0] || { id: 'pat-1', name: 'Sophia Martinez' };
    const randomDoc = doctors[0] || { id: 'doc-1', name: 'Dr. Robert Chen' };

    try {
      if (placeLabOrder) {
        await placeLabOrder({
          id: simId,
          patientId: randomPatient.id,
          patientName: randomPatient.name,
          doctorId: randomDoc.id,
          doctorName: randomDoc.name,
          testId: 'labt-stat-1',
          testName: 'STAT Arterial Blood Gas (ABG) & Electrolytes',
          orderDate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Completed',
          resultSummary: 'CRITICAL: Severe Metabolic Acidosis with pH 7.18, Lactate 5.4 mmol/L.',
          resultValues: [
            { parameter: 'Blood pH', value: '7.18', normalRange: '7.35 - 7.45', flag: 'Critical' },
            { parameter: 'Blood Lactate', value: '5.4 mmol/L', normalRange: '0.5 - 2.2 mmol/L', flag: 'High' },
            { parameter: 'HCO3 (Bicarbonate)', value: '14 mEq/L', normalRange: '22 - 29 mEq/L', flag: 'Low' }
          ],
          technicianNotes: 'STAT result telephoned immediately to ICU attending physician.'
        });
      }
    } catch (err) {
      console.error('Error simulating STAT lab:', err);
    } finally {
      setTimeout(() => setSimulating(false), 500);
    }
  };

  const handleAcknowledge = (id: string) => {
    setAcknowledgedAlerts(prev => [...prev, id]);
  };

  const handleDownloadPdfReport = () => {
    setExportingPdf(true);
    try {
      const doc = new jsPDF();
      const timestamp = new Date().toLocaleString();

      // Top Banner Background Header (Dark Navy)
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 32, 'F');

      // Title & Branding
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(15);
      doc.setFont('helvetica', 'bold');
      doc.text('SMART HOSPITAL OS — EXECUTIVE TELEMETRY REPORT', 14, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(`Generated: ${timestamp} | Role: ${activeRole} | System Status: ONLINE`, 14, 26);

      let y = 42;

      // 1. KPI Statistics Summary
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Hospital Key Performance Indicators (KPIs)', 14, y);
      y += 6;

      const kpiItems = [
        { label: 'Total Patients', val: `${totalPatients}` },
        { label: 'Active Doctors', val: `${totalDoctors}` },
        { label: 'Appointments', val: `${totalAppointments}` },
        { label: 'Total Revenue', val: `$${totalRevenue.toLocaleString()}` }
      ];

      doc.setFontSize(9);
      kpiItems.forEach((kpi, idx) => {
        const x = 14 + idx * 46;
        doc.setFillColor(241, 245, 249);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(x, y, 42, 18, 2, 2, 'FD');

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 116, 139);
        doc.text(kpi.label, x + 3, y + 6);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(15, 23, 42);
        doc.text(kpi.val, x + 3, y + 14);
      });

      y += 26;

      // 2. Critical Pathology & Laboratory Telemetry
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(220, 38, 38);
      doc.text(`2. Active Critical Laboratory Alerts (${allCriticalOrders.length} Detected)`, 14, y);
      y += 8;

      if (allCriticalOrders.length === 0) {
        doc.setFillColor(240, 253, 244);
        doc.setDrawColor(187, 247, 208);
        doc.roundedRect(14, y, 182, 14, 2, 2, 'FD');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 101, 52);
        doc.text('✓ Telemetry Nominal: All completed pathology tests are within normal reference range.', 18, y + 9);
        y += 20;
      } else {
        allCriticalOrders.forEach((order) => {
          if (y > 245) {
            doc.addPage();
            y = 20;
          }

          const isUnack = activeCriticalOrders.some(a => a.id === order.id);

          doc.setFillColor(isUnack ? 254 : 248, isUnack ? 242 : 250, isUnack ? 242 : 252);
          doc.setDrawColor(isUnack ? 239 : 226, isUnack ? 68 : 232, isUnack ? 68 : 240);
          doc.roundedRect(14, y, 182, 32, 2, 2, 'FD');

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(185, 28, 28);
          doc.text(`[CRITICAL] ${order.testName}`, 18, y + 7);

          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(71, 85, 105);
          doc.text(`Patient: ${order.patientName} | Attending: ${order.doctorName} | Date: ${order.orderDate}`, 18, y + 13);

          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          doc.setTextColor(15, 23, 42);
          const splitSummary = doc.splitTextToSize(`Findings: ${order.resultSummary}`, 174);
          doc.text(splitSummary, 18, y + 19);

          if (order.resultValues && order.resultValues.length > 0) {
            const valStr = order.resultValues.map(v => `${v.parameter}: ${v.value} [${v.flag}]`).join(' | ');
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(220, 38, 38);
            doc.text(`Critical Values: ${valStr}`, 18, y + 27);
          }

          y += 36;
        });
      }

      // 3. Department Bed Capacity & Occupancy
      if (y > 230) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('3. Department Bed Occupancy Telemetry', 14, y);
      y += 8;

      departments.forEach((dept) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        const percent = Math.round((dept.occupiedBeds / dept.totalBeds) * 100);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(`${dept.name}: ${dept.occupiedBeds} / ${dept.totalBeds} beds occupied (${percent}%)`, 14, y);

        // Progress bar background
        doc.setFillColor(226, 232, 240);
        doc.rect(110, y - 3, 80, 4, 'F');
        // Progress fill
        doc.setFillColor(percent > 85 ? 220 : 14, percent > 85 ? 38 : 165, percent > 85 ? 38 : 233);
        doc.rect(110, y - 3, Math.min(80, (80 * percent) / 100), 4, 'F');

        y += 7;
      });

      // Page Footer
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('Smart Hospital OS • Confidential Clinical & Administrative Report • NABH & ISO 27001 Accredited', 14, 286);

      doc.save(`Smart_Hospital_Executive_Report_${Date.now()}.pdf`);
    } catch (err) {
      console.error('Error generating PDF report:', err);
    } finally {
      setTimeout(() => setExportingPdf(false), 500);
    }
  };

  const revenueData = analytics?.revenueByMonth || [
    { month: 'Jan', revenue: 42000, patients: 120 },
    { month: 'Feb', revenue: 48000, patients: 145 },
    { month: 'Mar', revenue: 53000, patients: 160 },
    { month: 'Apr', revenue: 49000, patients: 150 },
    { month: 'May', revenue: 61000, patients: 180 },
    { month: 'Jun', revenue: 68000, patients: 210 },
    { month: 'Jul', revenue: 74000, patients: 235 },
    { month: 'Aug', revenue: Math.round(totalRevenue + 55000), patients: totalPatients * 15 }
  ];

  const deptData = departments.map(d => ({
    name: d.name.split(' ')[0],
    beds: d.occupiedBeds,
    capacity: d.totalBeds
  }));

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-white shadow-xl shadow-cyan-500/15 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{activeRole} Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Administrator'}
            </h1>
            <p className="text-xs sm:text-sm text-cyan-100 mt-1 max-w-xl">
              Live telemetry online. 120 bed telemetry units reporting optimal status.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPdfReport}
              disabled={exportingPdf}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              title="Download Executive PDF Telemetry Report"
            >
              <Download className={`w-4 h-4 ${exportingPdf ? 'animate-bounce' : ''}`} />
              <span>{exportingPdf ? 'Generating PDF...' : 'Download Report'}</span>
            </button>
            <button
              onClick={() => onGoToTab('appointments')}
              className="px-4 py-2 bg-white text-cyan-700 hover:bg-cyan-50 font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book Appointment</span>
            </button>
            <button
              onClick={() => onGoToTab('ai-assistant')}
              className="px-4 py-2 bg-cyan-900/60 hover:bg-cyan-900 text-white border border-white/20 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>AI Triage</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Laboratory Critical Alerts Monitor Section */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden shadow-xl ${
        hasAbnormalValues
          ? 'bg-slate-900 border-red-500/80 shadow-red-500/20 ring-2 ring-red-500/40'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
      }`}>
        {/* Pulsing Ambient Background Glow when abnormal values are detected */}
        {hasAbnormalValues && (
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-amber-500/5 to-transparent animate-pulse pointer-events-none" />
        )}

        <div className="relative z-10 space-y-4">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                hasAbnormalValues
                  ? 'bg-red-500/20 text-red-500 border border-red-500/40 animate-pulse'
                  : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20'
              }`}>
                {hasAbnormalValues ? (
                  <ShieldAlert className="w-5 h-5 animate-bounce" />
                ) : (
                  <FlaskConical className="w-5 h-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Laboratory Critical Alerts Monitor
                  </h2>
                  {hasAbnormalValues ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-extrabold uppercase animate-pulse">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      <span>{activeCriticalOrders.length} Abnormal Detected</span>
                    </div>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase">
                      All Reference Normal
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Continuous telemetry monitoring of pathology & STAT lab result flags
                </p>
              </div>
            </div>

            {/* Top Action Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDownloadPdfReport}
                disabled={exportingPdf}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Export Critical Alerts & Stats as PDF"
              >
                <Download className={`w-3.5 h-3.5 ${exportingPdf ? 'animate-bounce' : ''}`} />
                <span>Export PDF</span>
              </button>

              <button
                onClick={handleSimulateAbnormalResult}
                disabled={simulating}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="Simulate incoming STAT critical result"
              >
                <Zap className={`w-3.5 h-3.5 text-amber-400 ${simulating ? 'animate-spin' : ''}`} />
                <span>Simulate STAT Result</span>
              </button>

              <button
                onClick={() => onGoToTab('laboratory')}
                className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Open Lab Portal</span>
              </button>
            </div>
          </div>

          {/* Alert Content List */}
          {hasAbnormalValues ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {activeCriticalOrders.map((order) => {
                const criticalVals = order.resultValues?.filter(
                  v => v.flag === 'Critical' || v.flag === 'High' || v.flag === 'Low'
                ) || [];

                return (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-red-500/50 shadow-lg shadow-red-500/10 flex flex-col justify-between space-y-3 relative overflow-hidden transition-all hover:border-red-400"
                  >
                    {/* Top Pulsing Warning Badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2.5 w-2.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                        <div>
                          <h4 className="font-bold text-xs text-white leading-tight">{order.testName}</h4>
                          <p className="text-[10px] text-slate-400">Patient: <span className="text-cyan-300 font-semibold">{order.patientName}</span> • Doc: {order.doctorName}</p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-md bg-red-600/30 text-red-300 border border-red-500/40 text-[9px] font-black uppercase tracking-wider shrink-0 animate-pulse">
                        CRITICAL VALUE
                      </span>
                    </div>

                    {/* Parameter Values Box */}
                    {criticalVals.length > 0 ? (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                        {criticalVals.map((val, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-slate-300 font-medium">{val.parameter}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500 text-[10px]">(Ref: {val.normalRange})</span>
                              <span className={`px-2 py-0.5 rounded font-mono font-extrabold text-[11px] ${
                                val.flag === 'Critical'
                                  ? 'bg-red-500 text-white animate-pulse'
                                  : val.flag === 'High'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              }`}>
                                {val.value} [{val.flag}]
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-amber-300 bg-amber-950/40 p-2.5 rounded-xl border border-amber-800/50 leading-relaxed">
                        {order.resultSummary}
                      </p>
                    )}

                    {/* Summary Findings */}
                    <p className="text-[11px] text-slate-400 leading-snug italic border-l-2 border-red-500/60 pl-2">
                      "{order.resultSummary}"
                    </p>

                    {/* Action Buttons Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <span className="text-[10px] text-slate-500">{order.orderDate}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            triggerEmergencyAlert(
                              `Critical Lab Alert: ${order.testName}`,
                              `Abnormal value detected for ${order.patientName}. Attending: ${order.doctorName}.`
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          Dispatch Alert
                        </button>
                        <button
                          onClick={() => handleAcknowledge(order.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-medium transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Laboratory Telemetry Nominal
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    All completed pathology panels are within normal biological baseline values.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSimulateAbnormalResult}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
              >
                Test Alert Trigger
              </button>
            </div>
          )}

        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Hospital Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">${totalRevenue.toLocaleString()}</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% from last month</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Total Patients</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totalPatients}</p>
          <p className="text-[11px] text-slate-500 mt-1">Active registered patient records</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Available Doctors</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totalDoctors}</p>
          <p className="text-[11px] text-slate-500 mt-1">Across 5 specialized units</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
            <span>Bed Telemetry Rate</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">78%</p>
          <p className="text-[11px] text-slate-500 mt-1">140 / 180 total beds occupied</p>
        </div>

      </div>

      {/* Patient Real-Time Vitals Telemetry Chart Component */}
      <PatientVitalsChart
        patients={patients}
        onTriggerEmergencyAlert={triggerEmergencyAlert}
      />

      {/* Interactive Hospital Floor & Bed Telemetry Map */}
      <HospitalFloorMap />

      {/* Hospital Consultation Peak Traffic Heatmap */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 text-amber-500 animate-bounce" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>Peak Consultation Hours Heatmap</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-800">
                  TRAFFIC DENSITY
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualizing patient consultation load by hour & day of the week to optimize physician shift scheduling
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedHeatmapDept}
              onChange={(e) => setSelectedHeatmapDept(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All Departments">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Emergency & ICU">Emergency & ICU</option>
            </select>
          </div>
        </div>

        {/* Heatmap Key Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Clock className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Busiest Hour Slot</span>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">10:00 AM – 12:00 PM</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Flame className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Peak Traffic Day</span>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">Wednesdays (48 Consults)</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <Users className="w-5 h-5 text-cyan-500 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Avg Daily Load</span>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white">172 OPD Patients / day</span>
            </div>
          </div>
        </div>

        {/* Heatmap Matrix Table */}
        <div className="overflow-x-auto pt-2">
          <div className="min-w-[650px] space-y-2">
            {/* Hour Headers Row */}
            <div className="grid grid-cols-8 gap-2 text-center text-xs font-bold text-slate-400 pb-1 border-b border-slate-100 dark:border-slate-800">
              <div className="text-left text-[11px] text-slate-500 pl-2">Day \ Time</div>
              {timeSlots.map(slot => (
                <div key={slot} className="text-[11px]">{slot}</div>
              ))}
            </div>

            {/* Matrix Rows */}
            {daysOfWeek.map(day => (
              <div key={day} className="grid grid-cols-8 gap-2 items-center">
                <div className="font-extrabold text-xs text-slate-800 dark:text-slate-200 pl-2">
                  {day}
                </div>
                {timeSlots.map((slot, idx) => {
                  const count = getTrafficCount(day, idx);
                  return (
                    <div
                      key={slot}
                      onMouseEnter={() => setHoveredCell({ day, time: slot, count })}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-11 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer relative ${getHeatmapBg(count)}`}
                    >
                      <span className="text-xs">{count}</span>
                      <span className="text-[9px] opacity-80 font-normal">pts</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Tooltip Banner or Legend Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          {hoveredCell ? (
            <div className="p-2 px-3 rounded-xl bg-slate-900 text-white dark:bg-slate-800 font-medium text-xs flex items-center gap-2 animate-fadeIn w-full sm:w-auto">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>
                <strong className="text-cyan-300">{hoveredCell.day} at {hoveredCell.time}</strong>: {hoveredCell.count} consultations expected ({hoveredCell.count >= 38 ? 'Critical Peak Demand' : hoveredCell.count >= 25 ? 'High Volume' : 'Normal Load'}).
              </span>
            </div>
          ) : (
            <span className="text-slate-400 italic text-[11px]">Hover over any heatmap block to inspect hourly patient density.</span>
          )}

          {/* Color Intensity Scale Legend */}
          <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-500 shrink-0">
            <span className="text-slate-400">Traffic:</span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200" /> Low (&lt;15)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-cyan-200 dark:bg-cyan-950" /> Med (15-24)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-cyan-600" /> High (25-37)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-rose-500" /> Peak (38+)
            </span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Revenue & Patient Trends</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monthly billing vs patient admission volume</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              2026 Telemetry
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0891b2" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0891b2" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Bed Capacity Bar Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Bed Telemetry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Occupancy vs Capacity per Dept</p>
            </div>
            <Building2 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="beds" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                <Bar dataKey="capacity" fill="#334155" opacity={0.3} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};

