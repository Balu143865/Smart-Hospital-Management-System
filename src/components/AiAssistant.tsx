import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { Sparkles, Send, AlertTriangle, ShieldCheck, HeartPulse, Stethoscope, CheckCircle2, User } from 'lucide-react';

export const AiAssistant: React.FC = () => {
  const { analyzeSymptoms } = useHospital();

  const [symptomsInput, setSymptomsInput] = useState('');
  const [patientAge, setPatientAge] = useState<number>(45);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const presets = [
    'Substernal crushing chest pain radiating to left jaw, diaphoresis, shortness of breath',
    'High grade fever 102F, dry cough, loss of smell, fatigue for 3 days',
    'Sudden onset severe right lower quadrant abdominal pain, nausea, low grade fever',
    'Persistent throbbing headache, blurred vision, elevated BP 160/100 mmHg'
  ];

  const handleRunTriage = async (textToAnalyze?: string) => {
    const query = textToAnalyze || symptomsInput;
    if (!query.trim()) return;

    setLoading(true);
    setAnalysisResult(null);

    const res = await analyzeSymptoms(query, patientAge, gender);
    setAnalysisResult(res);
    setLoading(false);
  };

  const getPriorityColor = (level?: string) => {
    switch (level) {
      case 'Emergency': return 'bg-rose-500 text-white animate-pulse';
      case 'Urgent': return 'bg-amber-500 text-white';
      case 'Routine': return 'bg-cyan-600 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950 to-blue-950 text-white border border-cyan-800/40 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Gemini 2.5 Flash Clinical Triage Engine
            </h2>
            <p className="text-xs text-cyan-200">
              Server-side AI symptom analysis, differential diagnosis, & recommended triage urgency
            </p>
          </div>
        </div>
      </div>

      {/* Input Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Patient Parameters */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Patient Age</label>
            <input
              type="number"
              value={patientAge}
              onChange={(e) => setPatientAge(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Symptoms Presets */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">Sample Symptom Cases (Click to Test):</label>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSymptomsInput(p);
                  handleRunTriage(p);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 transition-colors text-left truncate max-w-xs cursor-pointer"
              >
                "{p}"
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Chief Complaints & Vital Symptoms</label>
          <textarea
            value={symptomsInput}
            onChange={(e) => setSymptomsInput(e.target.value)}
            placeholder="e.g. Severe chest pain, shortness of breath, high blood pressure..."
            className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white h-28 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <button
          onClick={() => handleRunTriage()}
          disabled={loading || !symptomsInput.trim()}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <span>Analyzing Clinical Telemetry via Gemini AI...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run AI Triage & Differential Diagnosis</span>
            </>
          )}
        </button>

      </div>

      {/* AI Analysis Result Output */}
      {analysisResult && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-5 animate-fade-in">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center font-bold">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">AI Clinical Triage Report</h3>
                <p className="text-xs text-slate-500">Engine Model: Gemini 2.5 Flash</p>
              </div>
            </div>

            <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${getPriorityColor(analysisResult.priorityLevel)}`}>
              Triage Level: {analysisResult.priorityLevel}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Recommended Specialist */}
            <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800">
              <span className="text-[10px] uppercase font-bold text-cyan-600 dark:text-cyan-400 block mb-1">Recommended Specialist Wing</span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">{analysisResult.recommendedDepartment}</p>
            </div>

            {/* Differential Diagnoses */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Possible Differential Diagnoses:</h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.possibleConditions?.map((cond: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold border border-slate-200 dark:border-slate-700">
                    • {cond}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Actions */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-2">Recommended Immediate Actions:</h4>
              <ul className="space-y-1 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                {analysisResult.recommendedActions?.map((act: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clinical Reasoning */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white mb-1">Clinical Telemetry Reasoning:</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-mono bg-slate-100 dark:bg-slate-800 p-3 rounded-xl text-[11px]">
                {analysisResult.summary}
              </p>
            </div>

            <p className="text-[10px] text-slate-400 italic text-center pt-2">
              ⚠️ Medical Disclaimer: AI Triage results are generated for decision-support only and must be validated by a licensed physician.
            </p>

          </div>

        </div>
      )}

    </div>
  );
};
