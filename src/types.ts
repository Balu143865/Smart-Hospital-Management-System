export type UserRole = 'Super Admin' | 'Hospital Admin' | 'Doctor' | 'Receptionist' | 'Patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  isVerified: boolean;
  hospitalId?: string;
  specialization?: string;
  departmentId?: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  departmentId: string;
  qualification: string;
  experienceYears: number;
  consultationFee: number;
  availableDays: string[];
  timeSlots: string[];
  roomNumber: string;
  rating: number;
  status: 'Active' | 'On Leave' | 'Busy';
  avatar: string;
}

export interface Patient {
  id: string;
  userId?: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  allergies: string[];
  chronicDiseases: string[];
  admittedStatus: 'Outpatient' | 'Inpatient (Ward)' | 'ICU' | 'Discharged';
  assignedBed?: string;
  doctorInChargeId?: string;
  avatar: string;
  registeredAt: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  headDoctorId: string;
  headDoctorName: string;
  iconName: string;
  description: string;
  totalBeds: number;
  occupiedBeds: number;
  icuBeds: number;
  occupiedIcuBeds: number;
  location: string;
}

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
export type AppointmentPriority = 'Routine' | 'Urgent' | 'Emergency';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  departmentId: string;
  departmentName: string;
  date: string;
  timeSlot: string;
  status: AppointmentStatus;
  priority: AppointmentPriority;
  symptoms: string;
  notes?: string;
  consultationFee: number;
  isPaid: boolean;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  visitDate: string;
  diagnosis: string;
  vitals: {
    bloodPressure: string;
    heartRate: number;
    temperature: number; // in Celsius or Fahrenheit
    oxygenLevel: number; // SpO2 %
    weightKg: number;
  };
  clinicalNotes: string;
  allergiesNoted: string[];
  attachments?: string[];
  createdAt: string;
}

export interface MedicineItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // e.g. "1-0-1 after food"
  durationDays: number;
  instructions: string;
}

export interface Prescription {
  id: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  diagnosis: string;
  medicines: MedicineItem[];
  generalInstructions: string;
  status: 'Prescribed' | 'Dispensed' | 'Partial';
}

export interface PharmacyItem {
  id: string;
  name: string;
  category: string; // Antibiotic, Analgesic, Cardia, Pediatric, etc.
  sku: string;
  stockCount: number;
  reorderLevel: number;
  unitPrice: number;
  expiryDate: string;
  manufacturer: string;
  locationRack: string;
}

export interface LabTestCatalog {
  id: string;
  testName: string;
  category: string;
  price: number;
  sampleRequired: string; // Blood, Urine, X-Ray, MRI, etc.
  normalRange: string;
  turnaroundHours: number;
}

export interface RadiologyScan {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  scanType: string;
  modality: 'X-Ray' | 'MRI' | 'CT Scan' | 'Ultrasound' | 'Mammogram';
  bodyPart: string;
  scanDate: string;
  imageUrl: string;
  findings: string;
  impression: string;
  radiologistName: string;
  status: 'Reviewed' | 'Pending Analysis' | 'Critical Finding';
  urgency: 'Routine' | 'Urgent' | 'Emergency';
}

export interface LabOrder {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  testId: string;
  testName: string;
  orderDate: string;
  status: 'Ordered' | 'Sample Collected' | 'Testing' | 'Completed' | 'Cancelled';
  resultSummary?: string;
  resultValues?: { parameter: string; value: string; normalRange: string; flag?: 'Normal' | 'High' | 'Low' | 'Critical' }[];
  reportFileUrl?: string;
  technicianNotes?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Surgical Equipment' | 'Diagnostic Gear' | 'ICU Machinery' | 'General Supplies' | 'PPE & Hygiene';
  quantity: number;
  unit: string;
  minThreshold: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  status: 'Optimal' | 'Requires Maintenance' | 'Low Stock' | 'Critical';
  departmentId: string;
}

export interface InvoiceItem {
  description: string;
  category: 'Consultation' | 'Pharmacy' | 'Laboratory' | 'Bed Charge' | 'Surgery' | 'Miscellaneous';
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  paymentMethod?: 'Razorpay' | 'Stripe' | 'Credit Card' | 'Cash' | 'Insurance';
  transactionId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'emergency';
  targetRole?: UserRole | 'All';
  targetUserId?: string;
  timestamp: string;
  isRead: boolean;
  linkAction?: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  body: string;
  category: 'Verification' | 'Password Reset' | 'Appointment' | 'Billing' | 'Lab Result';
  sentAt: string;
  status: 'Delivered' | 'Pending';
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}
