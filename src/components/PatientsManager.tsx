import React, { useState, useRef } from 'react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { ProfileAvatarUpload } from './ProfileAvatarUpload';
import { PatientQrCheckIn } from './PatientQrCheckIn';
import {
  Search, Plus, User, Heart, AlertCircle, Phone, MapPin, X, FileText, CheckCircle2,
  Upload, Camera, Sparkles, Stethoscope, AlertTriangle, Activity, Clock, ShieldCheck,
  Send, Calendar, FlaskConical, ArrowRight, Bot, Check, HeartPulse, QrCode
} from 'lucide-react';
import { Patient } from '../types';

export const PatientsManager: React.FC = () => {
  const {
    patients, addPatient, medicalRecords, prescriptions, searchQuery, setSearchQuery,
    analyzeSymptoms, addMedicalRecord, placeLabOrder
  } = useHospital();
  const { activeRole } = useAuth();
  
  // Tab State
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'qr-checkin' | 'symptom-checker'>('directory');
  const [selectedPatientForQrId, setSelectedPatientForQrId] = useState<string | undefined>(undefined);

  // EHR Directory State
  const [bloodFilter, setBloodFilter] = useState<string>('All');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Patient Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [allergies, setAllergies] = useState('Penicillin');
  const [chronicDiseases, setChronicDiseases] = useState('None');
  const [admittedStatus, setAdmittedStatus] = useState<'Outpatient' | 'Inpatient (Ward)' | 'ICU'>('Outpatient');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150');

  // AI Symptom Checker State
  const [selectedPatientIdForAi, setSelectedPatientIdForAi] = useState<string>('custom');
  const [symptomsInput, setSymptomsInput] = useState('');
  const [symptomOnset, setSymptomOnset] = useState('Sudden (<2 hours)');
  const [severityScale, setSeverityScale] = useState<number>(6);
  const [selectedAssociatedSymptoms, setSelectedAssociatedSymptoms] = useState<string[]>(['Fever', 'Shortness of Breath']);
  const [patientAgeInput, setPatientAgeInput] = useState<number>(38);
  const [genderInput, setGenderInput] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [medicalHistoryInput, setMedicalHistoryInput] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [savedToEhrSuccess, setSavedToEhrSuccess] = useState(false);
  const [labOrderedSuccess, setLabOrderedSuccess] = useState<string | null>(null);

  const presets = [
    'Substernal crushing chest pain radiating to left jaw, diaphoresis, shortness of breath',
    'High grade fever 102.5°F, dry cough, loss of smell, fatigue for 3 days',
    'Sudden onset severe right lower quadrant abdominal pain, nausea, low grade fever',
    'Persistent throbbing unilateral headache, blurred vision, elevated BP 160/100 mmHg',
    'Child with barking cough, inspiratory stridor, low-grade fever'
  ];

  const associatedOptions = [
    'Fever / Chills',
    'Nausea / Vomiting',
    'Dizziness / Lightheadedness',
    'Shortness of Breath',
    'Sweating (Diaphoresis)',
    'Chest Pain / Tightness',
    'Fatigue / Weakness'
  ];

  const handleSelectPatientForAi = (patientId: string) => {
    setSelectedPatientIdForAi(patientId);
    if (patientId === 'custom') {
      setPatientAgeInput(30);
      setGenderInput('Male');
      setMedicalHistoryInput('');
    } else {
      const found = patients.find(p => p.id === patientId);
      if (found) {
        setPatientAgeInput(found.age);
        setGenderInput(found.gender as any);
        const historyText = [
          found.allergies?.length ? `Allergies: ${found.allergies.join(', ')}` : '',
          found.chronicDiseases?.length ? `Chronic: ${found.chronicDiseases.join(', ')}` : '',
          `Blood Group: ${found.bloodGroup}`
        ].filter(Boolean).join('. ');
        setMedicalHistoryInput(historyText);
      }
    }
  };

  const toggleAssociatedSymptom = (item: string) => {
    setSelectedAssociatedSymptoms(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleRunTriage = async (customSymptomsText?: string) => {
    const rawSymptoms = customSymptomsText || symptomsInput;
    if (!rawSymptoms.trim()) return;

    setLoadingAi(true);
    setAiResult(null);
    setSavedToEhrSuccess(false);

    const fullSymptomPayload = `${rawSymptoms.trim()} [Onset: ${symptomOnset}, Severity: ${severityScale}/10. Associated: ${selectedAssociatedSymptoms.join(', ') || 'None'}]`;

    if (analyzeSymptoms) {
      const res = await analyzeSymptoms(fullSymptomPayload, patientAgeInput, genderInput, medicalHistoryInput);
      setAiResult(res);
    }
    setLoadingAi(false);
  };

  const handleSaveToEhr = async () => {
    if (!aiResult) return;
    const targetPatientId = selectedPatientIdForAi !== 'custom' ? selectedPatientIdForAi : (patients[0]?.id || 'PAT-101');
    const targetPatientName = patients.find(p => p.id === targetPatientId)?.name || 'Walk-In Patient';

    await addMedicalRecord({
      patientId: targetPatientId,
      patientName: targetPatientName,
      doctorName: 'Gemini AI Assistant',
      diagnosis: aiResult.possibleCondition || aiResult.possibleConditions?.[0] || 'AI Symptom Triage Assessment',
      visitDate: new Date().toISOString().split('T')[0],
      clinicalNotes: `[AI Triage Level: ${aiResult.urgencyLevel || aiResult.priorityLevel || 'Routine'}] Recommended Dept: ${aiResult.recommendedDepartment}. Advice: ${aiResult.initialAdvice || aiResult.summary}`,
      treatmentPlan: `Suggested Lab Panels: ${(aiResult.suggestedLabTests || []).join(', ')}`
    });

    setSavedToEhrSuccess(true);
    setTimeout(() => setSavedToEhrSuccess(false), 4000);
  };

  const handleQuickOrderLab = async (testName: string) => {
    const targetPatientId = selectedPatientIdForAi !== 'custom' ? selectedPatientIdForAi : (patients[0]?.id || 'PAT-101');
    const targetPatientName = patients.find(p => p.id === targetPatientId)?.name || 'Walk-In Patient';

    await placeLabOrder({
      patientId: targetPatientId,
      patientName: targetPatientName,
      testName,
      orderedBy: 'Gemini AI Triage System',
      orderDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      urgency: (aiResult?.urgencyLevel?.includes('Emergency') || aiResult?.priorityLevel === 'Emergency') ? 'Emergency' : 'Standard'
    });

    setLabOrderedSuccess(testName);
    setTimeout(() => setLabOrderedSuccess(null), 3000);
  };

  const filteredPatients = patients.filter(pat => {
    const matchesSearch = pat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pat.phone.includes(searchQuery);
    const matchesBlood = bloodFilter === 'All' || pat.bloodGroup === bloodFilter;
    return matchesSearch && matchesBlood;
  });

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    await addPatient({
      name,
      email,
      phone,
      age: Number(age),
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
      chronicDiseases: chronicDiseases.split(',').map(s => s.trim()).filter(Boolean),
      admittedStatus,
      avatar: avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    });
    setShowAddModal(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ICU': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 animate-pulse';
      case 'Inpatient (Ward)': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'Outpatient': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getUrgencyBadge = (urgency?: string) => {
    const text = urgency || 'Routine';
    if (text.includes('Emergency') || text.includes('Red Flag')) {
      return {
        bg: 'bg-rose-500 text-white border-rose-400 animate-pulse',
        border: 'border-rose-500/50 bg-rose-50/50 dark:bg-rose-950/20'
      };
    }
    if (text.includes('Urgent')) {
      return {
        bg: 'bg-amber-500 text-white border-amber-400',
        border: 'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20'
      };
    }
    return {
      bg: 'bg-cyan-600 text-white border-cyan-400',
      border: 'border-cyan-500/40 bg-cyan-50/40 dark:bg-cyan-950/20'
    };
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Patients Portal</span>
            {activeSubTab === 'symptom-checker' && (
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 text-xs font-bold border border-cyan-300 dark:border-cyan-800 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-500" /> Gemini 3.6 AI Powered
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Electronic Health Records (EHR), patient registration, and instant Gemini AI symptom triage.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* View Switcher Tabs */}
          <div className="p-1 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('directory')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'directory'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>EHR Directory</span>
            </button>

            <button
              onClick={() => {
                setSelectedPatientForQrId(undefined);
                setActiveSubTab('qr-checkin');
              }}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'qr-checkin'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Express Arrival & QR Check-In</span>
            </button>

            <button
              onClick={() => setActiveSubTab('symptom-checker')}
              className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'symptom-checker'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>AI Symptom Checker</span>
            </button>
          </div>

          {activeSubTab === 'directory' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Register Patient</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-VIEW 1: EHR PATIENT DIRECTORY */}
      {activeSubTab === 'directory' && (
        <div className="space-y-6">
          {/* Filter Row */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient name or phone number..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <select
              value={bloodFilter}
              onChange={(e) => setBloodFilter(e.target.value)}
              className="w-full sm:w-48 px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800"
            >
              <option value="All">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          {/* Mobile Card List */}
          <div className="block sm:hidden space-y-3">
            {filteredPatients.map(pat => (
              <div key={pat.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={pat.avatar}
                    alt={pat.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500/20 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{pat.name}</p>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                        {pat.bloodGroup}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{pat.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Age / Gender</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{pat.age} yrs / {pat.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Phone</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{pat.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusBadge(pat.admittedStatus)}`}>
                    {pat.admittedStatus} {pat.assignedBed ? `(${pat.assignedBed})` : ''}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedPatientForQrId(pat.id);
                        setActiveSubTab('qr-checkin');
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg cursor-pointer flex items-center gap-1"
                      title="Open QR Arrival Badge"
                    >
                      <QrCode className="w-3 h-3" />
                      <span>QR Pass</span>
                    </button>

                    <button
                      onClick={() => {
                        handleSelectPatientForAi(pat.id);
                        setActiveSubTab('symptom-checker');
                      }}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-cyan-600 text-white rounded-lg cursor-pointer flex items-center gap-1"
                      title="Run AI Symptom Check"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>AI Triage</span>
                    </button>

                    <button
                      onClick={() => setSelectedPatient(pat)}
                      className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg cursor-pointer"
                    >
                      View EHR
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Patients Table */}
          <div className="hidden sm:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Patient Info</th>
                    <th className="py-3 px-4">Age / Gender</th>
                    <th className="py-3 px-4">Blood Group</th>
                    <th className="py-3 px-4">Status & Ward</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPatients.map(pat => (
                    <tr key={pat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={pat.avatar}
                            alt={pat.name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-cyan-500/20"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{pat.name}</p>
                            <p className="text-[11px] text-slate-400">{pat.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        {pat.age} yrs / {pat.gender}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded font-black text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                          {pat.bloodGroup}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getStatusBadge(pat.admittedStatus)}`}>
                          {pat.admittedStatus} {pat.assignedBed ? `(${pat.assignedBed})` : ''}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{pat.phone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedPatientForQrId(pat.id);
                              setActiveSubTab('qr-checkin');
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                            <span>QR Pass</span>
                          </button>

                          <button
                            onClick={() => {
                              handleSelectPatientForAi(pat.id);
                              setActiveSubTab('symptom-checker');
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/70 hover:bg-cyan-100 dark:hover:bg-cyan-900 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                            <span>AI Symptom Check</span>
                          </button>

                          <button
                            onClick={() => setSelectedPatient(pat)}
                            className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
                          >
                            View EHR
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: EXPRESS ARRIVAL & QR CHECK-IN */}
      {activeSubTab === 'qr-checkin' && (
        <PatientQrCheckIn initialPatientId={selectedPatientForQrId} />
      )}

      {/* SUB-VIEW 3: AI SYMPTOM CHECKER */}
      {activeSubTab === 'symptom-checker' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          
          {/* Header Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-cyan-950 to-blue-950 text-white border border-cyan-800/40 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                  <span>Gemini AI Symptom Analysis & Triage</span>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                    Gemini 3.6 Flash
                  </span>
                </h3>
                <p className="text-xs text-cyan-200/90 mt-0.5">
                  Input patient symptoms to generate instant preliminary clinical triage, differential diagnoses, and lab recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* Form Input Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            
            {/* Patient Context Selector */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Patient Record (Optional):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <select
                    value={selectedPatientIdForAi}
                    onChange={(e) => handleSelectPatientForAi(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="custom">-- Custom / Walk-In Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.age}y, {p.gender})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                  <div>
                    <input
                      type="number"
                      value={patientAgeInput}
                      onChange={(e) => setPatientAgeInput(Number(e.target.value))}
                      placeholder="Age"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                    />
                  </div>

                  <div>
                    <select
                      value={genderInput}
                      onChange={(e) => setGenderInput(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {medicalHistoryInput && (
                <div className="text-[11px] text-cyan-700 dark:text-cyan-300 font-medium bg-cyan-50 dark:bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-200/50 dark:border-cyan-800/50">
                  <span className="font-bold">Patient EHR Profile Linked:</span> {medicalHistoryInput}
                </div>
              )}
            </div>

            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                Click a Common Clinical Case Preset to Test:
              </label>
              <div className="flex flex-wrap gap-2">
                {presets.map((presetText, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSymptomsInput(presetText);
                      handleRunTriage(presetText);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 text-slate-700 dark:text-slate-300 text-[11px] font-medium border border-slate-200 dark:border-slate-700 transition-colors text-left max-w-xs truncate cursor-pointer"
                  >
                    "{presetText}"
                  </button>
                ))}
              </div>
            </div>

            {/* Main Symptoms Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Chief Complaints & Primary Symptoms <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                placeholder="Describe what the patient is experiencing (e.g. Chest tightness radiating to neck, shortness of breath, sudden sweating, dizziness)..."
                className="w-full px-4 py-3 text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white h-28 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-sans"
              />
            </div>

            {/* Additional Clinical Factors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Symptom Onset / Duration
                </label>
                <select
                  value={symptomOnset}
                  onChange={(e) => setSymptomOnset(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white"
                >
                  <option value="Sudden (<2 hours)">Sudden / Acute (&lt;2 hours)</option>
                  <option value="Today (2-12 hours)">Today (2-12 hours)</option>
                  <option value="1-3 Days">1-3 Days</option>
                  <option value="1+ Weeks">1+ Weeks</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Perceived Severity Scale (1 to 10)
                  </label>
                  <span className="font-black text-xs text-rose-600 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                    {severityScale} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severityScale}
                  onChange={(e) => setSeverityScale(Number(e.target.value))}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Associated Symptoms Chips */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Associated Symptoms Present:
              </label>
              <div className="flex flex-wrap gap-2">
                {associatedOptions.map((opt) => {
                  const isSelected = selectedAssociatedSymptoms.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => toggleAssociatedSymptom(opt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}{opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Trigger Button */}
            <button
              onClick={() => handleRunTriage()}
              disabled={loadingAi || !symptomsInput.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loadingAi ? (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Evaluating Telemetry & Running Gemini AI Symptom Triage...</span>
                </div>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Run Gemini AI Preliminary Symptom Analysis</span>
                </>
              )}
            </button>

          </div>

          {/* AI Output Card */}
          {aiResult && (
            <div className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 shadow-2xl space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 ${getUrgencyBadge(aiResult.urgencyLevel || aiResult.priorityLevel).border}`}>
              
              {/* Header Triage Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-md">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">
                      AI Triage Preliminary Report
                    </h4>
                    <p className="text-xs text-slate-500">
                      Evaluated for: {selectedPatientIdForAi !== 'custom' ? patients.find(p => p.id === selectedPatientIdForAi)?.name : 'Walk-In Patient'} ({patientAgeInput}y, {genderInput})
                    </p>
                  </div>
                </div>

                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider self-start sm:self-auto shadow-sm ${getUrgencyBadge(aiResult.urgencyLevel || aiResult.priorityLevel).bg}`}>
                  Triage Level: {aiResult.urgencyLevel || aiResult.priorityLevel || 'Routine'}
                </span>
              </div>

              {/* Triage Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                {/* Recommended Specialty Wing */}
                <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/80">
                  <span className="text-[10px] uppercase font-extrabold text-cyan-600 dark:text-cyan-400 block mb-1">
                    Recommended Specialty Department
                  </span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    {aiResult.recommendedDepartment || 'Internal Medicine'}
                  </p>
                </div>

                {/* Primary Condition / Differential Diagnosis */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-extrabold text-slate-500 dark:text-slate-400 block mb-1">
                    Primary Suspected Condition
                  </span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    {aiResult.possibleCondition || (Array.isArray(aiResult.possibleConditions) ? aiResult.possibleConditions[0] : 'Clinical Evaluation Required')}
                  </p>
                </div>

              </div>

              {/* Differential Diagnoses Pills if Array */}
              {Array.isArray(aiResult.possibleConditions) && aiResult.possibleConditions.length > 1 && (
                <div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white mb-2">
                    Secondary Differential Diagnoses:
                  </h5>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {aiResult.possibleConditions.slice(1).map((cond: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700">
                        • {cond}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Initial Guidance / Pre-consult Advice */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-600" />
                  <span>Initial Clinical Guidance & Pre-Consult Advice:</span>
                </h5>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {aiResult.initialAdvice || aiResult.summary || 'Immediate clinical examination recommended. Monitor vital signs continuously.'}
                </p>
              </div>

              {/* Vital Sign Watch */}
              {aiResult.vitalSignWatch && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs">
                  <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                    <Activity className="w-4 h-4 text-amber-600" />
                    <span>Vital Sign Telemetry Watch:</span>
                  </span>
                  <p className="text-amber-900 dark:text-amber-200 font-medium">
                    {aiResult.vitalSignWatch}
                  </p>
                </div>
              )}

              {/* Suggested Laboratory Panels */}
              {Array.isArray(aiResult.suggestedLabTests) && aiResult.suggestedLabTests.length > 0 && (
                <div className="space-y-2 text-xs">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-cyan-500" />
                    <span>Suggested Laboratory & Diagnostic Panels:</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {aiResult.suggestedLabTests.map((testName: string, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{testName}</span>
                        <button
                          type="button"
                          onClick={() => handleQuickOrderLab(testName)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg cursor-pointer transition-colors"
                        >
                          {labOrderedSuccess === testName ? '✓ Ordered' : 'Order Lab Test'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions Footer */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 italic">
                  ⚠️ AI Symptom Triage results are decision-support outputs. Always confirm with an attending physician.
                </p>

                <button
                  type="button"
                  onClick={handleSaveToEhr}
                  disabled={savedToEhrSuccess}
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{savedToEhrSuccess ? '✓ Saved to EHR Record!' : 'Save Triage Report to Patient EHR'}</span>
                </button>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Patient Detail Drawer */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Patient EHR Summary</h3>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center">
              <img src={selectedPatient.avatar} alt={selectedPatient.name} className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-cyan-500/20 mb-2" />
              <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">{selectedPatient.name}</h4>
              <p className="text-xs text-slate-500">{selectedPatient.email} • {selectedPatient.phone}</p>
            </div>

            <button
              onClick={() => {
                const patId = selectedPatient.id;
                setSelectedPatient(null);
                handleSelectPatientForAi(patId);
                setActiveSubTab('symptom-checker');
              }}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Run AI Symptom Triage for {selectedPatient.name.split(' ')[0]}</span>
            </button>

            <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Age & Gender:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedPatient.age} yrs / {selectedPatient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Blood Group:</span>
                <span className="font-bold text-rose-600">{selectedPatient.bloodGroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Emergency Contact:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedPatient.emergencyContact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Allergies:</span>
                <span className="font-bold text-amber-600">{selectedPatient.allergies.join(', ') || 'None'}</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-xs text-slate-900 dark:text-white mb-2">Linked Medical History</h5>
              {medicalRecords.filter(r => r.patientId === selectedPatient.id).map(rec => (
                <div key={rec.id} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 mb-2 text-xs">
                  <p className="font-bold text-cyan-600 dark:text-cyan-400">{rec.diagnosis}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{rec.visitDate} — Dr. {rec.doctorName}</p>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">{rec.clinicalNotes}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Register Patient Record</h3>

            <form onSubmit={handleCreatePatient} className="space-y-3 text-xs max-h-[80vh] overflow-y-auto pr-1">
              
              {/* Profile Photo Upload Field */}
              <ProfileAvatarUpload
                value={avatar}
                onChange={setAvatar}
                label="Patient Photo / ID (Cloudinary & Local)"
              />

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sophia Martinez" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sophia@gmail.com" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Phone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 016-5543" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Age</label>
                  <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Blood Group</label>
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Emergency Contact</label>
                <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="Spouse / Parent - Phone" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                Save Patient Record
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
