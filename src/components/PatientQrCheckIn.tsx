import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useHospital } from '../context/HospitalContext';
import {
  QrCode, Camera, CheckCircle2, UserCheck, AlertTriangle, Search,
  Printer, Download, Send, Sparkles, RefreshCw, Clock, ArrowRight,
  ShieldCheck, ShieldAlert, HeartPulse, User, Phone, MapPin, Building2,
  Stethoscope, FileText, Check, Copy, Share2, Layers, HelpCircle, X,
  BadgeAlert, Volume2, Flame
} from 'lucide-react';
import { Patient } from '../types';

interface PatientQrCheckInProps {
  initialPatientId?: string;
  onPatientCheckedIn?: (patientId: string, arrivalData: any) => void;
}

export interface CheckInRecord {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  bloodGroup: string;
  checkInTime: string;
  queueToken: string;
  triagePriority: 'Standard' | 'Urgent' | 'Emergency Critical';
  assignedDept: string;
  assignedDoctor?: string;
  roomOrBay: string;
  status: 'Waiting in Bay' | 'With Doctor' | 'Admitted to Room' | 'Completed';
}

export const PatientQrCheckIn: React.FC<PatientQrCheckInProps> = ({
  initialPatientId,
  onPatientCheckedIn
}) => {
  const { patients, departments, triggerEmergencyAlert } = useHospital();

  // Active View Mode inside Module
  const [activeMode, setActiveMode] = useState<'scanner' | 'generator' | 'log'>('scanner');

  // Scanner state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [scannedPatient, setScannedPatient] = useState<Patient | null>(null);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [scanErrorMessage, setScanErrorMessage] = useState<string>('');

  // Check-In Form State (for scanned patient)
  const [triagePriority, setTriagePriority] = useState<'Standard' | 'Urgent' | 'Emergency Critical'>('Standard');
  const [assignedDept, setAssignedDept] = useState<string>('General Medicine');
  const [assignedDoctor, setAssignedDoctor] = useState<string>('Dr. Sarah Jenkins');
  const [assignedRoom, setAssignedRoom] = useState<string>('Waiting Bay A - Chair 04');
  const [notes, setNotes] = useState<string>('');
  const [checkInSuccess, setCheckInSuccess] = useState<CheckInRecord | null>(null);

  // Check-In History Logs
  const [checkInLogs, setCheckInLogs] = useState<CheckInRecord[]>([
    {
      id: 'chk-1',
      patientId: 'pat-1',
      patientName: 'Sophia Martinez',
      patientAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      bloodGroup: 'O+',
      checkInTime: 'Today, 09:15 AM',
      queueToken: '#A-102',
      triagePriority: 'Emergency Critical',
      assignedDept: 'Emergency & ICU',
      assignedDoctor: 'Dr. Robert Vance',
      roomOrBay: 'ICU Bed 101',
      status: 'Admitted to Room'
    },
    {
      id: 'chk-2',
      patientId: 'pat-2',
      patientName: 'David Chen',
      patientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      bloodGroup: 'A+',
      checkInTime: 'Today, 09:42 AM',
      queueToken: '#A-103',
      triagePriority: 'Standard',
      assignedDept: 'Cardiology',
      assignedDoctor: 'Dr. Sarah Jenkins',
      roomOrBay: 'Consultation Room 3',
      status: 'With Doctor'
    }
  ]);

  // QR Generator State
  const [genPatientId, setGenPatientId] = useState<string>(initialPatientId || patients[0]?.id || 'pat-1');
  const [genFormat, setGenFormat] = useState<'badge' | 'wristband' | 'wallet'>('badge');
  const [includeAllergiesInQr, setIncludeAllergiesInQr] = useState<boolean>(true);
  const [includeEmergencyContact, setIncludeEmergencyContact] = useState<boolean>(true);

  const selectedGenPatient = patients.find(p => p.id === genPatientId) || patients[0];

  // Set default initial scanned patient if provided
  useEffect(() => {
    if (initialPatientId) {
      const found = patients.find(p => p.id === initialPatientId);
      if (found) {
        setScannedPatient(found);
        setScanStatus('success');
      }
    }
  }, [initialPatientId, patients]);

  // Simulate QR Code Scan trigger from preset patient or code string
  const handleSimulateScan = (patientId: string) => {
    setScanStatus('scanning');
    setScanErrorMessage('');

    setTimeout(() => {
      const found = patients.find(p => p.id === patientId || p.name.toLowerCase().includes(patientId.toLowerCase()));
      if (found) {
        setScannedPatient(found);
        setScanStatus('success');
      } else {
        setScanStatus('error');
        setScanErrorMessage(`Patient record for code "${patientId}" not found in hospital database.`);
      }
    }, 800);
  };

  // Handle Manual Code / JSON paste
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCodeInput.trim()) return;

    try {
      // Try parsing JSON if code contains encoded JSON
      if (manualCodeInput.includes('{')) {
        const parsed = JSON.parse(manualCodeInput);
        if (parsed.patientId) {
          handleSimulateScan(parsed.patientId);
          return;
        }
      }
    } catch (err) {
      // fallback to raw ID search
    }

    handleSimulateScan(manualCodeInput.trim());
  };

  // Execute Official Arrival Check-In
  const handleConfirmCheckIn = () => {
    if (!scannedPatient) return;

    const queueNum = `#A-${Math.floor(100 + Math.random() * 900)}`;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newRecord: CheckInRecord = {
      id: `chk-${Date.now()}`,
      patientId: scannedPatient.id,
      patientName: scannedPatient.name,
      patientAvatar: scannedPatient.avatar,
      bloodGroup: scannedPatient.bloodGroup,
      checkInTime: `Today, ${nowStr}`,
      queueToken: queueNum,
      triagePriority,
      assignedDept,
      assignedDoctor,
      roomOrBay: assignedRoom,
      status: triagePriority === 'Emergency Critical' ? 'Admitted to Room' : 'Waiting in Bay'
    };

    setCheckInLogs(prev => [newRecord, ...prev]);
    setCheckInSuccess(newRecord);

    if (triagePriority === 'Emergency Critical') {
      triggerEmergencyAlert(
        `🚨 CRITICAL ARRIVAL: ${scannedPatient.name}`,
        `Emergency arrival checked in via QR scanner. Priority: Critical. Assigned to ${assignedRoom}. Attending: ${assignedDoctor}.`
      );
    }

    if (onPatientCheckedIn) {
      onPatientCheckedIn(scannedPatient.id, newRecord);
    }
  };

  // Construct QR Payload String for selected generator patient
  const qrPayloadData = useMemo(() => {
    if (!selectedGenPatient) return '';

    return JSON.stringify({
      hospital: 'St. Jude Metropolitan Medical Center',
      patientId: selectedGenPatient.id,
      name: selectedGenPatient.name,
      bloodGroup: selectedGenPatient.bloodGroup,
      allergies: includeAllergiesInQr ? selectedGenPatient.allergies : undefined,
      emergencyContact: includeEmergencyContact ? selectedGenPatient.emergencyContact : undefined,
      issuedAt: new Date().toISOString()
    });
  }, [selectedGenPatient, includeAllergiesInQr, includeEmergencyContact]);

  // Print Wristband / Pass
  const handlePrintBadge = () => {
    window.print();
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">

      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Patient Express Arrival & QR Check-In Hub
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                SMART RECEPTION & TRIAGE
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instant patient verification via digital QR code scanner, automated queue tokening, and hospital wristband printing.
            </p>
          </div>
        </div>

        {/* NAVIGATION MODE TABS */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs shrink-0">
          <button
            onClick={() => setActiveMode('scanner')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'scanner'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>QR Arrival Scanner</span>
          </button>

          <button
            onClick={() => setActiveMode('generator')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'generator'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Pass & Wristband Creator</span>
          </button>

          <button
            onClick={() => setActiveMode('log')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeMode === 'log'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Arrival Logs ({checkInLogs.length})</span>
          </button>
        </div>
      </div>

      {/* MODE 1: QR CODE SCANNER & RAPID CHECK-IN */}
      {activeMode === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: CAMERA SCANNER SIMULATION PANEL (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 rounded-3xl bg-slate-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden space-y-4">
              
              {/* Camera Header Status */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="flex items-center gap-2 font-bold text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>Optical Reception Scanner Active</span>
                </span>

                <button
                  onClick={() => setIsCameraActive(!isCameraActive)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 transition-all cursor-pointer"
                >
                  {isCameraActive ? 'Pause Camera' : 'Resume Feed'}
                </button>
              </div>

              {/* Viewfinder Target Stage */}
              <div className="relative aspect-square w-full rounded-2xl bg-slate-900 border-2 border-dashed border-slate-800 flex items-center justify-center overflow-hidden">
                
                {/* Laser Scanning Line Animation */}
                {isCameraActive && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce top-1/3 z-10" />
                )}

                {/* Viewfinder Target Frame Corners */}
                <div className="absolute inset-8 border-2 border-cyan-500/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                    <div className="w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                  </div>
                  <div className="flex justify-between">
                    <div className="w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                    <div className="w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                  </div>
                </div>

                {/* Scanned Result Overlay or Sample Scanner Target */}
                {scanStatus === 'scanning' ? (
                  <div className="text-center space-y-2 z-20">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                    <p className="text-xs font-bold text-cyan-300">Decrypting QR Code Credentials...</p>
                  </div>
                ) : scannedPatient ? (
                  <div className="text-center p-4 bg-slate-900/90 rounded-2xl border border-emerald-500/50 space-y-2 z-20">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                    <p className="text-sm font-black text-white">{scannedPatient.name}</p>
                    <p className="text-[10px] text-emerald-400 font-mono">MRN Verified: {scannedPatient.id}</p>
                  </div>
                ) : (
                  <div className="text-center space-y-2 p-4 text-slate-400">
                    <QrCode className="w-12 h-12 text-slate-600 mx-auto opacity-60" />
                    <p className="text-xs font-bold text-slate-300">Align Patient QR Badge within frame</p>
                    <p className="text-[10px] text-slate-500">Supports patient mobile app pass or printed wristband</p>
                  </div>
                )}
              </div>

              {/* QUICK SCAN TESTING PRESETS */}
              <div className="space-y-2 pt-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  ⚡ Test Quick Reception Scanning:
                </span>
                
                <div className="grid grid-cols-2 gap-2">
                  {patients.slice(0, 4).map(p => (
                    <button
                      key={p.id}
                      onClick={() => handleSimulateScan(p.id)}
                      className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-all cursor-pointer flex items-center gap-2"
                    >
                      <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full object-cover" />
                      <div className="truncate">
                        <p className="font-bold text-[11px] text-slate-200 truncate">{p.name}</p>
                        <p className="text-[9px] text-slate-500 font-mono">{p.id}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* MANUAL CODE / PASTE INPUT */}
              <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={manualCodeInput}
                  onChange={(e) => setManualCodeInput(e.target.value)}
                  placeholder="Enter or paste Patient MRN (e.g. PAT-101)"
                  className="flex-1 px-3 py-2 bg-slate-900 text-xs font-mono text-white rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl cursor-pointer shrink-0"
                >
                  Verify
                </button>
              </form>

              {scanErrorMessage && (
                <div className="p-3 bg-rose-950/80 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{scanErrorMessage}</span>
                </div>
              )}

            </div>
          </div>

          {/* RIGHT: SCANNED PATIENT CHECK-IN & TRIAGE EXECUTION PANEL (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {!scannedPatient ? (
              <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <UserCheck className="w-12 h-12 text-slate-400 mx-auto" />
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Awaiting Patient Scan</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Scan a patient's mobile QR pass or select a test patient on the left panel to trigger rapid reception arrival check-in.
                </p>
              </div>
            ) : checkInSuccess ? (
              /* SUCCESSFUL CHECK-IN SUMMARY CARD */
              <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-slate-50 to-cyan-500/10 dark:from-emerald-950/30 dark:to-cyan-950/30 border border-emerald-500/30 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-base text-slate-900 dark:text-white">
                        Check-In Completed Successfully!
                      </h4>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        Issued Token: {checkInSuccess.queueToken}
                      </p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white font-extrabold text-xs">
                    {checkInSuccess.status}
                  </span>
                </div>

                {/* Patient Overview Summary */}
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                  <img src={checkInSuccess.patientName ? scannedPatient.avatar : ''} alt="Avatar" className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500" />
                  <div className="space-y-0.5">
                    <h5 className="font-black text-base text-slate-900 dark:text-white">{checkInSuccess.patientName}</h5>
                    <p className="text-xs text-slate-500 font-mono">Patient ID: {checkInSuccess.patientId}</p>
                    <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
                      Assigned Location: {checkInSuccess.roomOrBay} ({checkInSuccess.assignedDept})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setCheckInSuccess(null);
                      setScannedPatient(null);
                    }}
                    className="flex-1 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl shadow cursor-pointer"
                  >
                    Scan Next Patient Arrival
                  </button>
                  <button
                    onClick={handlePrintBadge}
                    className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" /> Print Token Wristband
                  </button>
                </div>
              </div>
            ) : (
              /* CHECK-IN FORM & TRIAGE OPTIONS */
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
                
                {/* Patient Scanned Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <img src={scannedPatient.avatar} alt={scannedPatient.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">{scannedPatient.name}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {scannedPatient.bloodGroup}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        MRN: <strong className="font-mono text-cyan-600 dark:text-cyan-400">{scannedPatient.id}</strong> • {scannedPatient.gender}, {scannedPatient.age} yrs
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setScannedPatient(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 cursor-pointer"
                    title="Clear selected patient"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Medical Alerts Banner if allergies exist */}
                {scannedPatient.allergies && scannedPatient.allergies.length > 0 && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-xs text-rose-800 dark:text-rose-300">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>
                      <strong>KNOWN ALLERGIES:</strong> {scannedPatient.allergies.join(', ')}
                    </span>
                  </div>
                )}

                {/* FORM CONTROLS */}
                <div className="space-y-4">
                  
                  {/* Triage Priority Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Select Triage Priority Level:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setTriagePriority('Standard')}
                        className={`p-3 rounded-2xl font-bold text-xs border text-center transition-all cursor-pointer ${
                          triagePriority === 'Standard'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        🟢 Standard Outpatient
                      </button>

                      <button
                        type="button"
                        onClick={() => setTriagePriority('Urgent')}
                        className={`p-3 rounded-2xl font-bold text-xs border text-center transition-all cursor-pointer ${
                          triagePriority === 'Urgent'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        🟡 Urgent Priority
                      </button>

                      <button
                        type="button"
                        onClick={() => setTriagePriority('Emergency Critical')}
                        className={`p-3 rounded-2xl font-bold text-xs border text-center transition-all cursor-pointer ${
                          triagePriority === 'Emergency Critical'
                            ? 'bg-rose-600 text-white border-rose-600 shadow-md animate-pulse'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        🔴 Critical Emergency
                      </button>
                    </div>
                  </div>

                  {/* Department & Attending Doctor */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Assigned Department:
                      </label>
                      <select
                        value={assignedDept}
                        onChange={(e) => setAssignedDept(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                      >
                        <option value="General Medicine">General Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Emergency & ICU">Emergency & ICU</option>
                        <option value="Orthopedics">Orthopedics</option>
                        <option value="Pediatrics">Pediatrics</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Attending Doctor:
                      </label>
                      <select
                        value={assignedDoctor}
                        onChange={(e) => setAssignedDoctor(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                      >
                        <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins (Cardiology)</option>
                        <option value="Dr. Robert Vance">Dr. Robert Vance (ICU Specialist)</option>
                        <option value="Dr. Emily Thorne">Dr. Emily Thorne (Internal Medicine)</option>
                        <option value="Dr. Marcus Brody">Dr. Marcus Brody (Trauma Surgeon)</option>
                      </select>
                    </div>
                  </div>

                  {/* Room / Waiting Bay Allocation */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Destination / Bed:
                    </label>
                    <input
                      type="text"
                      value={assignedRoom}
                      onChange={(e) => setAssignedRoom(e.target.value)}
                      placeholder="e.g. Waiting Bay A - Chair 04 or ICU Bed 102"
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  {/* Execute Arrival Check-In Button */}
                  <button
                    onClick={handleConfirmCheckIn}
                    className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-sm rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-5 h-5" /> Confirm Hospital Arrival & Issue Queue Pass
                  </button>

                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* MODE 2: QR CODE GENERATOR & PATIENT WRISTBAND CREATOR */}
      {activeMode === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: GENERATOR CONTROLS (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <QrCode className="w-5 h-5 text-cyan-600" />
                <span>Configure Digital Pass / Wristband</span>
              </h4>

              {/* Select Registered Patient */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Registered Patient:
                </label>
                <select
                  value={genPatientId}
                  onChange={(e) => setGenPatientId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) - Blood Group: {p.bloodGroup}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pass Format Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Badge Format:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setGenFormat('badge')}
                    className={`p-2.5 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                      genFormat === 'badge' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    ID Badge Card
                  </button>

                  <button
                    onClick={() => setGenFormat('wristband')}
                    className={`p-2.5 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                      genFormat === 'wristband' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Hospital Wristband
                  </button>

                  <button
                    onClick={() => setGenFormat('wallet')}
                    className={`p-2.5 rounded-xl font-bold text-xs border text-center transition-all cursor-pointer ${
                      genFormat === 'wallet' ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    Mobile Wallet Pass
                  </button>
                </div>
              </div>

              {/* QR Payload Toggle Options */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 block">QR Security Data Options:</span>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={includeAllergiesInQr}
                    onChange={(e) => setIncludeAllergiesInQr(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Encode Medical Allergy Alerts</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600 dark:text-slate-400">
                  <input
                    type="checkbox"
                    checked={includeEmergencyContact}
                    onChange={(e) => setIncludeEmergencyContact(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Encode Emergency Phone Contact</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintBadge}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-2xl shadow cursor-pointer flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print Hospital Pass / Wristband
                </button>
              </div>

            </div>
          </div>

          {/* RIGHT: LIVE QR BADGE & WRISTBAND PREVIEW (6 Cols) */}
          <div className="lg:col-span-6 flex justify-center">
            
            {/* WRISTBAND OR BADGE PREVIEW CARD */}
            {genFormat === 'wristband' ? (
              <div className="w-full max-w-sm p-4 rounded-3xl bg-white border-2 border-slate-800 shadow-2xl text-slate-900 space-y-3 font-sans relative">
                <div className="text-center border-b pb-2">
                  <h5 className="font-black text-xs uppercase tracking-wider text-rose-600">ST. JUDE MEDICAL CENTER</h5>
                  <p className="text-[9px] font-bold text-slate-500">OFFICIAL INPATIENT IDENTIFICATION BAND</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-white p-2 rounded-xl border border-slate-200">
                    <QRCodeSVG value={qrPayloadData} size={90} level="H" />
                  </div>

                  <div className="space-y-1 text-xs">
                    <h4 className="font-black text-base leading-tight text-slate-900">{selectedGenPatient?.name}</h4>
                    <p className="text-[10px] font-mono text-slate-600">MRN: {selectedGenPatient?.id}</p>
                    <p className="text-[10px] font-black text-rose-600">BLOOD TYPE: {selectedGenPatient?.bloodGroup}</p>
                    <p className="text-[9px] text-slate-500">DOB: 1996-04-12 ({selectedGenPatient?.age}y)</p>
                  </div>
                </div>

                {selectedGenPatient?.allergies && selectedGenPatient.allergies.length > 0 && (
                  <div className="p-1.5 bg-rose-600 text-white text-[9px] font-black rounded uppercase text-center">
                    ⚠️ ALLERGY ALERT: {selectedGenPatient.allergies.join(', ')}
                  </div>
                )}
              </div>
            ) : (
              /* ID BADGE CARD PREVIEW */
              <div className="w-full max-w-sm p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-slate-800 shadow-2xl space-y-5 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-400" />
                    <span className="font-black text-xs text-slate-200 uppercase tracking-wide">ST. JUDE HEALTH PASS</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase">
                    ACTIVE MRN
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <img src={selectedGenPatient?.avatar} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400" />

                  <div className="space-y-0.5">
                    <h4 className="font-black text-lg text-white">{selectedGenPatient?.name}</h4>
                    <p className="text-xs text-cyan-400 font-mono">ID: {selectedGenPatient?.id}</p>
                    <p className="text-xs font-bold text-slate-300">Blood: <strong className="text-rose-400">{selectedGenPatient?.bloodGroup}</strong></p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl flex items-center justify-center">
                  <QRCodeSVG value={qrPayloadData} size={150} level="M" />
                </div>

                <p className="text-[10px] text-center text-slate-400 font-mono">
                  Scan at any reception desk or self-service kiosk for express check-in
                </p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* MODE 3: ARRIVAL LOGS */}
      {activeMode === 'log' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-600" />
            <span>Today's Patient Arrival & Check-In History</span>
          </h4>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {checkInLogs.map(log => (
              <div key={log.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <img src={log.patientAvatar} alt={log.patientName} className="w-10 h-10 rounded-2xl object-cover border" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-extrabold text-slate-900 dark:text-white text-sm">{log.patientName}</h5>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300">
                        {log.queueToken}
                      </span>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                      Check-In: <strong>{log.checkInTime}</strong> • Assigned: <strong className="text-cyan-600 dark:text-cyan-400">{log.roomOrBay}</strong> ({log.assignedDept})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-xl font-bold text-[10px] ${
                    log.triagePriority === 'Emergency Critical'
                      ? 'bg-rose-600 text-white animate-pulse'
                      : log.triagePriority === 'Urgent'
                      ? 'bg-amber-500 text-black'
                      : 'bg-emerald-500 text-white'
                  }`}>
                    {log.triagePriority}
                  </span>

                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[10px]">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
