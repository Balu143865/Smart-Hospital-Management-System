import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { FileSpreadsheet, Plus, Search, FileDown, Pill, Clock, CheckCircle2, X } from 'lucide-react';
import { Prescription } from '../types';

export const PrescriptionsManager: React.FC = () => {
  const { prescriptions, patients, doctors, addPrescription, searchQuery, setSearchQuery } = useHospital();
  const { activeRole } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [patientId, setPatientId] = useState(patients[0]?.id || 'pat-1');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || 'doc-1');
  const [diagnosis, setDiagnosis] = useState('Upper Respiratory Infection');
  const [medicationName, setMedicationName] = useState('Amoxicillin 500mg');
  const [dosage, setDosage] = useState('1 Tablet');
  const [frequency, setFrequency] = useState('TID (3x daily)');
  const [durationDays, setDurationDays] = useState(5);
  const [instructions, setInstructions] = useState('Complete full antibiotic course even if feeling better.');

  const filteredRx = prescriptions.filter(rx => {
    return rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           rx.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           rx.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreateRx = async (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === patientId);
    const doc = doctors.find(d => d.id === doctorId);

    await addPrescription({
      patientId,
      patientName: pat?.name || 'Sophia Martinez',
      doctorId,
      doctorName: doc?.name || 'Dr. Robert Chen',
      date: new Date().toISOString().substring(0, 10),
      diagnosis,
      medicines: [
        {
          id: `med-${Date.now()}`,
          name: medicationName,
          dosage,
          frequency,
          durationDays: Number(durationDays),
          instructions
        }
      ],
      generalInstructions: instructions,
      status: 'Prescribed'
    });

    setShowAddModal(false);
  };

  const exportRxPDF = (rx: Prescription) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Smart Hospital Management System', 14, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL DIGITAL PRESCRIPTION (Rx)', 14, 28);
    doc.line(14, 32, 196, 32);

    doc.setFontSize(10);
    doc.text(`Prescription ID: ${rx.id}`, 14, 42);
    doc.text(`Issued Date: ${rx.date}`, 14, 48);

    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT & PRESCRIBER', 14, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient Name: ${rx.patientName}`, 14, 66);
    doc.text(`Prescribing Physician: Dr. ${rx.doctorName}`, 14, 72);
    doc.text(`Diagnosis: ${rx.diagnosis}`, 14, 78);

    doc.setFont('helvetica', 'bold');
    doc.text('MEDICATION RX DETAILS', 14, 90);
    doc.setFont('helvetica', 'normal');

    let y = 98;
    rx.medicines.forEach((med, idx) => {
      doc.text(`${idx + 1}. ${med.name} (${med.dosage})`, 14, y);
      doc.text(`Freq: ${med.frequency} | Duration: ${med.durationDays} Days`, 14, y + 6);
      doc.text(`Notes: ${med.instructions}`, 14, y + 12);
      y += 20;
    });

    doc.setFont('helvetica', 'bold');
    doc.text('GENERAL INSTRUCTIONS', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(rx.generalInstructions, 14, y + 6, { maxWidth: 170 });

    doc.save(`Prescription_Rx_${rx.patientName}_${rx.date}.pdf`);
  };

  const canEdit = activeRole === 'Super Admin' || activeRole === 'Hospital Admin' || activeRole === 'Doctor';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Digital Prescriptions (Rx) Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Issue electronic prescriptions with dosage schedules, pharmacy dispensing status, and downloadable PDF slips.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Issue Digital Rx</span>
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
          placeholder="Search patient, diagnosis, or physician..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Mobile Card List */}
      <div className="block sm:hidden space-y-3">
        {filteredRx.map(rx => (
          <div key={rx.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">{rx.patientName}</p>
                <p className="text-[10px] text-slate-400">Issued: {rx.date} • Dr. {rx.doctorName}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                rx.status === 'Dispensed'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
              }`}>
                {rx.status}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl space-y-1 text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Diagnosis & Prescribed Medicines</span>
              <p className="font-bold text-cyan-600 dark:text-cyan-400">{rx.diagnosis}</p>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                {rx.medicines.map(m => (
                  <li key={m.id}>{m.name} ({m.dosage}) — {m.frequency}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <button
                onClick={() => exportRxPDF(rx)}
                className="px-3 py-1.5 text-xs font-semibold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <FileDown className="w-3.5 h-3.5" /> Download Rx PDF
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Prescriptions Table */}
      <div className="hidden sm:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Diagnosis & Medicines</th>
                <th className="py-3 px-4">Prescribed By</th>
                <th className="py-3 px-4">Pharmacy Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRx.map(rx => (
                <tr key={rx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {rx.patientName}
                    <span className="block text-[10px] text-slate-400 font-normal">Issued: {rx.date}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <p className="font-bold text-cyan-600 dark:text-cyan-400">{rx.diagnosis}</p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                      {rx.medicines.map(m => (
                        <li key={m.id}>{m.name} ({m.dosage}) — {m.frequency}</li>
                      ))}
                    </ul>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                    Dr. {rx.doctorName}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      rx.status === 'Dispensed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                    }`}>
                      {rx.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => exportRxPDF(rx)}
                      className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="Download PDF Prescription"
                    >
                      <FileDown className="w-4 h-4 text-cyan-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Issue Digital Prescription (Rx)</h3>

            <form onSubmit={handleCreateRx} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Patient</label>
                  <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                    {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Prescribing Physician</label>
                  <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                    {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Diagnosis</label>
                <input type="text" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Acute Bronchitis" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Medication Name</label>
                <input type="text" value={medicationName} onChange={(e) => setMedicationName(e.target.value)} placeholder="Amoxicillin 500mg" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Dosage</label>
                  <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="1 Tablet" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Frequency</label>
                  <input type="text" value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="TID (3x daily)" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Duration (Days)</label>
                  <input type="number" value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Pharmacy Instructions</label>
                <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Special patient instructions..." className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white h-20" required />
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                Issue Digital Prescription
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
