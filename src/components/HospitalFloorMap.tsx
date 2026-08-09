import React, { useState, useMemo } from 'react';
import { useHospital } from '../context/HospitalContext';
import {
  Building2, Search, Filter, CheckCircle2, AlertTriangle, Shield,
  BedDouble, UserCheck, UserPlus, Sparkles, X, ChevronRight, Layers,
  Activity, AlertCircle, RefreshCw, Check, ArrowRightLeft, Stethoscope,
  Info, Clock, Wrench, Eye, ShieldAlert, HeartPulse, UserMinus
} from 'lucide-react';
import { Patient, Department } from '../types';

export interface HospitalBed {
  id: string; // e.g. "BED-101A"
  bedNumber: string; // "Bed A"
  roomId: string; // "101"
  roomName: string; // "ICU Cardiac Suite 1"
  floor: 'Ground' | '1st Floor' | '2nd Floor' | '3rd Floor';
  wing: 'East Wing' | 'West Wing' | 'North Tower' | 'Central ICU Bay';
  departmentId: string;
  departmentName: string;
  status: 'Available' | 'Occupied' | 'ICU Critical' | 'Maintenance' | 'Cleaning';
  patientId?: string;
  patientName?: string;
  patientAge?: number;
  patientGender?: string;
  assignedDoctor?: string;
  admittedAt?: string;
  equipment?: string[];
  vitalStatus?: 'Optimal' | 'Elevated' | 'Critical';
}

interface HospitalFloorMapProps {
  onSelectPatient?: (patientId: string) => void;
}

export const HospitalFloorMap: React.FC<HospitalFloorMapProps> = ({ onSelectPatient }) => {
  const { patients, departments, triggerEmergencyAlert, updateBedOccupancy, refreshData } = useHospital();

  const [activeFloor, setActiveFloor] = useState<'All' | 'Ground' | '1st Floor' | '2nd Floor' | '3rd Floor'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Available' | 'Occupied' | 'ICU Critical' | 'Maintenance'>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('All');

  // Modal / Drawer State for Bed Action Details
  const [selectedBed, setSelectedBed] = useState<HospitalBed | null>(null);
  const [showAssignModal, setShowAssignModal] = useState<boolean>(false);
  const [assignPatientId, setAssignPatientId] = useState<string>('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Generate complete hospital floor bed dataset synchronized with departments and patients
  const initialBeds = useMemo(() => {
    const beds: HospitalBed[] = [];

    // Map admitted patients to beds
    const admittedPatients = patients.filter(p => p.admittedStatus === 'Inpatient (Ward)' || p.admittedStatus === 'ICU');

    // Define room structures per floor
    const floorsConfig = [
      {
        floor: 'Ground' as const,
        rooms: [
          { roomId: 'ER-01', name: 'Emergency Trauma Bay 1', dept: 'Emergency & ICU', wing: 'North Tower' as const, count: 4, type: 'ICU Critical' },
          { roomId: 'ER-02', name: 'Emergency Triage Room 2', dept: 'Emergency & ICU', wing: 'North Tower' as const, count: 4, type: 'Occupied' },
          { roomId: 'OPD-01', name: 'Outpatient Observation Suite A', dept: 'General Medicine', wing: 'West Wing' as const, count: 3, type: 'Available' },
          { roomId: 'OPD-02', name: 'Outpatient Recovery Suite B', dept: 'General Medicine', wing: 'West Wing' as const, count: 3, type: 'Available' }
        ]
      },
      {
        floor: '1st Floor' as const,
        rooms: [
          { roomId: '101', name: 'Cardiac ICU Suite 101', dept: 'Cardiology', wing: 'Central ICU Bay' as const, count: 4, type: 'ICU Critical' },
          { roomId: '102', name: 'Coronary Care Unit 102', dept: 'Cardiology', wing: 'Central ICU Bay' as const, count: 4, type: 'Occupied' },
          { roomId: '103', name: 'Cardiac Telemetry Ward 103', dept: 'Cardiology', wing: 'East Wing' as const, count: 4, type: 'Available' },
          { roomId: '104', name: 'Vascular Recovery Suite 104', dept: 'Cardiology', wing: 'East Wing' as const, count: 2, type: 'Maintenance' }
        ]
      },
      {
        floor: '2nd Floor' as const,
        rooms: [
          { roomId: '201', name: 'Orthopedic Recovery 201', dept: 'Orthopedics', wing: 'West Wing' as const, count: 4, type: 'Occupied' },
          { roomId: '202', name: 'Surgical Care Ward 202', dept: 'General Medicine', wing: 'West Wing' as const, count: 4, type: 'Available' },
          { roomId: '203', name: 'Post-Op Surgical ICU 203', dept: 'General Medicine', wing: 'East Wing' as const, count: 4, type: 'Occupied' },
          { roomId: '204', name: 'Rehabilitation Room 204', dept: 'Orthopedics', wing: 'East Wing' as const, count: 3, type: 'Available' }
        ]
      },
      {
        floor: '3rd Floor' as const,
        rooms: [
          { roomId: '301', name: 'Pediatric Care Unit 301', dept: 'Pediatrics', wing: 'East Wing' as const, count: 4, type: 'Occupied' },
          { roomId: '302', name: 'Neonatal ICU Suite 302', dept: 'Pediatrics', wing: 'Central ICU Bay' as const, count: 4, type: 'ICU Critical' },
          { roomId: '303', name: 'Pediatric Isolation 303', dept: 'Pediatrics', wing: 'West Wing' as const, count: 3, type: 'Available' },
          { roomId: '304', name: 'Maternity Care Ward 304', dept: 'General Medicine', wing: 'West Wing' as const, count: 4, type: 'Available' }
        ]
      }
    ];

    let patientIdx = 0;

    floorsConfig.forEach(f => {
      f.rooms.forEach(r => {
        for (let i = 1; i <= r.count; i++) {
          const letter = String.fromCharCode(64 + i);
          const bedId = `BED-${r.roomId}${letter}`;
          const bedNumber = `Bed ${letter}`;

          // Assign patient if available or mock realistic status
          let status: HospitalBed['status'] = 'Available';
          let pat: Patient | undefined = undefined;

          if (r.type === 'ICU Critical' && i <= 2) {
            status = 'ICU Critical';
            pat = admittedPatients[patientIdx % Math.max(1, admittedPatients.length)];
            patientIdx++;
          } else if (r.type === 'Occupied' || (i % 2 === 1 && r.type !== 'Available')) {
            status = 'Occupied';
            pat = admittedPatients[patientIdx % Math.max(1, admittedPatients.length)];
            patientIdx++;
          } else if (r.type === 'Maintenance' && i === 2) {
            status = 'Maintenance';
          } else if (i === 4 && r.roomId === '202') {
            status = 'Cleaning';
          }

          beds.push({
            id: bedId,
            bedNumber,
            roomId: r.roomId,
            roomName: r.name,
            floor: f.floor,
            wing: r.wing,
            departmentId: r.dept,
            departmentName: r.dept,
            status,
            patientId: pat?.id,
            patientName: pat?.name,
            patientAge: pat?.age,
            patientGender: pat?.gender,
            assignedDoctor: 'Dr. Sarah Jenkins',
            admittedAt: '2026-08-06 09:30 AM',
            equipment: r.dept.includes('ICU') || status === 'ICU Critical'
              ? ['GE Ventilator', 'ECG Monitor', 'Infusion Pump', 'Pulse Oximeter']
              : ['Standard Telemetry', 'Oxygen Wall Unit'],
            vitalStatus: status === 'ICU Critical' ? 'Critical' : (status === 'Occupied' && i % 2 === 0 ? 'Elevated' : 'Optimal')
          });
        }
      });
    });

    return beds;
  }, [patients]);

  const [bedsState, setBedsState] = useState<HospitalBed[]>(initialBeds);

  // Synchronize state when initialBeds updates
  React.useEffect(() => {
    setBedsState(initialBeds);
  }, [initialBeds]);

  // Overall KPI metrics
  const totalBedsCount = bedsState.length;
  const occupiedCount = bedsState.filter(b => b.status === 'Occupied' || b.status === 'ICU Critical').length;
  const availableCount = bedsState.filter(b => b.status === 'Available').length;
  const icuCriticalCount = bedsState.filter(b => b.status === 'ICU Critical').length;
  const maintenanceCount = bedsState.filter(b => b.status === 'Maintenance' || b.status === 'Cleaning').length;

  const occupancyPercentage = Math.round((occupiedCount / totalBedsCount) * 100);

  // Filter beds based on active floor, status filter, search query, and department
  const filteredBeds = useMemo(() => {
    return bedsState.filter(bed => {
      // Floor Filter
      if (activeFloor !== 'All' && bed.floor !== activeFloor) return false;

      // Status Filter
      if (statusFilter === 'Available' && bed.status !== 'Available') return false;
      if (statusFilter === 'Occupied' && (bed.status !== 'Occupied' && bed.status !== 'ICU Critical')) return false;
      if (statusFilter === 'ICU Critical' && bed.status !== 'ICU Critical') return false;
      if (statusFilter === 'Maintenance' && (bed.status !== 'Maintenance' && bed.status !== 'Cleaning')) return false;

      // Department Filter
      if (selectedDept !== 'All' && bed.departmentName.toLowerCase() !== selectedDept.toLowerCase()) return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRoom = bed.roomId.toLowerCase().includes(q) || bed.roomName.toLowerCase().includes(q);
        const matchesBed = bed.id.toLowerCase().includes(q) || bed.bedNumber.toLowerCase().includes(q);
        const matchesDept = bed.departmentName.toLowerCase().includes(q);
        const matchesPatient = bed.patientName ? bed.patientName.toLowerCase().includes(q) : false;
        const matchesWing = bed.wing.toLowerCase().includes(q);

        if (!matchesRoom && !matchesBed && !matchesDept && !matchesPatient && !matchesWing) {
          return false;
        }
      }

      return true;
    });
  }, [bedsState, activeFloor, statusFilter, searchQuery, selectedDept]);

  // Group filtered beds by Room for visual room card blocks
  const groupedRooms = useMemo(() => {
    const map = new Map<string, { roomId: string; roomName: string; floor: string; wing: string; dept: string; beds: HospitalBed[] }>();

    filteredBeds.forEach(bed => {
      if (!map.has(bed.roomId)) {
        map.set(bed.roomId, {
          roomId: bed.roomId,
          roomName: bed.roomName,
          floor: bed.floor,
          wing: bed.wing,
          dept: bed.departmentName,
          beds: []
        });
      }
      map.get(bed.roomId)!.beds.push(bed);
    });

    return Array.from(map.values());
  }, [filteredBeds]);

  // Action: Toggle Bed Status or Discharge
  const handleToggleBedStatus = (bedId: string, newStatus: HospitalBed['status']) => {
    setBedsState(prev => prev.map(b => {
      if (b.id === bedId) {
        return {
          ...b,
          status: newStatus,
          patientId: newStatus === 'Available' || newStatus === 'Cleaning' ? undefined : b.patientId,
          patientName: newStatus === 'Available' || newStatus === 'Cleaning' ? undefined : b.patientName,
        };
      }
      return b;
    }));

    if (selectedBed && selectedBed.id === bedId) {
      setSelectedBed(prev => prev ? {
        ...prev,
        status: newStatus,
        patientName: newStatus === 'Available' ? undefined : prev.patientName
      } : null);
    }

    setActionNotice(`Bed ${bedId} status updated to: ${newStatus}`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Action: Assign Patient to Bed
  const handleAssignPatientToBed = () => {
    if (!selectedBed || !assignPatientId) return;

    const pat = patients.find(p => p.id === assignPatientId);
    if (!pat) return;

    setBedsState(prev => prev.map(b => {
      if (b.id === selectedBed.id) {
        return {
          ...b,
          status: 'Occupied',
          patientId: pat.id,
          patientName: pat.name,
          patientAge: pat.age,
          patientGender: pat.gender,
          admittedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          vitalStatus: 'Optimal'
        };
      }
      return b;
    }));

    setSelectedBed(prev => prev ? {
      ...prev,
      status: 'Occupied',
      patientId: pat.id,
      patientName: pat.name,
      patientAge: pat.age,
      patientGender: pat.gender,
      admittedAt: 'Just now',
      vitalStatus: 'Optimal'
    } : null);

    setShowAssignModal(false);
    setActionNotice(`Assigned patient ${pat.name} to ${selectedBed.id} (${selectedBed.roomName})`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Color helper for Bed Badges
  const getBedStatusStyle = (status: HospitalBed['status']) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400 dark:border-emerald-600';
      case 'Occupied':
        return 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 border-cyan-400 dark:border-cyan-700';
      case 'ICU Critical':
        return 'bg-rose-500/15 hover:bg-rose-500/25 text-rose-800 dark:text-rose-200 border-rose-500 shadow-sm animate-pulse';
      case 'Maintenance':
        return 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-400 dark:border-amber-700';
      case 'Cleaning':
        return 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-400 dark:border-indigo-700';
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-cyan-600 text-white font-bold text-xs shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-white hover:text-cyan-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                Interactive Hospital Bed Telemetry & Floor Blueprint
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800">
                REAL-TIME BED MATRIX
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live spatial layout displaying available vs. occupied hospital beds, ICU critical bays, and rapid bed assignment.
            </p>
          </div>
        </div>

        {/* SEARCH & QUICK FILTERS */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Room / Bed Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search room, bed ID, patient, wing..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Department Dropdown */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
          >
            <option value="All">All Departments</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Emergency & ICU">Emergency & ICU</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="General Medicine">General Medicine</option>
          </select>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        
        {/* Total Capacity */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>Total Bed Capacity</span>
            <BedDouble className="w-4 h-4 text-slate-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalBedsCount}</span>
            <span className="text-[10px] text-slate-500 font-bold">100% Units</span>
          </div>
        </div>

        {/* Available Beds */}
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <span>Available Beds</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{availableCount}</span>
            <span className="text-[10px] text-emerald-600 font-bold">Ready for Admit</span>
          </div>
        </div>

        {/* Occupied Beds */}
        <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
          <div className="flex items-center justify-between text-[11px] font-bold text-cyan-600 dark:text-cyan-400">
            <span>Occupied Beds</span>
            <UserCheck className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{occupiedCount}</span>
            <span className="text-[10px] text-cyan-600 font-bold">{occupancyPercentage}% Occupancy</span>
          </div>
        </div>

        {/* ICU Critical */}
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/40">
          <div className="flex items-center justify-between text-[11px] font-bold text-rose-600 dark:text-rose-400">
            <span>ICU Critical Care</span>
            <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{icuCriticalCount}</span>
            <span className="text-[10px] text-rose-600 font-bold animate-pulse">Critical Monitors</span>
          </div>
        </div>

        {/* Maintenance / Sanitizing */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-amber-600 dark:text-amber-400">
            <span>Maintenance / Cleaning</span>
            <Wrench className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{maintenanceCount}</span>
            <span className="text-[10px] text-amber-600 font-bold">Sanitizing</span>
          </div>
        </div>

      </div>

      {/* FLOOR SELECTOR TABS & STATUS FILTER ROW */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Floor Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full md:w-auto overflow-x-auto text-xs">
          {(['All', 'Ground', '1st Floor', '2nd Floor', '3rd Floor'] as const).map(fl => (
            <button
              key={fl}
              onClick={() => setActiveFloor(fl)}
              className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeFloor === fl
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{fl === 'All' ? 'All Floors' : fl}</span>
            </button>
          ))}
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase mr-1">Status:</span>

          <button
            onClick={() => setStatusFilter('All')}
            className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer ${
              statusFilter === 'All' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            All Beds
          </button>

          <button
            onClick={() => setStatusFilter('Available')}
            className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer ${
              statusFilter === 'Available' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
            }`}
          >
            Available ({availableCount})
          </button>

          <button
            onClick={() => setStatusFilter('Occupied')}
            className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer ${
              statusFilter === 'Occupied' ? 'bg-cyan-600 text-white' : 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-400'
            }`}
          >
            Occupied ({occupiedCount})
          </button>

          <button
            onClick={() => setStatusFilter('ICU Critical')}
            className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer ${
              statusFilter === 'ICU Critical' ? 'bg-rose-600 text-white' : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
            }`}
          >
            ICU Critical ({icuCriticalCount})
          </button>

          <button
            onClick={() => setStatusFilter('Maintenance')}
            className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer ${
              statusFilter === 'Maintenance' ? 'bg-amber-600 text-white' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
            }`}
          >
            Maintenance ({maintenanceCount})
          </button>
        </div>

      </div>

      {/* VISUAL ROOM GRID ARCHITECTURE */}
      {groupedRooms.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 dark:bg-slate-800/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <BedDouble className="w-10 h-10 text-slate-400 mx-auto" />
          <h4 className="font-extrabold text-base text-slate-900 dark:text-white">No Hospital Rooms Match Query</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try adjusting your search keywords, active floor tabs, or status filter options.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedRooms.map(room => {
            const totalRoomBeds = room.beds.length;
            const occupiedRoomBeds = room.beds.filter(b => b.status === 'Occupied' || b.status === 'ICU Critical').length;

            return (
              <div
                key={room.roomId}
                className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-cyan-500/50 transition-all"
              >
                {/* Room Header */}
                <div>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                      {room.floor} • {room.wing}
                    </span>

                    <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
                      {occupiedRoomBeds}/{totalRoomBeds} Beds Occupied
                    </span>
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{room.roomName}</span>
                    <span className="text-xs font-mono font-bold text-slate-400">#{room.roomId}</span>
                  </h4>

                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                    Dept: <strong className="text-slate-700 dark:text-slate-300">{room.dept}</strong>
                  </p>
                </div>

                {/* Individual Bed Slots Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
                  {room.beds.map(bed => (
                    <button
                      key={bed.id}
                      onClick={() => setSelectedBed(bed)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${getBedStatusStyle(bed.status)}`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-black text-xs flex items-center gap-1">
                            <BedDouble className="w-3.5 h-3.5" />
                            {bed.bedNumber}
                          </span>

                          <span className={`w-2 h-2 rounded-full ${
                            bed.status === 'Available' ? 'bg-emerald-500' :
                            bed.status === 'ICU Critical' ? 'bg-rose-500 animate-ping' :
                            bed.status === 'Occupied' ? 'bg-cyan-500' : 'bg-amber-500'
                          }`} />
                        </div>

                        {bed.status === 'Available' ? (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <UserPlus className="w-3 h-3" /> Available
                          </span>
                        ) : bed.status === 'Occupied' || bed.status === 'ICU Critical' ? (
                          <div>
                            <p className="text-xs font-extrabold truncate text-slate-900 dark:text-white">
                              {bed.patientName}
                            </p>
                            <p className="text-[10px] opacity-80 mt-0.5 flex items-center gap-1">
                              {bed.vitalStatus === 'Critical' && <AlertCircle className="w-3 h-3 text-rose-500" />}
                              <span>{bed.status === 'ICU Critical' ? 'ICU Monitored' : 'Inpatient Ward'}</span>
                            </p>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Wrench className="w-3 h-3" /> {bed.status}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 text-[9px] font-mono opacity-60 text-right">
                        {bed.id}
                      </div>
                    </button>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* BED DETAIL MODAL / DRAWER */}
      {selectedBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 relative space-y-4">
            
            <button
              onClick={() => setSelectedBed(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Bed Drawer Header */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-md ${
                selectedBed.status === 'Available' ? 'bg-emerald-600' :
                selectedBed.status === 'ICU Critical' ? 'bg-rose-600 animate-pulse' :
                selectedBed.status === 'Occupied' ? 'bg-cyan-600' : 'bg-amber-600'
              }`}>
                <BedDouble className="w-6 h-6" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {selectedBed.id} ({selectedBed.bedNumber})
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    selectedBed.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                    selectedBed.status === 'ICU Critical' ? 'bg-rose-600 text-white' :
                    selectedBed.status === 'Occupied' ? 'bg-cyan-100 text-cyan-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedBed.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedBed.roomName} • {selectedBed.floor} ({selectedBed.wing})
                </p>
              </div>
            </div>

            {/* Bed Info Grid */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Department Unit:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedBed.departmentName}</span>
              </div>

              {selectedBed.patientName ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Occupant Patient:</span>
                    <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{selectedBed.patientName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Assigned Physician:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedBed.assignedDoctor}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Telemetry Vital Status:</span>
                    <span className={`font-black ${selectedBed.vitalStatus === 'Critical' ? 'text-rose-600 dark:text-rose-400 animate-pulse' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {selectedBed.vitalStatus || 'Optimal'}
                    </span>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-700 dark:text-emerald-300 text-center font-bold">
                  ✓ This bed is currently disinfected and ready for immediate patient admission.
                </div>
              )}

              {/* Connected Telemetry Equipment */}
              <div>
                <span className="text-slate-400 font-medium block mb-1">Attached Medical Gear:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedBed.equipment?.map((eq, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                      {eq}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action Controls */}
            <div className="space-y-2 pt-2">
              {selectedBed.status === 'Available' ? (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" /> Assign Patient to {selectedBed.id}
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleToggleBedStatus(selectedBed.id, 'Available')}
                    className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <UserMinus className="w-4 h-4" /> Discharge / Vacate
                  </button>

                  <button
                    onClick={() => handleToggleBedStatus(selectedBed.id, 'Cleaning')}
                    className="py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Wrench className="w-4 h-4" /> Mark Sanitizing
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* PATIENT ASSIGNMENT SUB-MODAL */}
      {showAssignModal && selectedBed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 relative space-y-4">
            
            <button
              onClick={() => setShowAssignModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-cyan-600" />
              <span>Assign Patient to {selectedBed.id}</span>
            </h4>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an admitted or outpatient record to allocate to {selectedBed.roomName}.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Registered Patient
                </label>
                <select
                  value={assignPatientId}
                  onChange={(e) => setAssignPatientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="">-- Choose Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.gender}, {p.age}y) - Status: {p.admittedStatus}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleAssignPatientToBed}
                disabled={!assignPatientId}
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Confirm Bed Allocation
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
