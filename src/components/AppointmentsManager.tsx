import React, { useState } from 'react';
import jsPDF from 'jspdf';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import {
  Calendar as CalendarIcon, Clock, Plus, Filter, Search, User, CheckCircle2,
  XCircle, AlertTriangle, FileText, DollarSign, CreditCard, ChevronRight, X, FileDown,
  Video, PhoneCall, Sparkles
} from 'lucide-react';
import { Appointment, AppointmentStatus, AppointmentPriority } from '../types';
import { TelehealthVideoModal } from './TelehealthVideoModal';

export const AppointmentsManager: React.FC = () => {
  const {
    appointments, doctors, patients, departments, bookAppointment,
    updateAppointmentStatus, openCheckoutModal, invoices, searchQuery, setSearchQuery
  } = useHospital();
  const { activeRole } = useAuth();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [showBookModal, setShowBookModal] = useState(false);
  const [activeTelehealthApt, setActiveTelehealthApt] = useState<Appointment | null>(null);

  // Booking Form State
  const [patientId, setPatientId] = useState(patients[0]?.id || 'pat-1');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || 'doc-1');
  const [date, setDate] = useState('2026-08-05');
  const [timeSlot, setTimeSlot] = useState('09:00 AM');
  const [priority, setPriority] = useState<AppointmentPriority>('Routine');
  const [symptoms, setSymptoms] = useState('');

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          apt.departmentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || apt.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || apt.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(p => p.id === patientId);
    const doc = doctors.find(d => d.id === doctorId);
    const dept = departments.find(d => d.id === doc?.departmentId);

    const success = await bookAppointment({
      patientId,
      patientName: pat?.name || 'Sophia Martinez',
      doctorId,
      doctorName: doc?.name || 'Dr. Robert Chen',
      departmentId: dept?.id || 'dept-cardio',
      departmentName: dept?.name || 'Cardiology',
      date,
      timeSlot,
      priority,
      symptoms: symptoms || 'Routine Health Consultation'
    });

    if (success) {
      setShowBookModal(false);
      setSymptoms('');
    }
  };

  const exportPDFSlip = (apt: Appointment) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Smart Hospital Management System', 14, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL APPOINTMENT CONSULTATION SLIP', 14, 28);
    doc.line(14, 32, 196, 32);

    doc.setFontSize(10);
    doc.text(`Appointment ID: ${apt.id}`, 14, 42);
    doc.text(`Booking Date: ${apt.createdAt.substring(0, 10)}`, 14, 48);
    doc.text(`Status: ${apt.status} (${apt.priority} Priority)`, 14, 54);

    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT DETAILS', 14, 66);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient Name: ${apt.patientName}`, 14, 72);
    doc.text(`Patient ID: ${apt.patientId}`, 14, 78);

    doc.setFont('helvetica', 'bold');
    doc.text('CLINIC & DOCTOR ASSIGNMENT', 14, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(`Assigned Doctor: ${apt.doctorName}`, 14, 96);
    doc.text(`Department: ${apt.departmentName}`, 14, 102);
    doc.text(`Scheduled Date & Time: ${apt.date} at ${apt.timeSlot}`, 14, 108);

    doc.setFont('helvetica', 'bold');
    doc.text('SYMPTOMS & FEES', 14, 120);
    doc.setFont('helvetica', 'normal');
    doc.text(`Chief Complaints: ${apt.symptoms}`, 14, 126);
    doc.text(`Consultation Fee: $${(apt.consultationFee ?? 0).toFixed(2)} (${apt.isPaid ? 'PAID' : 'UNPAID'})`, 14, 132);

    doc.save(`Appointment_${apt.id}.pdf`);
  };

  const canEdit = activeRole === 'Super Admin' || activeRole === 'Hospital Admin' || activeRole === 'Doctor';

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'Confirmed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'In Progress': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300 animate-pulse';
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'Completed': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Appointment Booking & Queue Triage
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Schedule consultation slots, assign priority triage, issue PDF slips, and track queue status.
          </p>
        </div>

        <button
          onClick={() => setShowBookModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment Slot</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient, doctor, or department..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-44 px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <option value="All">All Statuses</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="w-full sm:w-44 px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <option value="All">All Priorities</option>
          <option value="Routine">Routine</option>
          <option value="Urgent">Urgent</option>
          <option value="Emergency">Emergency</option>
        </select>
      </div>

      {/* Mobile Card List */}
      <div className="block sm:hidden space-y-3">
        {filteredAppointments.map(apt => {
          const relatedInv = invoices.find(i => i.patientId === apt.patientId && i.paymentStatus === 'Unpaid');

          return (
            <div key={apt.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white">{apt.patientName}</p>
                  <p className="text-[11px] text-slate-400">{apt.symptoms}</p>
                </div>
                <div className="flex items-center gap-1">
                  {apt.priority === 'Emergency' && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500 text-white animate-pulse">
                      🚨 ER
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getStatusBadge(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Doctor & Dept</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400 block truncate">{apt.doctorName}</span>
                  <span className="text-[10px] text-slate-500">{apt.departmentName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Slot & Date</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{apt.timeSlot}</span>
                  <span className="text-[10px] text-slate-400">{apt.date}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation Fee</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">${apt.consultationFee}</span>
                  {apt.isPaid ? (
                    <span className="ml-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1 py-0.5 rounded">PAID</span>
                  ) : (
                    <button
                      onClick={() => relatedInv && openCheckoutModal(relatedInv)}
                      className="ml-1.5 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 px-1 py-0.5 rounded cursor-pointer"
                    >
                      Pay Now
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => setActiveTelehealthApt(apt)}
                    className="px-2.5 py-1 text-[11px] font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                    title="Launch WebRTC Video Consultation"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Video Call</span>
                  </button>

                  <button
                    onClick={() => exportPDFSlip(apt)}
                    className="p-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 rounded-lg cursor-pointer"
                    title="Download Slip"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>

                  {canEdit && (
                    <select
                      value={apt.status}
                      onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as any)}
                      className="px-2 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Appointments Table */}
      <div className="hidden sm:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Doctor & Dept</th>
                <th className="py-3 px-4">Slot & Date</th>
                <th className="py-3 px-4">Priority & Status</th>
                <th className="py-3 px-4">Billing Fee</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAppointments.map(apt => {
                const relatedInv = invoices.find(i => i.patientId === apt.patientId && i.paymentStatus === 'Unpaid');

                return (
                  <tr key={apt.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {apt.patientName}
                      <span className="block text-[10px] font-normal text-slate-400">{apt.symptoms}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-cyan-600 dark:text-cyan-400">{apt.doctorName}</p>
                      <p className="text-[11px] text-slate-500">{apt.departmentName}</p>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{apt.timeSlot}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 block">{apt.date}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusBadge(apt.status)}`}>
                          {apt.status}
                        </span>
                        {apt.priority === 'Emergency' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                            🚨 Emergency
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white">${apt.consultationFee}</span>
                      {apt.isPaid ? (
                        <span className="ml-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.5 rounded">PAID</span>
                      ) : (
                        <button
                          onClick={() => relatedInv && openCheckoutModal(relatedInv)}
                          className="ml-2 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950 hover:underline px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          UNPAID (Pay)
                        </button>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-1.5">
                      <button
                        onClick={() => setActiveTelehealthApt(apt)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg shadow-sm inline-flex items-center gap-1.5 cursor-pointer transition-all"
                        title="Host Telehealth WebRTC Video Call"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Start Video Call</span>
                      </button>

                      <button
                        onClick={() => exportPDFSlip(apt)}
                        className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center align-middle"
                        title="Download PDF Consultation Slip"
                      >
                        <FileText className="w-4 h-4 text-cyan-500" />
                      </button>

                      {apt.status === 'Confirmed' && (
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'Completed')}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer inline-flex items-center align-middle"
                        >
                          Mark Completed
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* WebRTC Telehealth Video Consultation Modal */}
      {activeTelehealthApt && (
        <TelehealthVideoModal
          appointment={activeTelehealthApt}
          onClose={() => setActiveTelehealthApt(null)}
        />
      )}

      {/* Booking Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 relative">
            <button onClick={() => setShowBookModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Book Patient Consultation</h3>

            <form onSubmit={handleBook} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Select Patient</label>
                <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Select Doctor Specialist</label>
                <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} — {d.specialization} (${d.consultationFee})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Time Slot</label>
                  <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Priority Level</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                  <option value="Routine">Routine</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency - Immediate Triage</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Chief Complaints / Symptoms</label>
                <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} placeholder="Describe symptoms or reasons for visit..." className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white h-20" required />
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                Confirm Booking & Generate Invoice
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
