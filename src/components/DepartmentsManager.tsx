import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import {
  Building2, Bed, Users, ShieldAlert, Plus, Edit2, X, Check, Search, Filter,
  Activity, AlertTriangle, ArrowRightLeft, LogOut, HeartPulse, Stethoscope,
  Clock, ShieldCheck, CheckCircle2, UserCheck, RefreshCw, AlertCircle, Sparkles
} from 'lucide-react';
import { Patient, Department } from '../types';

interface BedItem {
  id: string;
  bedCode: string;
  wardName: string;
  departmentId: string;
  status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved';
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  acuity?: 'Critical' | 'Stable' | 'Post-Op' | 'Monitoring';
  admittedAt?: string;
}

export const DepartmentsManager: React.FC = () => {
  const {
    departments, patients, doctors, updateBedOccupancy, updatePatient, triggerEmergencyAlert
  } = useHospital();
  const { activeRole } = useAuth();

  // Active View Tab
  const [activeTab, setActiveTab] = useState<'grid' | 'admissions' | 'wards'>('grid');

  // Filters for Real-time Bed Grid
  const [selectedWardFilter, setSelectedWardFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [selectedBedForAction, setSelectedBedForAction] = useState<BedItem | null>(null);
  const [selectedPatientForAction, setSelectedPatientForAction] = useState<Patient | null>(null);

  // Form States for Admission / Transfer
  const [admitPatientId, setAdmitPatientId] = useState<string>('');
  const [admitWard, setAdmitWard] = useState<string>('ICU');
  const [admitBedCode, setAdmitBedCode] = useState<string>('ICU-05');
  const [admitDoctorId, setAdmitDoctorId] = useState<string>('');
  const [admitAcuity, setAdmitAcuity] = useState<'Critical' | 'Stable' | 'Post-Op' | 'Monitoring'>('Stable');
  const [admitStatusType, setAdmitStatusType] = useState<'Inpatient (Ward)' | 'ICU'>('Inpatient (Ward)');

  // Form State for Bed Transfer
  const [transferTargetBedCode, setTransferTargetBedCode] = useState<string>('');
  const [transferTargetWard, setTransferTargetWard] = useState<string>('');

  // Editing Wards Occupancy State
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [bedsInput, setBedsInput] = useState<number>(0);

  const canEdit = activeRole === 'Super Admin' || activeRole === 'Hospital Admin' || activeRole === 'Doctor' || activeRole === 'Receptionist';

  // Generate synthetic beds data synced with departments & patients
  const generateBedsData = (): BedItem[] => {
    const bedsList: BedItem[] = [];

    departments.forEach(dept => {
      const wardCode = dept.code || dept.name.substring(0, 4).toUpperCase();
      const total = dept.totalBeds || 15;
      const occupiedCount = dept.occupiedBeds || 0;

      // Find patients assigned to this department / status
      const wardPatients = patients.filter(p =>
        (p.admittedStatus === 'ICU' && dept.name.includes('ICU')) ||
        (p.admittedStatus === 'Inpatient (Ward)' && (p.assignedBed?.includes(wardCode) || !p.assignedBed))
      );

      for (let i = 1; i <= total; i++) {
        const bedCode = `${wardCode}-${i < 10 ? '0' + i : i}`;

        // Determine status
        let status: 'Available' | 'Occupied' | 'Maintenance' | 'Reserved' = 'Available';
        let assignedPat: Patient | undefined;

        if (i <= occupiedCount) {
          status = 'Occupied';
          assignedPat = wardPatients[i - 1] || patients[(i - 1) % patients.length];
        } else if (i === total) {
          status = 'Maintenance';
        } else if (i === total - 1) {
          status = 'Reserved';
        }

        const docInCharge = doctors.find(d => d.id === assignedPat?.doctorInChargeId) || doctors[i % doctors.length];

        bedsList.push({
          id: `bed-${dept.id}-${i}`,
          bedCode,
          wardName: dept.name,
          departmentId: dept.id,
          status,
          patientId: status === 'Occupied' ? assignedPat?.id : undefined,
          patientName: status === 'Occupied' ? (assignedPat?.name || `Patient #${i}`) : undefined,
          doctorId: status === 'Occupied' ? docInCharge?.id : undefined,
          doctorName: status === 'Occupied' ? (docInCharge?.name || 'Dr. Sarah Jenkins') : undefined,
          acuity: status === 'Occupied' ? (i % 3 === 0 ? 'Critical' : i % 2 === 0 ? 'Post-Op' : 'Stable') : undefined,
          admittedAt: status === 'Occupied' ? '2026-08-05' : undefined
        });
      }
    });

    return bedsList;
  };

  const allBeds = generateBedsData();

  // Summary Metrics
  const totalHospitalBeds = departments.reduce((acc, d) => acc + d.totalBeds, 0);
  const totalOccupiedBeds = departments.reduce((acc, d) => acc + d.occupiedBeds, 0);
  const totalAvailableBeds = totalHospitalBeds - totalOccupiedBeds;
  const overallOccupancyPct = totalHospitalBeds > 0 ? Math.round((totalOccupiedBeds / totalHospitalBeds) * 100) : 0;

  const inpatients = patients.filter(p => p.admittedStatus === 'Inpatient (Ward)' || p.admittedStatus === 'ICU');
  const icuPatientsCount = patients.filter(p => p.admittedStatus === 'ICU').length;

  // Filtered Beds
  const filteredBeds = allBeds.filter(b => {
    const matchesWard = selectedWardFilter === 'All' || b.wardName === selectedWardFilter;
    const matchesStatus = selectedStatusFilter === 'All' || b.status === selectedStatusFilter;
    const matchesQuery = searchQuery === '' ||
      b.bedCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.wardName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.patientName && b.patientName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesWard && matchesStatus && matchesQuery;
  });

  // Handle Admission & Bed Assignment
  const handleAdmitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitPatientId) return;

    const targetPatient = patients.find(p => p.id === admitPatientId);
    if (!targetPatient) return;

    if (updatePatient) {
      await updatePatient(targetPatient.id, {
        admittedStatus: admitStatusType,
        assignedBed: admitBedCode,
        doctorInChargeId: admitDoctorId || doctors[0]?.id
      });
    }

    // Increment department occupied bed count
    const dept = departments.find(d => d.name === admitWard) || departments[0];
    if (dept && updateBedOccupancy) {
      await updateBedOccupancy(dept.id, Math.min(dept.totalBeds, dept.occupiedBeds + 1));
    }

    setShowAdmitModal(false);
  };

  // Handle Discharge
  const handleDischargeConfirm = async () => {
    if (!selectedPatientForAction) return;

    if (updatePatient) {
      await updatePatient(selectedPatientForAction.id, {
        admittedStatus: 'Discharged',
        assignedBed: undefined
      });
    }

    // Decrement department occupied bed count
    const dept = departments.find(d => d.name.includes('Ward') || d.name.includes('ICU')) || departments[0];
    if (dept && updateBedOccupancy) {
      await updateBedOccupancy(dept.id, Math.max(0, dept.occupiedBeds - 1));
    }

    setShowDischargeModal(false);
    setSelectedPatientForAction(null);
  };

  // Handle Bed Transfer
  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForAction || !transferTargetBedCode) return;

    if (updatePatient) {
      await updatePatient(selectedPatientForAction.id, {
        assignedBed: transferTargetBedCode,
        admittedStatus: transferTargetWard.includes('ICU') ? 'ICU' : 'Inpatient (Ward)'
      });
    }

    setShowTransferModal(false);
    setSelectedPatientForAction(null);
  };

  const handleSaveDepartmentBeds = async (deptId: string) => {
    if (updateBedOccupancy) {
      await updateBedOccupancy(deptId, bedsInput);
    }
    setEditingDeptId(null);
  };

  const getBedStatusBadge = (status: BedItem['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'Occupied':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
      case 'Maintenance':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'Reserved':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getAcuityBadge = (acuity?: string) => {
    switch (acuity) {
      case 'Critical':
        return 'bg-rose-500 text-white font-extrabold animate-pulse';
      case 'Post-Op':
        return 'bg-amber-500 text-white font-bold';
      case 'Stable':
        return 'bg-emerald-600 text-white font-semibold';
      default:
        return 'bg-cyan-600 text-white font-semibold';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Inpatient & Bed Management Dashboard</span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 text-xs font-bold border border-cyan-300 dark:border-cyan-800 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-500 animate-pulse" /> Live Telemetry
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time ward capacity tracking, bed availability matrix, and inpatient admission/discharge management.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {canEdit && (
            <button
              onClick={() => {
                setAdmitPatientId(patients[0]?.id || '');
                setAdmitWard(departments[0]?.name || 'ICU & Critical Care');
                setShowAdmitModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Admit Inpatient / Allocate Bed</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Top Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Hospital Beds */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Ward Beds</span>
            <Bed className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">{totalHospitalBeds}</p>
          <p className="text-[10px] text-slate-500">Across {departments.length} hospital wings</p>
        </div>

        {/* Occupied Beds */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Occupied Beds</span>
            <Users className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">{totalOccupiedBeds}</p>
          <p className="text-[10px] text-slate-500">{overallOccupancyPct}% Ward Occupancy Rate</p>
        </div>

        {/* Available Beds */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Beds Available</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{totalAvailableBeds}</p>
          <p className="text-[10px] text-slate-500">Ready for immediate admission</p>
        </div>

        {/* ICU Occupancy */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">ICU Admissions</span>
            <HeartPulse className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-amber-600 dark:text-amber-400">{icuPatientsCount}</p>
          <p className="text-[10px] text-slate-500">Critical Care Patients</p>
        </div>

        {/* Total Inpatients */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Total Inpatients</span>
            <Stethoscope className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{inpatients.length}</p>
          <p className="text-[10px] text-slate-500">Active Census Count</p>
        </div>

      </div>

      {/* Sub-Tab Navigation Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('grid')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'grid'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Bed className="w-4 h-4 text-cyan-500" />
            <span>Real-Time Bed Matrix</span>
          </button>

          <button
            onClick={() => setActiveTab('admissions')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'admissions'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-blue-500" />
            <span>Inpatient Census ({inpatients.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wards')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'wards'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-500" />
            <span>Ward Capacities</span>
          </button>
        </div>

        {activeTab === 'grid' && (
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto text-xs">
            {/* Search Input */}
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bed or patient..."
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            {/* Ward Filter */}
            <select
              value={selectedWardFilter}
              onChange={(e) => setSelectedWardFilter(e.target.value)}
              className="w-full sm:w-40 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
            >
              <option value="All">All Wards</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full sm:w-36 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Reserved">Reserved</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: REAL-TIME BED MATRIX */}
      {activeTab === 'grid' && (
        <div className="space-y-4">
          
          {/* Status Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs font-bold">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Bed Status Legend:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-500" /> Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" /> Maintenance / Sanitizing
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-blue-500" /> Reserved
              </span>
            </div>

            <span className="text-slate-400 text-[11px] font-medium">
              Showing {filteredBeds.length} of {allBeds.length} total hospital beds
            </span>
          </div>

          {/* Bed Tiles Matrix Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBeds.map(bed => (
              <div
                key={bed.id}
                className={`p-4 rounded-2xl border-2 transition-all relative space-y-3 shadow-sm ${
                  bed.status === 'Occupied'
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                    : bed.status === 'Available'
                    ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/50 hover:border-emerald-500'
                    : bed.status === 'Maintenance'
                    ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                    : 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60'
                }`}
              >
                {/* Header Bed Code & Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl font-black text-xs ${
                      bed.status === 'Occupied' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    }`}>
                      <Bed className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white block">{bed.bedCode}</span>
                      <span className="text-[10px] text-slate-500 truncate block max-w-[120px]">{bed.wardName}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getBedStatusBadge(bed.status)}`}>
                    {bed.status}
                  </span>
                </div>

                {/* Patient / Details Payload */}
                {bed.status === 'Occupied' ? (
                  <div className="space-y-2 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 dark:text-white truncate">{bed.patientName}</span>
                      {bed.acuity && (
                        <span className={`px-2 py-0.5 rounded text-[9px] uppercase ${getAcuityBadge(bed.acuity)}`}>
                          {bed.acuity}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Stethoscope className="w-3 h-3 text-cyan-500" />
                      <span className="truncate">{bed.doctorName}</span>
                    </p>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-400 italic text-center">
                    {bed.status === 'Available' ? 'Bed empty and sanitized for assignment' : bed.status === 'Maintenance' ? 'Cleaning & UV sterilization in progress' : 'Reserved for ER Transfer'}
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                  {bed.status === 'Available' && canEdit && (
                    <button
                      onClick={() => {
                        setAdmitBedCode(bed.bedCode);
                        setAdmitWard(bed.wardName);
                        setAdmitPatientId(patients[0]?.id || '');
                        setShowAdmitModal(true);
                      }}
                      className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Allocate Patient
                    </button>
                  )}

                  {bed.status === 'Occupied' && (
                    <div className="grid grid-cols-2 gap-1.5 w-full">
                      <button
                        onClick={() => {
                          const pat = patients.find(p => p.id === bed.patientId || p.name === bed.patientName);
                          if (pat) {
                            setSelectedPatientForAction(pat);
                            setTransferTargetBedCode(`${bed.wardName.substring(0, 3)}-09`);
                            setTransferTargetWard(bed.wardName);
                            setShowTransferModal(true);
                          }
                        }}
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[11px] rounded-xl cursor-pointer flex items-center justify-center gap-1"
                      >
                        <ArrowRightLeft className="w-3 h-3 text-cyan-500" /> Transfer
                      </button>

                      <button
                        onClick={() => {
                          const pat = patients.find(p => p.id === bed.patientId || p.name === bed.patientName) || {
                            id: bed.patientId || 'pat-demo',
                            name: bed.patientName || 'Inpatient',
                            email: 'pat@hospital.com',
                            phone: '+1 (555) 000-1122',
                            age: 42,
                            gender: 'Female',
                            bloodGroup: 'O+',
                            address: 'Ward Room',
                            emergencyContact: 'Family',
                            allergies: [],
                            chronicDiseases: [],
                            admittedStatus: 'Inpatient (Ward)',
                            assignedBed: bed.bedCode,
                            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
                            registeredAt: '2026-08-01'
                          };
                          setSelectedPatientForAction(pat);
                          setShowDischargeModal(true);
                        }}
                        className="py-1.5 px-2 bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/70 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-semibold text-[11px] rounded-xl cursor-pointer flex items-center justify-center gap-1"
                      >
                        <LogOut className="w-3 h-3" /> Discharge
                      </button>
                    </div>
                  )}

                  {(bed.status === 'Maintenance' || bed.status === 'Reserved') && canEdit && (
                    <button
                      onClick={() => {
                        // Toggling status
                        alert(`Bed ${bed.bedCode} marked as Available and sanitized.`);
                      }}
                      className="w-full py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[11px] rounded-xl cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Mark Available
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* TAB 2: INPATIENT ADMISSIONS CENSUS */}
      {activeTab === 'admissions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Inpatient & ICU Admission Roster</h3>
              <p className="text-xs text-slate-500">Currently admitted patients across all wards</p>
            </div>
            <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 text-xs font-bold rounded-xl border border-cyan-200 dark:border-cyan-800">
              Active Census: {inpatients.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-4">Patient Info</th>
                  <th className="py-3 px-4">Admitted Status</th>
                  <th className="py-3 px-4">Assigned Bed / Ward</th>
                  <th className="py-3 px-4">Physician in Charge</th>
                  <th className="py-3 px-4">Emergency Contact</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {inpatients.map(pat => {
                  const doc = doctors.find(d => d.id === pat.doctorInChargeId) || doctors[0];
                  return (
                    <tr key={pat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={pat.avatar}
                            alt={pat.name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-cyan-500/20"
                          />
                          <div>
                            <p className="font-extrabold text-slate-900 dark:text-white">{pat.name}</p>
                            <p className="text-[11px] text-slate-400">{pat.age} yrs • {pat.gender} • <span className="text-rose-500 font-bold">{pat.bloodGroup}</span></p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                          pat.admittedStatus === 'ICU'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 animate-pulse'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
                        }`}>
                          {pat.admittedStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-3.5 h-3.5 text-cyan-500" />
                          <span>{pat.assignedBed || 'Bed Ward A-01'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                          <span>{doc?.name || 'Dr. Alex Mercer'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {pat.emergencyContact || 'Family (+1 555-0192)'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedPatientForAction(pat);
                              setTransferTargetBedCode('ICU-02');
                              setTransferTargetWard('ICU & Critical Care');
                              setShowTransferModal(true);
                            }}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 text-cyan-700 dark:text-cyan-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer
                          </button>

                          <button
                            onClick={() => {
                              setSelectedPatientForAction(pat);
                              setShowDischargeModal(true);
                            }}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <LogOut className="w-3.5 h-3.5" /> Discharge
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: WARD CAPACITIES */}
      {activeTab === 'wards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map(dept => {
            const occupancyPct = Math.round((dept.occupiedBeds / dept.totalBeds) * 100);
            const isFull = occupancyPct >= 90;

            return (
              <div key={dept.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden space-y-4">
                
                {isFull && (
                  <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider animate-pulse">
                    High Capacity Alert
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-cyan-500/20">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{dept.name}</h3>
                    <p className="text-xs text-slate-500">Head: {dept.headDoctorName || dept.headDoctor || 'Dr. Chief'}</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {dept.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-600 dark:text-slate-300">Ward Occupancy Rate</span>
                    <span className={isFull ? 'text-rose-600 dark:text-rose-400' : 'text-cyan-600 dark:text-cyan-400'}>
                      {dept.occupiedBeds} / {dept.totalBeds} ({occupancyPct}%)
                    </span>
                  </div>

                  <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFull ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>
                </div>

                {/* Quick Update Beds Control */}
                {canEdit && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {editingDeptId === dept.id ? (
                      <div className="flex items-center gap-2 w-full">
                        <input
                          type="number"
                          value={bedsInput}
                          onChange={(e) => setBedsInput(Number(e.target.value))}
                          className="w-20 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                          max={dept.totalBeds}
                          min={0}
                        />
                        <button
                          onClick={() => handleSaveDepartmentBeds(dept.id)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" /> Save
                        </button>
                        <button
                          onClick={() => setEditingDeptId(null)}
                          className="p-1 text-slate-400 hover:text-slate-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingDeptId(dept.id);
                          setBedsInput(dept.occupiedBeds);
                        }}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 rounded-lg hover:bg-cyan-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Adjust Occupied Beds</span>
                      </button>
                    )}
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: ADMIT INPATIENT & ALLOCATE BED */}
      {showAdmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 relative space-y-4">
            <button onClick={() => setShowAdmitModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-md">
                <Bed className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Admit Inpatient & Allocate Bed</h3>
                <p className="text-xs text-slate-500">Assign ward bed and clinical doctor to patient</p>
              </div>
            </div>

            <form onSubmit={handleAdmitSubmit} className="space-y-3 text-xs">
              
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Select Patient</label>
                <select
                  value={admitPatientId}
                  onChange={(e) => setAdmitPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                  required
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.age}y, {p.gender}) — Currently: {p.admittedStatus}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Admission Type</label>
                  <select
                    value={admitStatusType}
                    onChange={(e) => setAdmitStatusType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="Inpatient (Ward)">Inpatient (Ward)</option>
                    <option value="ICU">ICU (Critical Care)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Target Ward Wing</label>
                  <select
                    value={admitWard}
                    onChange={(e) => setAdmitWard(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Bed Allocation Code</label>
                  <input
                    type="text"
                    value={admitBedCode}
                    onChange={(e) => setAdmitBedCode(e.target.value)}
                    placeholder="e.g. ICU-05 or WARD-102"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Attending Physician</label>
                  <select
                    value={admitDoctorId}
                    onChange={(e) => setAdmitDoctorId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Confirm Patient Admission & Lock Bed
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TRANSFER BED */}
      {showTransferModal && selectedPatientForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 relative space-y-4">
            <button onClick={() => setShowTransferModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-600 text-white flex items-center justify-center font-bold shadow-md">
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Transfer Patient Bed</h3>
                <p className="text-xs text-slate-500">Relocate {selectedPatientForAction.name} to another bed</p>
              </div>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Current Bed Assignment</span>
                <p className="font-extrabold text-slate-900 dark:text-white">{selectedPatientForAction.assignedBed || 'Ward A-01'}</p>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Destination Ward</label>
                <select
                  value={transferTargetWard}
                  onChange={(e) => setTransferTargetWard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">New Bed Number / Code</label>
                <input
                  type="text"
                  value={transferTargetBedCode}
                  onChange={(e) => setTransferTargetBedCode(e.target.value)}
                  placeholder="e.g. ICU-04 or WARD-202"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Confirm Bed Relocation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DISCHARGE PATIENT */}
      {showDischargeModal && selectedPatientForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 relative space-y-4">
            <button onClick={() => setShowDischargeModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-bold shadow-md">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Process Inpatient Discharge</h3>
                <p className="text-xs text-slate-500">Free bed and finalize patient departure</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-xs space-y-2">
              <p className="font-bold text-rose-900 dark:text-rose-200">
                Are you sure you want to discharge <span className="underline">{selectedPatientForAction.name}</span>?
              </p>
              <p className="text-rose-700 dark:text-rose-300">
                This will release Bed <span className="font-bold">{selectedPatientForAction.assignedBed || 'Ward A-01'}</span>, update patient status to Discharged, and decrement occupied bed counts in telemetry.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDischargeModal(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDischargeConfirm}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                Confirm Discharge & Release Bed
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
