import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useHospital } from '../context/HospitalContext';
import {
  LayoutDashboard, UserCheck, Users, Calendar, Building2,
  Pill, TestTube2, FileText, ClipboardList, Package, CreditCard,
  Bot, ShieldAlert, Sparkles, Globe, X, Hospital, FileCode2, Mail, AlertTriangle
} from 'lucide-react';

export type ActiveTab =
  | 'landing'
  | 'dashboard'
  | 'doctors'
  | 'patients'
  | 'appointments'
  | 'departments'
  | 'pharmacy'
  | 'laboratory'
  | 'medical-records'
  | 'prescriptions'
  | 'inventory'
  | 'billing'
  | 'ai-assistant'
  | 'audit-logs';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { activeRole } = useAuth();
  const {
    doctors, patients, appointments, pharmacy, labOrders, invoices,
    setShowArchitectureModal, setShowEmailLogModal, triggerEmergencyAlert
  } = useHospital();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const apts = appointments || [];
  const invs = invoices || [];
  const phar = pharmacy || [];
  const docs = doctors || [];
  const pats = patients || [];

  const pendingAppointments = apts.filter(a => a.status === 'Pending').length;
  const unpaidInvoices = invs.filter(i => i.paymentStatus === 'Unpaid').length;
  const lowStockMeds = phar.filter(p => ((p as any).stockCount ?? (p as any).stockQuantity ?? 0) <= ((p as any).reorderLevel ?? (p as any).minReorderLevel ?? 0)).length;

  const navItems = [
    { id: 'landing' as ActiveTab, label: 'Public Portal Home', icon: Globe, roles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Receptionist', 'Patient'] },
    { id: 'dashboard' as ActiveTab, label: 'Dashboard Analytics', icon: LayoutDashboard, roles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Receptionist', 'Patient'] },
    { id: 'doctors' as ActiveTab, label: 'Doctors Directory', icon: UserCheck, count: docs.length, roles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Receptionist', 'Patient'] },
    { id: 'patients' as ActiveTab, label: 'Patient Directory & EHR', icon: Users, count: pats.length, roles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Receptionist', 'Patient'] },
    { id: 'appointments' as ActiveTab, label: 'Appointments Queue', icon: Calendar, badge: pendingAppointments ? `${pendingAppointments} new` : undefined, roles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Receptionist', 'Patient'] },
    { id: 'departments' as ActiveTab, label: 'Inpatient & Bed Management', icon: Building2, roles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Receptionist'] },
    { id: 'pharmacy' as ActiveTab, label: 'Pharmacy & Inventory', icon: Pill, badge: lowStockMeds ? `${lowStockMeds} low` : undefined, roles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Receptionist', 'Patient'] },
    { id: 'laboratory' as ActiveTab, label: 'Laboratory & Orders', icon: TestTube2, count: labOrders.length, roles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Receptionist', 'Patient'] },
    { id: 'medical-records' as ActiveTab, label: 'Medical Records (EHR)', icon: FileText, roles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Receptionist', 'Patient'] },
    { id: 'prescriptions' as ActiveTab, label: 'Digital Prescriptions', icon: ClipboardList, roles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Receptionist', 'Patient'] },
    { id: 'inventory' as ActiveTab, label: 'Asset Equipment', icon: Package, roles: ['Super Admin', 'Hospital Admin'] },
    { id: 'billing' as ActiveTab, label: 'Billing & Razorpay', icon: CreditCard, badge: unpaidInvoices ? `${unpaidInvoices} due` : undefined, roles: ['Super Admin', 'Hospital Admin', 'Receptionist', 'Patient'] },
    { id: 'ai-assistant' as ActiveTab, label: 'Gemini AI Health Triage', icon: Bot, isAi: true, roles: ['Super Admin', 'Hospital Admin', 'Doctor', 'Receptionist', 'Patient'] },
    { id: 'audit-logs' as ActiveTab, label: 'Security & Audit Logs', icon: ShieldAlert, roles: ['Super Admin', 'Hospital Admin'] },
  ];

  const filteredItems = navItems.filter(item => item.roles.includes(activeRole));

  const renderNavList = () => (
    <div className="space-y-1">
      <div className="px-3 py-2 text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
        Main Navigation
      </div>

      {filteredItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (onClose) onClose();
            }}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.isAi ? 'text-cyan-500 animate-pulse' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </div>

            {item.badge && (
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                isActive ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400'
              }`}>
                {item.badge}
              </span>
            )}

            {item.count !== undefined && !item.badge && (
              <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const renderMobileTools = () => (
    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
      <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500">
        System Utilities
      </div>

      <button
        onClick={() => {
          if (onClose) onClose();
          setShowArchitectureModal(true);
        }}
        className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <FileCode2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
        <span>System Architecture & Docs</span>
      </button>

      <button
        onClick={() => {
          if (onClose) onClose();
          setShowEmailLogModal(true);
        }}
        className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
      >
        <Mail className="w-4 h-4 text-amber-500" />
        <span>Nodemailer Email Logs</span>
      </button>

      <button
        onClick={() => {
          if (onClose) onClose();
          triggerEmergencyAlert('ER Trauma Code Red', 'Level-1 Ambulance inbound with severe trauma patient. ICU Room 02 prepared.');
        }}
        className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl transition-colors cursor-pointer"
      >
        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-pulse" />
        <span>Trigger Emergency Alert</span>
      </button>
    </div>
  );

  const renderFooterCard = () => (
    <div className="mt-6 p-3.5 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/60 border border-cyan-200/60 dark:border-slate-700">
      <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold text-xs mb-1">
        <Sparkles className="w-4 h-4 text-cyan-500" />
        <span>Gemini 2.5 Flash Engine</span>
      </div>
      <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
        Real-time AI clinical triage and automated digital prescription suggestions enabled.
      </p>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 shrink-0 hidden lg:flex flex-col justify-between h-screen overflow-y-auto bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 transition-colors sticky top-0">
        <div className="space-y-4">
          {renderNavList()}
        </div>
        {renderFooterCard()}
      </aside>

      {/* Mobile Drawer Overlay via Portal */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[9999] lg:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={onClose}
          />

          {/* Drawer Slide-Over Container */}
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full p-4 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto animate-in slide-in-from-left duration-200 border-r border-slate-200 dark:border-slate-800">
            <div>
              {/* Header inside drawer */}
              <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-sm">
                    <Hospital className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                    MediPulse<span className="text-cyan-600 dark:text-cyan-400">OS</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Close Navigation Menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {renderNavList()}
              {renderMobileTools()}
            </div>

            {renderFooterCard()}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

