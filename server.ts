import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_USERS, INITIAL_DEPARTMENTS, INITIAL_DOCTORS, INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS, INITIAL_MEDICAL_RECORDS, INITIAL_PRESCRIPTIONS,
  INITIAL_PHARMACY, INITIAL_LAB_TESTS, INITIAL_LAB_ORDERS, INITIAL_INVENTORY,
  INITIAL_INVOICES, INITIAL_NOTIFICATIONS, INITIAL_EMAIL_LOGS, INITIAL_AUDIT_LOGS
} from './src/data/mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize In-Memory Data Store
let users = [...INITIAL_USERS];
let departments = [...INITIAL_DEPARTMENTS];
let doctors = [...INITIAL_DOCTORS];
let patients = [...INITIAL_PATIENTS];
let appointments = [...INITIAL_APPOINTMENTS];
let medicalRecords = [...INITIAL_MEDICAL_RECORDS];
let prescriptions = [...INITIAL_PRESCRIPTIONS];
let pharmacy = [...INITIAL_PHARMACY];
let labTests = [...INITIAL_LAB_TESTS];
let labOrders = [...INITIAL_LAB_ORDERS];
let inventory = [...INITIAL_INVENTORY];
let invoices = [...INITIAL_INVOICES];
let notifications = [...INITIAL_NOTIFICATIONS];
let emailLogs = [...INITIAL_EMAIL_LOGS];
let auditLogs = [...INITIAL_AUDIT_LOGS];

// Gemini AI Helper safely initialized
function getGeminiAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export const app = express();
app.use(express.json({ limit: '10mb' }));

async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;

  // Helper log audit
  const logAudit = (userName: string, userRole: any, action: string, details: string) => {
    const newLog = {
      id: `aud-${Date.now()}`,
      userId: 'usr-current',
      userName,
      userRole,
      action,
      details,
      ipAddress: '127.0.0.1',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    auditLogs.unshift(newLog);
  };

  // Helper send email
  const sendEmail = (to: string, subject: string, body: string, category: any) => {
    const newEmail = {
      id: `em-${Date.now()}`,
      to,
      subject,
      body,
      category,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Delivered' as const
    };
    emailLogs.unshift(newEmail);
    return newEmail;
  };

  // ------------------------------------
  // REST API ROUTES
  // ------------------------------------

  // 0. CONSOLIDATED DATA SYNC
  app.get('/api/sync', (req, res) => {
    const totalPatients = patients.length;
    const totalDoctors = doctors.length;
    const totalAppointments = appointments.length;
    const totalRevenue = invoices
      .filter(i => i.paymentStatus === 'Paid')
      .reduce((sum, i) => sum + i.totalAmount, 0);

    const pendingAppointments = appointments.filter(a => a.status === 'Pending').length;
    const occupiedBeds = departments.reduce((sum, d) => sum + d.occupiedBeds, 0);
    const totalBeds = departments.reduce((sum, d) => sum + d.totalBeds, 0);

    const revenueByMonth = [
      { month: 'Jan', revenue: 42000, patients: 120 },
      { month: 'Feb', revenue: 48000, patients: 145 },
      { month: 'Mar', revenue: 53000, patients: 160 },
      { month: 'Apr', revenue: 49000, patients: 150 },
      { month: 'May', revenue: 61000, patients: 180 },
      { month: 'Jun', revenue: 68000, patients: 210 },
      { month: 'Jul', revenue: 74000, patients: 235 },
      { month: 'Aug', revenue: Math.round(totalRevenue + 55000), patients: totalPatients * 15 }
    ];

    const departmentDistribution = departments.map(d => ({
      name: d.name,
      beds: d.occupiedBeds,
      capacity: d.totalBeds
    }));

    const analyticsData = {
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalRevenue,
      pendingAppointments,
      occupiedBeds,
      totalBeds,
      bedOccupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      revenueByMonth,
      departmentDistribution
    };

    res.json({
      success: true,
      data: {
        doctors,
        patients,
        departments,
        appointments,
        medicalRecords,
        prescriptions,
        pharmacy,
        labTests,
        labOrders,
        inventory,
        invoices,
        notifications,
        emailLogs,
        auditLogs,
        analytics: analyticsData
      }
    });
  });

  // 1. AUTHENTICATION & USERS
  app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body;
    let user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
    
    if (!user) {
      // Create user if logging in via role shortcut
      user = {
        id: `usr-${Date.now()}`,
        name: email ? email.split('@')[0] : 'Demo User',
        email: email || `${role.toLowerCase().replace(' ', '')}@hospital.com`,
        role: role || 'Patient',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        phone: '+1 (555) 000-1122',
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      users.push(user);
    }

    logAudit(user.name, user.role, 'User Login', `Successfully authenticated via JWT as ${user.role}`);

    const token = `jwt_mock_token_${Date.now()}_${user.id}`;
    res.json({ success: true, token, user });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, role, phone, specialization, departmentId } = req.body;
    
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: role || 'Patient',
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      phone: phone || '+1 (555) 000-0000',
      specialization,
      departmentId,
      isVerified: false,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);

    // If registered as patient, seed patient directory record
    if (newUser.role === 'Patient') {
      patients.push({
        id: `pat-${Date.now()}`,
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        age: 30,
        gender: 'Male',
        bloodGroup: 'O+',
        address: '123 Main Street',
        emergencyContact: 'Family Member - +1 (555) 000-9999',
        allergies: [],
        chronicDiseases: [],
        admittedStatus: 'Outpatient',
        avatar: newUser.avatar,
        registeredAt: new Date().toISOString().substring(0, 10)
      });
    } else if (newUser.role === 'Doctor') {
      doctors.push({
        id: `doc-${Date.now()}`,
        userId: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        specialization: specialization || 'General Medicine',
        departmentId: departmentId || 'dept-cardio',
        qualification: 'MD, Medical Specialist',
        experienceYears: 5,
        consultationFee: 120,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: ['09:00 AM', '11:00 AM', '02:00 PM'],
        roomNumber: 'B-101',
        rating: 5.0,
        status: 'Active',
        avatar: newUser.avatar
      });
    }

    // Send email verification simulation
    const verifyCode = Math.floor(100000 + Math.random() * 900000);
    sendEmail(
      email,
      'Verify Your Account - Smart Hospital System',
      `Welcome ${name}! Your email verification code is: ${verifyCode}. Click here to verify your account: https://hospital.com/verify?code=${verifyCode}`,
      'Verification'
    );

    logAudit(newUser.name, newUser.role, 'User Registered', `New ${newUser.role} user created: ${email}`);

    res.json({ success: true, message: 'Registration successful! Verification email sent.', user: newUser, verifyCode });
  });

  app.post('/api/auth/verify-email', (req, res) => {
    const { userId } = req.body;
    const u = users.find(x => x.id === userId);
    if (u) {
      u.isVerified = true;
      logAudit(u.name, u.role, 'Email Verified', `Account email marked as verified`);
      return res.json({ success: true, user: u });
    }
    res.status(404).json({ success: false, message: 'User not found' });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    const u = users.find(x => x.email.toLowerCase() === (email || '').toLowerCase());
    const resetCode = Math.floor(100000 + Math.random() * 900000);
    sendEmail(
      email,
      'Password Reset Request - Smart Hospital System',
      `You requested a password reset. Your OTP reset code is ${resetCode}. Use this code to construct a new secure password.`,
      'Password Reset'
    );
    res.json({ success: true, message: 'Password reset link and OTP code sent to your email.' });
  });

  // 2. DOCTORS API
  app.get('/api/doctors', (req, res) => {
    res.json({ success: true, data: doctors });
  });

  app.post('/api/doctors', (req, res) => {
    const newDoc = {
      id: `doc-${Date.now()}`,
      ...req.body,
      rating: 5.0,
      status: req.body.status || 'Active'
    };
    doctors.push(newDoc);
    logAudit('Admin', 'Hospital Admin', 'Doctor Added', `Added doctor ${newDoc.name} (${newDoc.specialization})`);
    res.json({ success: true, data: newDoc });
  });

  app.put('/api/doctors/:id', (req, res) => {
    const idx = doctors.findIndex(d => d.id === req.params.id);
    if (idx !== -1) {
      doctors[idx] = { ...doctors[idx], ...req.body };
      return res.json({ success: true, data: doctors[idx] });
    }
    res.status(404).json({ success: false, message: 'Doctor not found' });
  });

  app.delete('/api/doctors/:id', (req, res) => {
    doctors = doctors.filter(d => d.id !== req.params.id);
    res.json({ success: true, message: 'Doctor removed successfully' });
  });

  // 3. PATIENTS API
  app.get('/api/patients', (req, res) => {
    res.json({ success: true, data: patients });
  });

  app.post('/api/patients', (req, res) => {
    const newPat = {
      id: `pat-${Date.now()}`,
      registeredAt: new Date().toISOString().substring(0, 10),
      avatar: req.body.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      ...req.body
    };
    patients.push(newPat);
    logAudit('Staff', 'Receptionist', 'Patient Registered', `Admitted/Registered patient ${newPat.name}`);
    res.json({ success: true, data: newPat });
  });

  app.put('/api/patients/:id', (req, res) => {
    const idx = patients.findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      patients[idx] = { ...patients[idx], ...req.body };
      return res.json({ success: true, data: patients[idx] });
    }
    res.status(404).json({ success: false, message: 'Patient not found' });
  });

  // 4. DEPARTMENTS API
  app.get('/api/departments', (req, res) => {
    res.json({ success: true, data: departments });
  });

  app.post('/api/departments', (req, res) => {
    const newDept = {
      id: `dept-${Date.now()}`,
      ...req.body
    };
    departments.push(newDept);
    res.json({ success: true, data: newDept });
  });

  app.put('/api/departments/:id', (req, res) => {
    const idx = departments.findIndex(d => d.id === req.params.id);
    if (idx !== -1) {
      departments[idx] = { ...departments[idx], ...req.body };
      return res.json({ success: true, data: departments[idx] });
    }
    res.status(404).json({ success: false, message: 'Department not found' });
  });

  // 5. APPOINTMENTS API
  app.get('/api/appointments', (req, res) => {
    res.json({ success: true, data: appointments });
  });

  app.post('/api/appointments', (req, res) => {
    const { patientId, patientName, doctorId, doctorName, departmentId, departmentName, date, timeSlot, symptoms, priority } = req.body;
    
    const doc = doctors.find(d => d.id === doctorId);
    const fee = doc ? doc.consultationFee : 150;

    const newApt = {
      id: `apt-${Date.now()}`,
      patientId: patientId || 'pat-1',
      patientName: patientName || 'Sophia Martinez',
      doctorId: doctorId || 'doc-1',
      doctorName: doctorName || 'Dr. Robert Chen',
      departmentId: departmentId || 'dept-cardio',
      departmentName: departmentName || 'Cardiology',
      date: date || new Date().toISOString().substring(0, 10),
      timeSlot: timeSlot || '10:00 AM',
      status: 'Confirmed' as const,
      priority: priority || 'Routine',
      symptoms: symptoms || 'General Checkup',
      consultationFee: fee,
      isPaid: false,
      createdAt: new Date().toISOString()
    };

    appointments.unshift(newApt);

    // Auto-generate unpaid invoice for appointment consultation
    const newInv = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      patientId: newApt.patientId,
      patientName: newApt.patientName,
      patientPhone: '+1 (555) 016-5543',
      date: newApt.date,
      dueDate: newApt.date,
      items: [
        {
          description: `Consultation - ${newApt.doctorName} (${newApt.departmentName})`,
          category: 'Consultation' as const,
          quantity: 1,
          unitPrice: fee,
          amount: fee
        }
      ],
      subtotal: fee,
      taxAmount: Math.round(fee * 0.05 * 100) / 100,
      discountAmount: 0,
      totalAmount: Math.round(fee * 1.05 * 100) / 100,
      amountPaid: 0,
      paymentStatus: 'Unpaid' as const
    };
    invoices.unshift(newInv);

    // Notification
    notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'New Appointment Booked',
      message: `Appointment scheduled for ${newApt.patientName} with ${newApt.doctorName} on ${newApt.date} at ${newApt.timeSlot}`,
      type: 'info',
      targetRole: 'All',
      timestamp: 'Just now',
      isRead: false
    });

    // Send confirmation email
    sendEmail(
      'patient@hospital.com',
      `Appointment Confirmed with ${newApt.doctorName}`,
      `Dear ${newApt.patientName}, your appointment has been booked for ${newApt.date} at ${newApt.timeSlot}. Consultation Fee: $${fee}.`,
      'Appointment'
    );

    logAudit(newApt.patientName, 'Patient', 'Appointment Booked', `Booked slot with ${newApt.doctorName}`);

    res.json({ success: true, data: newApt, invoice: newInv });
  });

  app.put('/api/appointments/:id', (req, res) => {
    const idx = appointments.findIndex(a => a.id === req.params.id);
    if (idx !== -1) {
      appointments[idx] = { ...appointments[idx], ...req.body };
      return res.json({ success: true, data: appointments[idx] });
    }
    res.status(404).json({ success: false, message: 'Appointment not found' });
  });

  // 6. MEDICAL RECORDS & EHR
  app.get('/api/medical-records', (req, res) => {
    res.json({ success: true, data: medicalRecords });
  });

  app.post('/api/medical-records', (req, res) => {
    const newRec = {
      id: `rec-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...req.body
    };
    medicalRecords.unshift(newRec);
    logAudit(newRec.doctorName, 'Doctor', 'EHR Record Created', `Created clinical record for ${newRec.patientName}`);
    res.json({ success: true, data: newRec });
  });

  // 7. PRESCRIPTIONS
  app.get('/api/prescriptions', (req, res) => {
    res.json({ success: true, data: prescriptions });
  });

  app.post('/api/prescriptions', (req, res) => {
    const newRx = {
      id: `rx-${Date.now()}`,
      date: new Date().toISOString().substring(0, 10),
      status: 'Prescribed' as const,
      ...req.body
    };
    prescriptions.unshift(newRx);

    // Also send email copy to patient
    sendEmail(
      'patient@hospital.com',
      `Digital Prescription Received - ${newRx.doctorName}`,
      `Dear ${newRx.patientName}, Dr. ${newRx.doctorName} prescribed ${newRx.medicines.length} medicine(s) for diagnosis: ${newRx.diagnosis}. Check your patient portal.`,
      'Appointment'
    );

    logAudit(newRx.doctorName, 'Doctor', 'Prescription Issued', `Issued digital rx for ${newRx.patientName}`);

    res.json({ success: true, data: newRx });
  });

  // 8. PHARMACY
  app.get('/api/pharmacy', (req, res) => {
    res.json({ success: true, data: pharmacy });
  });

  app.post('/api/pharmacy', (req, res) => {
    const item = {
      id: `ph-${Date.now()}`,
      ...req.body
    };
    pharmacy.push(item);
    res.json({ success: true, data: item });
  });

  app.put('/api/pharmacy/:id', (req, res) => {
    const idx = pharmacy.findIndex(p => p.id === req.params.id);
    if (idx !== -1) {
      pharmacy[idx] = { ...pharmacy[idx], ...req.body };
      return res.json({ success: true, data: pharmacy[idx] });
    }
    res.status(404).json({ success: false, message: 'Pharmacy item not found' });
  });

  // 9. LABORATORY
  app.get('/api/lab/tests', (req, res) => {
    res.json({ success: true, data: labTests });
  });

  app.get('/api/lab/orders', (req, res) => {
    res.json({ success: true, data: labOrders });
  });

  app.post('/api/lab/orders', (req, res) => {
    const newOrder = {
      id: `lorder-${Date.now()}`,
      orderDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'Ordered' as const,
      ...req.body
    };
    labOrders.unshift(newOrder);
    res.json({ success: true, data: newOrder });
  });

  app.put('/api/lab/orders/:id', (req, res) => {
    const idx = labOrders.findIndex(l => l.id === req.params.id);
    if (idx !== -1) {
      labOrders[idx] = { ...labOrders[idx], ...req.body };
      return res.json({ success: true, data: labOrders[idx] });
    }
    res.status(404).json({ success: false, message: 'Lab order not found' });
  });

  // 10. INVENTORY
  app.get('/api/inventory', (req, res) => {
    res.json({ success: true, data: inventory });
  });

  app.post('/api/inventory', (req, res) => {
    const item = { id: `inv-${Date.now()}`, ...req.body };
    inventory.push(item);
    res.json({ success: true, data: item });
  });

  app.put('/api/inventory/:id', (req, res) => {
    const idx = inventory.findIndex(i => i.id === req.params.id);
    if (idx !== -1) {
      inventory[idx] = { ...inventory[idx], ...req.body };
      return res.json({ success: true, data: inventory[idx] });
    }
    res.status(404).json({ success: false, message: 'Inventory item not found' });
  });

  // 11. BILLING & RAZORPAY PAYMENT
  app.get('/api/billing/invoices', (req, res) => {
    res.json({ success: true, data: invoices });
  });

  app.post('/api/billing/invoices', (req, res) => {
    const newInv = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().substring(0, 10),
      dueDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().substring(0, 10),
      amountPaid: 0,
      paymentStatus: 'Unpaid' as const,
      ...req.body
    };
    invoices.unshift(newInv);
    res.json({ success: true, data: newInv });
  });

  app.post('/api/billing/create-razorpay-order', (req, res) => {
    const { invoiceId, amount } = req.body;
    const orderId = `order_rzp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    res.json({
      success: true,
      orderId,
      currency: 'USD',
      amount: amount * 100, // amount in cents
      keyId: 'rzp_test_51HMospitalKey'
    });
  });

  app.post('/api/billing/verify-payment', (req, res) => {
    const { invoiceId, paymentMethod, razorpayPaymentId } = req.body;
    const inv = invoices.find(i => i.id === invoiceId);
    
    if (inv) {
      inv.paymentStatus = 'Paid';
      inv.amountPaid = inv.totalAmount;
      inv.paymentMethod = paymentMethod || 'Razorpay';
      inv.transactionId = razorpayPaymentId || `pay_${Date.now()}`;

      // Update related appointment payment status if applicable
      appointments.forEach(apt => {
        if (apt.patientId === inv.patientId) {
          apt.isPaid = true;
        }
      });

      sendEmail(
        'patient@hospital.com',
        `Payment Confirmation & Invoice Receipt - ${inv.invoiceNumber}`,
        `Thank you ${inv.patientName}! Your invoice ${inv.invoiceNumber} of $${inv.totalAmount} has been paid via ${inv.paymentMethod}. Transaction ID: ${inv.transactionId}.`,
        'Billing'
      );

      logAudit(inv.patientName, 'Patient', 'Invoice Paid', `Settled Invoice ${inv.invoiceNumber} ($${inv.totalAmount}) via ${inv.paymentMethod}`);

      return res.json({ success: true, invoice: inv, message: 'Payment verified successfully and receipt issued!' });
    }

    res.status(404).json({ success: false, message: 'Invoice not found' });
  });

  // 12. NOTIFICATIONS & EMERGENCY ALERTS
  app.get('/api/notifications', (req, res) => {
    res.json({ success: true, data: notifications });
  });

  app.post('/api/notifications', (req, res) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      isRead: false,
      ...req.body
    };
    notifications.unshift(newNotif);
    res.json({ success: true, data: newNotif });
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    const n = notifications.find(x => x.id === req.params.id);
    if (n) {
      n.isRead = true;
      return res.json({ success: true });
    }
    res.status(404).json({ success: false, message: 'Notification not found' });
  });

  // 13. EMAIL LOGS & AUDIT LOGS
  app.get('/api/email/logs', (req, res) => {
    res.json({ success: true, data: emailLogs });
  });

  app.post('/api/email/send', (req, res) => {
    const { to, subject, body, category } = req.body;
    const sent = sendEmail(to, subject, body, category || 'Appointment');
    res.json({ success: true, data: sent });
  });

  app.get('/api/audit-logs', (req, res) => {
    res.json({ success: true, data: auditLogs });
  });

  // 14. ANALYTICS API
  app.get('/api/analytics', (req, res) => {
    const totalPatients = patients.length;
    const totalDoctors = doctors.length;
    const totalAppointments = appointments.length;
    const totalRevenue = invoices
      .filter(i => i.paymentStatus === 'Paid')
      .reduce((sum, i) => sum + i.totalAmount, 0);

    const pendingAppointments = appointments.filter(a => a.status === 'Pending').length;
    const occupiedBeds = departments.reduce((sum, d) => sum + d.occupiedBeds, 0);
    const totalBeds = departments.reduce((sum, d) => sum + d.totalBeds, 0);

    const revenueByMonth = [
      { month: 'Jan', revenue: 42000, patients: 120 },
      { month: 'Feb', revenue: 48000, patients: 145 },
      { month: 'Mar', revenue: 53000, patients: 160 },
      { month: 'Apr', revenue: 49000, patients: 150 },
      { month: 'May', revenue: 61000, patients: 180 },
      { month: 'Jun', revenue: 68000, patients: 210 },
      { month: 'Jul', revenue: 74000, patients: 235 },
      { month: 'Aug', revenue: Math.round(totalRevenue + 55000), patients: totalPatients * 15 }
    ];

    const departmentDistribution = departments.map(d => ({
      name: d.name,
      beds: d.occupiedBeds,
      capacity: d.totalBeds
    }));

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalRevenue,
        pendingAppointments,
        occupiedBeds,
        totalBeds,
        bedOccupancyRate: Math.round((occupiedBeds / totalBeds) * 100),
        revenueByMonth,
        departmentDistribution
      }
    });
  });

  // 15. AI SYMPTOM CHECKER & TRIAGE ASSISTANT (Server-side Gemini Integration)
  app.post('/api/ai/symptom-check', async (req, res) => {
    const { symptoms, age, patientAge, gender, medicalHistory } = req.body;
    const effectiveAge = age || patientAge || 30;

    const ai = getGeminiAI();
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: `You are an expert Clinical Triage AI assistant in a Smart Hospital Management System.
Analyze the following patient parameters:
- Patient Age: ${effectiveAge}
- Gender: ${gender || 'Unspecified'}
- Reported Symptoms: "${symptoms}"
- Past Medical History: "${medicalHistory || 'None reported'}"

Provide a structured, professional clinical triage assessment in JSON format with keys:
1. "urgencyLevel": "Routine" | "Urgent" | "Emergency - Red Flag"
2. "recommendedDepartment": string (e.g. "Cardiology", "Neurology", "Emergency & Level-1 Trauma", "Orthopedics", "Pediatrics")
3. "possibleCondition": string
4. "vitalSignWatch": string
5. "initialAdvice": string
6. "suggestedLabTests": string[]

Return ONLY valid JSON without markdown wrapping.`
        });

        const text = response.text || '';
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanJson);
        return res.json({ success: true, triage: parsed, source: 'Gemini 3.6 Flash API' });
      } catch (err: any) {
        console.error('Gemini API Error:', err);
      }
    }

    // Fallback intelligent clinical heuristic response
    let urgency: 'Routine' | 'Urgent' | 'Emergency - Red Flag' = 'Routine';
    let dept = 'General Medicine';
    const lowerSymptom = (symptoms || '').toLowerCase();

    if (lowerSymptom.includes('chest pain') || lowerSymptom.includes('shortness of breath') || lowerSymptom.includes('paralysis') || lowerSymptom.includes('stroke')) {
      urgency = 'Emergency - Red Flag';
      dept = lowerSymptom.includes('stroke') ? 'Neurology & Neurosurgery' : 'Emergency & Level-1 Trauma';
    } else if (lowerSymptom.includes('headache') || lowerSymptom.includes('dizziness') || lowerSymptom.includes('migraine')) {
      urgency = 'Urgent';
      dept = 'Neurology & Neurosurgery';
    } else if (lowerSymptom.includes('joint') || lowerSymptom.includes('fracture') || lowerSymptom.includes('bone')) {
      urgency = 'Urgent';
      dept = 'Orthopedics & Joint Replacement';
    } else if (lowerSymptom.includes('heart') || lowerSymptom.includes('palpitations')) {
      urgency = 'Urgent';
      dept = 'Cardiology';
    }

    res.json({
      success: true,
      triage: {
        urgencyLevel: urgency,
        recommendedDepartment: dept,
        possibleCondition: urgency === 'Emergency - Red Flag' ? 'Acute Coronary Syndrome / Cerebrovascular Event Risk' : 'Symptomatic Assessment Required',
        vitalSignWatch: 'Monitor Blood Pressure, Pulse Rate, and Continuous SpO2',
        initialAdvice: urgency === 'Emergency - Red Flag' ? 'Report immediately to Level-1 Trauma Bay for STAT ECG and Troponin I.' : 'Schedule appointment with department specialist and rest.',
        suggestedLabTests: ['12-Lead ECG', 'Complete Blood Count (CBC)', 'Serum Electrolytes']
      },
      source: 'Clinical Rule Engine'
    });
  });

  // ------------------------------------
  // VITE & STATIC FILES SERVING
  // ------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏥 Enterprise Smart Hospital System backend running on http://localhost:${PORT}`);
  });
}

startServer();

export default app;
