import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus, Search, HeartPulse, Activity, User, Calendar, FileDown, CheckCircle2, X } from 'lucide-react';
import { MedicalRecord } from '../types';

export const MedicalRecordsManager: React.FC = () => {
  const { medicalRecords, patients, doctors, addMedicalRecord, searchQuery, setSearchQuery } = useHospital();
  const { activeRole } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [patientId, setPatientId] = useState(patients[0]?.id || 'pat-1');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || 'doc-1');
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [bloodPressure, setBloodPressure] = useState('120/80 mmHg');
  const [heartRate, setHeartRate] = useState(72);
  const [temperature, setTemperature] = useState(98.6);
  const [oxygenLevel, setOxygenLevel] = useState(99);
  const [weightKg, setWeightKg] = useState(70);

  const filteredRecords = medicalRecords.filter(rec => {
    return rec.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           rec.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           rec.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === patientId);
    const doc = doctors.find(d => d.id === doctorId);

    await addMedicalRecord({
      patientId,
      patientName: pat?.name || 'Sophia Martinez',
      doctorId,
      doctorName: doc?.name || 'Dr. Robert Chen',
      visitDate: new Date().toISOString().substring(0, 10),
      diagnosis,
      clinicalNotes,
      vitals: {
        bloodPressure,
        heartRate: Number(heartRate),
        temperature: Number(temperature),
        oxygenLevel: Number(oxygenLevel),
        weightKg: Number(weightKg)
      },
      allergiesNoted: []
    });

    setShowAddModal(false);
    setDiagnosis('');
    setClinicalNotes('');
  };

  const exportMedicalPDF = (rec: MedicalRecord) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Smart Hospital Management System', 14, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('ELECTRONIC HEALTH RECORD (EHR) CONSULTATION SUMMARY', 14, 28);
    doc.line(14, 32, 196, 32);

    doc.setFontSize(10);
    doc.text(`Record ID: ${rec.id}`, 14, 42);
    doc.text(`Visit Date: ${rec.visitDate}`, 14, 48);

    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT & CLINICIAN', 14, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient Name: ${rec.patientName}`, 14, 66);
    doc.text(`Attending Physician: Dr. ${rec.doctorName}`, 14, 72);

    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT VITALS TELEMETRY', 14, 84);
    doc.setFont('helvetica', 'normal');
    doc.text(`Blood Pressure: ${rec.vitals.bloodPressure}`, 14, 90);
    doc.text(`Heart Rate: ${rec.vitals.heartRate} bpm`, 14, 96);
    doc.text(`Body Temperature: ${rec.vitals.temperature} °F`, 14, 102);
    doc.text(`Blood Oxygen (SpO2): ${rec.vitals.oxygenLevel}%`, 14, 108);

    doc.setFont('helvetica', 'bold');
    doc.text('CLINICAL DIAGNOSIS', 14, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(`Diagnosis: ${rec.diagnosis}`, 14, 126);

    doc.setFont('helvetica', 'bold');
    doc.text('PHYSICIAN CLINICAL NOTES', 14, 138);
    doc.setFont('helvetica', 'normal');
    doc.text(rec.clinicalNotes, 14, 144, { maxWidth: 170 });

    doc.save(`EHR_Record_${rec.patientName}_${rec.visitDate}.pdf`);
  };

  const canEdit = activeRole === 'Super Admin' || activeRole === 'Hospital Admin' || activeRole === 'Doctor';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Electronic Health Records (EHR) & Vitals
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Clinical history, diagnostic findings, vital sign telemetry, and downloadable EHR summaries.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>New Clinical Encounter</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search patient EHR, diagnosis, or attending physician..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Records Feed Cards */}
      <div className="space-y-4">
        {filteredRecords.map(rec => (
          <div key={rec.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                  Encounter: {rec.visitDate}
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Patient: {rec.patientName}
                </span>
                <span className="text-xs text-slate-500">
                  Attending: Dr. {rec.doctorName}
                </span>
              </div>

              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{rec.diagnosis}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  "{rec.clinicalNotes}"
                </p>
              </div>

              {/* Vitals Ribbon */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-1">
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <HeartPulse className="w-4 h-4" />
                  <span>BP: {rec.vitals.bloodPressure}</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <Activity className="w-4 h-4" />
                  <span>HR: {rec.vitals.heartRate} bpm</span>
                </div>
                <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                  <span>Temp: {rec.vitals.temperature} °F</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span>SpO2: {rec.vitals.oxygenLevel}%</span>
                </div>
              </div>
            </div>

            <div className="flex md:flex-col items-end justify-between gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-6">
              <button
                onClick={() => exportMedicalPDF(rec)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950 text-cyan-700 dark:text-cyan-400 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileDown className="w-4 h-4" />
                <span>Export PDF Summary</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* New Encounter Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Record EHR Clinical Encounter</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Patient</label>
                  <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Physician</label>
                  <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Primary Diagnosis</label>
                <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Acute Upper Respiratory Tract Infection" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Blood Pressure</label>
                  <input type="text" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} className="w-full px-2 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Heart Rate</label>
                  <input type="number" value={heartRate} onChange={(e) => setHeartRate(Number(e.target.value))} className="w-full px-2 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">Temp (°F)</label>
                  <input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))} className="w-full px-2 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold mb-1">SpO2 %</label>
                  <input type="number" value={oxygenLevel} onChange={(e) => setOxygenLevel(Number(e.target.value))} className="w-full px-2 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Clinical Encounter Notes</label>
                <textarea value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} placeholder="Detailed doctor observations..." className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white h-20" required />
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                Save EHR Record Entry
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
