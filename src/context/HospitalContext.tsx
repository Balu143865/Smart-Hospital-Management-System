import React, { createContext, useContext, useState, useEffect } from 'react';
import { safeFetchJson } from '../utils/apiHelper';
import {
  Doctor, Patient, Department, Appointment, MedicalRecord,
  Prescription, PharmacyItem, LabTestCatalog, LabOrder, InventoryItem,
  Invoice, NotificationItem, EmailLog, AuditLog
} from '../types';

interface HospitalContextType {
  doctors: Doctor[];
  patients: Patient[];
  departments: Department[];
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  prescriptions: Prescription[];
  pharmacy: PharmacyItem[];
  pharmacyItems?: PharmacyItem[];
  labTests: LabTestCatalog[];
  labCatalog?: LabTestCatalog[];
  labOrders: LabOrder[];
  inventory: InventoryItem[];
  invoices: Invoice[];
  notifications: NotificationItem[];
  emailLogs: EmailLog[];
  auditLogs: AuditLog[];
  analytics: any;
  loading: boolean;
  
  // Quick Search & Filter
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedDeptFilter: string;
  setSelectedDeptFilter: (d: string) => void;

  // Actions
  bookAppointment: (data: Partial<Appointment>) => Promise<boolean>;
  updateAppointmentStatus: (id: string, status: any) => Promise<void>;
  addDoctor: (data: Partial<Doctor>) => Promise<void>;
  addPatient: (data: Partial<Patient>) => Promise<void>;
  updatePatient?: (id: string, data: Partial<Patient>) => Promise<void>;
  addMedicalRecord: (data: Partial<MedicalRecord>) => Promise<void>;
  addPrescription: (data: Partial<Prescription>) => Promise<void>;
  addPharmacyItem: (data: Partial<PharmacyItem>) => Promise<void>;
  updatePharmacyStock: (id: string, newStock: number) => Promise<void>;
  reorderStock?: (id: string, amount: number) => Promise<void>;
  placeLabOrder: (data: Partial<LabOrder>) => Promise<void>;
  orderLabTest?: (data: Partial<LabOrder>) => Promise<void>;
  updateLabOrderStatus: (id: string, status: any, resultSummary?: string, resultValues?: any) => Promise<void>;
  addInventoryItem: (data: Partial<InventoryItem>) => Promise<void>;
  updateInventoryCondition?: (id: string, condition: string) => Promise<void>;
  updateBedOccupancy?: (deptId: string, occupiedBeds: number) => Promise<void>;
  analyzeSymptoms?: (symptoms: string, age?: number, gender?: string, medicalHistory?: string) => Promise<any>;
  createInvoice: (data: Partial<Invoice>) => Promise<void>;
  payInvoice: (invoiceId: string, method: string, paymentId?: string) => Promise<boolean>;
  triggerEmergencyAlert: (title: string, message: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  refreshData: () => Promise<void>;

  // Payment Checkout Modal
  activeCheckoutInvoice: Invoice | null;
  openCheckoutModal: (inv: Invoice) => void;
  closeCheckoutModal: () => void;
  
  // Active Modals
  showArchitectureModal: boolean;
  setShowArchitectureModal: (show: boolean) => void;
  showEmailLogModal: boolean;
  setShowEmailLogModal: (show: boolean) => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [pharmacy, setPharmacy] = useState<PharmacyItem[]>([]);
  const [labTests, setLabTests] = useState<LabTestCatalog[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  
  const [activeCheckoutInvoice, setActiveCheckoutInvoice] = useState<Invoice | null>(null);
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);
  const [showEmailLogModal, setShowEmailLogModal] = useState<boolean>(false);

  const refreshData = async () => {
    try {
      const syncRes = await safeFetchJson('/api/sync');
      if (syncRes && syncRes.success && syncRes.data) {
        const d = syncRes.data;
        if (d.doctors) setDoctors(d.doctors);
        if (d.patients) setPatients(d.patients);
        if (d.departments) setDepartments(d.departments);
        if (d.appointments) setAppointments(d.appointments);
        if (d.medicalRecords) setMedicalRecords(d.medicalRecords);
        if (d.prescriptions) setPrescriptions(d.prescriptions);
        if (d.pharmacy) setPharmacy(d.pharmacy);
        if (d.labTests) setLabTests(d.labTests);
        if (d.labOrders) setLabOrders(d.labOrders);
        if (d.inventory) setInventory(d.inventory);
        if (d.invoices) setInvoices(d.invoices);
        if (d.notifications) setNotifications(d.notifications);
        if (d.emailLogs) setEmailLogs(d.emailLogs);
        if (d.auditLogs) setAuditLogs(d.auditLogs);
        if (d.analytics) setAnalytics(d.analytics);
        return;
      }

      // Fallback to individual safe endpoints if /api/sync is unavailable
      const [
        docRes, patRes, deptRes, aptRes, recRes, rxRes,
        phRes, labTRes, labORes, invRes, billRes, notifRes,
        emailRes, auditRes, alyRes
      ] = await Promise.all([
        safeFetchJson('/api/doctors'),
        safeFetchJson('/api/patients'),
        safeFetchJson('/api/departments'),
        safeFetchJson('/api/appointments'),
        safeFetchJson('/api/medical-records'),
        safeFetchJson('/api/prescriptions'),
        safeFetchJson('/api/pharmacy'),
        safeFetchJson('/api/lab/tests'),
        safeFetchJson('/api/lab/orders'),
        safeFetchJson('/api/inventory'),
        safeFetchJson('/api/billing/invoices'),
        safeFetchJson('/api/notifications'),
        safeFetchJson('/api/email/logs'),
        safeFetchJson('/api/audit-logs'),
        safeFetchJson('/api/analytics'),
      ]);

      if (docRes?.success) setDoctors(docRes.data);
      if (patRes?.success) setPatients(patRes.data);
      if (deptRes?.success) setDepartments(deptRes.data);
      if (aptRes?.success) setAppointments(aptRes.data);
      if (recRes?.success) setMedicalRecords(recRes.data);
      if (rxRes?.success) setPrescriptions(rxRes.data);
      if (phRes?.success) setPharmacy(phRes.data);
      if (labTRes?.success) setLabTests(labTRes.data);
      if (labORes?.success) setLabOrders(labORes.data);
      if (invRes?.success) setInventory(invRes.data);
      if (billRes?.success) setInvoices(billRes.data);
      if (notifRes?.success) setNotifications(notifRes.data);
      if (emailRes?.success) setEmailLogs(emailRes.data);
      if (auditRes?.success) setAuditLogs(auditRes.data);
      if (alyRes?.success) setAnalytics(alyRes.data);
    } catch (err) {
      console.warn('Data sync notice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 30000); // Polling safely every 30s
    return () => clearInterval(interval);
  }, []);

  const bookAppointment = async (data: Partial<Appointment>): Promise<boolean> => {
    try {
      const resData = await safeFetchJson('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (resData && resData.success) {
        await refreshData();
        return true;
      }
    } catch (err) {
      console.error('Book appointment failed:', err);
    }
    return false;
  };

  const updateAppointmentStatus = async (id: string, status: any) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    await refreshData();
  };

  const addDoctor = async (data: Partial<Doctor>) => {
    await fetch('/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    await refreshData();
  };

  const addPatient = async (data: Partial<Patient>) => {
    await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    await refreshData();
  };

  const updatePatient = async (id: string, data: Partial<Patient>) => {
    await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    await refreshData();
  };

  const addMedicalRecord = async (data: Partial<MedicalRecord>) => {
    await fetch('/api/medical-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    await refreshData();
  };

  const addPrescription = async (data: Partial<Prescription>) => {
    await fetch('/api/prescriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    await refreshData();
  };

  const addPharmacyItem = async (data: Partial<PharmacyItem>) => {
    await fetch('/api/pharmacy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    await refreshData();
  };

  const updatePharmacyStock = async (id: string, newStock: number) => {
    await fetch(`/api/pharmacy/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockCount: newStock })
    });
    await refreshData();
  };

  const placeLabOrder = async (data: Partial<LabOrder>) => {
    await fetch('/api/lab/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    await refreshData();
  };

  const updateLabOrderStatus = async (id: string, status: any, resultSummary?: string, resultValues?: any) => {
    await fetch(`/api/lab/orders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, resultSummary, resultValues })
    });
    await refreshData();
  };

  const addInventoryItem = async (data: Partial<InventoryItem>) => {
    await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    await refreshData();
  };

  const updateInventoryCondition = async (id: string, condition: string) => {
    await fetch(`/api/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: condition })
    });
    await refreshData();
  };

  const updateBedOccupancy = async (deptId: string, occupiedBeds: number) => {
    await fetch(`/api/departments/${deptId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ occupiedBeds })
    });
    await refreshData();
  };

  const analyzeSymptoms = async (symptoms: string, age?: number, gender?: string, medicalHistory?: string) => {
    try {
      const data = await safeFetchJson('/api/ai/symptom-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms, patientAge: age, gender, medicalHistory })
      });
      if (!data) return null;
      return data.triage || data;
    } catch (e) {
      console.error('Symptom check error:', e);
      return null;
    }
  };

  const reorderStock = async (id: string, amount: number) => {
    const current = (pharmacy || []).find(p => p.id === id);
    const currStock = current ? (current.stockCount ?? current.stockQuantity ?? 0) : 0;
    await updatePharmacyStock(id, currStock + amount);
  };

  const orderLabTest = async (data: Partial<LabOrder>) => {
    await placeLabOrder(data);
  };

  const createInvoice = async (data: Partial<Invoice>) => {
    await fetch('/api/billing/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    await refreshData();
  };

  const payInvoice = async (invoiceId: string, method: string, paymentId?: string): Promise<boolean> => {
    try {
      const resData = await safeFetchJson('/api/billing/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, paymentMethod: method, razorpayPaymentId: paymentId })
      });
      if (resData && resData.success) {
        await refreshData();
        return true;
      }
    } catch (err) {
      console.error('Payment error:', err);
    }
    return false;
  };

  const triggerEmergencyAlert = async (title?: string | any, message?: string | any) => {
    const alertTitle = typeof title === 'string' ? title : 'ER Trauma Code Red';
    const alertMessage = typeof message === 'string' ? message : 'Level-1 Ambulance inbound with severe trauma patient. ICU Room 02 prepared.';
    await safeFetchJson('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: alertTitle,
        message: alertMessage,
        type: 'emergency',
        targetRole: 'All'
      })
    });
    await refreshData();
  };

  const markNotificationRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const openCheckoutModal = (inv: Invoice) => setActiveCheckoutInvoice(inv);
  const closeCheckoutModal = () => setActiveCheckoutInvoice(null);

  return (
    <HospitalContext.Provider value={{
      doctors: doctors || [],
      patients: patients || [],
      departments: departments || [],
      appointments: appointments || [],
      medicalRecords: medicalRecords || [],
      prescriptions: prescriptions || [],
      pharmacy: pharmacy || [],
      pharmacyItems: pharmacy || [],
      labTests: labTests || [],
      labCatalog: labTests || [],
      labOrders: labOrders || [],
      inventory: inventory || [],
      invoices: invoices || [],
      notifications: notifications || [],
      emailLogs: emailLogs || [],
      auditLogs: auditLogs || [],
      analytics,
      loading,
      searchQuery, setSearchQuery, selectedDeptFilter, setSelectedDeptFilter,
      bookAppointment, updateAppointmentStatus, addDoctor, addPatient, updatePatient,
      addMedicalRecord, addPrescription, addPharmacyItem, updatePharmacyStock, reorderStock,
      placeLabOrder, orderLabTest, updateLabOrderStatus, addInventoryItem, updateInventoryCondition,
      updateBedOccupancy, analyzeSymptoms, createInvoice,
      payInvoice, triggerEmergencyAlert, markNotificationRead, refreshData,
      activeCheckoutInvoice, openCheckoutModal, closeCheckoutModal,
      showArchitectureModal, setShowArchitectureModal,
      showEmailLogModal, setShowEmailLogModal
    }}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) throw new Error('useHospital must be used within HospitalProvider');
  return context;
};
