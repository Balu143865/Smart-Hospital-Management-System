import React, { useState } from 'react';
import { X, Layers, Database, Shield, Server, FileCode, CheckCircle2, ChevronRight, Terminal } from 'lucide-react';

export const ArchitectureModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'er' | 'apis' | 'rbac' | 'curriculum'>('architecture');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Smart Hospital System — Software Architecture & ER Specs
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enterprise MERN Stack Blueprint & Internship Curriculum Reference
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'architecture', label: '1. Architecture & Stack' },
            { id: 'er', label: '2. ER Diagram & Database Schema' },
            { id: 'apis', label: '3. REST API Catalog' },
            { id: 'rbac', label: '4. Role Access Matrix (RBAC)' },
            { id: 'curriculum', label: '5. 12-Week Internship Roadmap' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 px-3 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === t.id
                  ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
          
          {activeTab === 'architecture' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800">
                <h4 className="font-bold text-sm text-cyan-900 dark:text-cyan-200 mb-1">System Overview</h4>
                <p>
                  The Smart Hospital Management System utilizes a full-stack MERN-like architecture with Node.js and Express serving RESTful micro-endpoints, coupled with a React SPA frontend and Gemini AI triage engine.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-cyan-500" />
                    Frontend Tier (React + Vite + Tailwind)
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                    <li>Single Page Application (SPA) with Vite compiler</li>
                    <li>Tailwind CSS styling & GSAP landing page animations</li>
                    <li>Recharts data visualizers for hospital telemetry</li>
                    <li>PDF export engine using HTML2Canvas and JS-PDF</li>
                    <li>Context API global state management</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                  <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-emerald-500" />
                    Backend Tier (Node.js + Express REST API)
                  </h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                    <li>Express HTTP API router bound to port 3000</li>
                    <li>JWT Bearer Auth & Bcrypt password hashing</li>
                    <li>Razorpay / Stripe payment gateway simulator</li>
                    <li>Nodemailer SMTP email logger service</li>
                    <li>Gemini 2.5 Flash API server-side proxy</li>
                  </ul>
                </div>
              </div>

              <div>
                <h5 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Production Directory Structure</h5>
                <pre className="p-4 rounded-xl bg-slate-900 text-cyan-300 font-mono text-[11px] overflow-x-auto">
{`/server.ts                   # Express REST API, Socket.io, Gemini AI & Nodemailer
/src
  ├── /components           # Modular UI Components (Navbar, Sidebar, Managers)
  ├── /context              # AuthContext, ThemeContext, HospitalContext
  ├── /data                 # Seed data and mock domain objects
  ├── /types.ts             # TypeScript Domain Model Interfaces
  ├── App.tsx               # Main Application Layout & Tab Router
  └── main.tsx              # React DOM Root Entry`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'er' && (
            <div className="space-y-6">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Entity Relationship (ER) Data Model Schema</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <h5 className="font-bold text-cyan-600 dark:text-cyan-400 mb-1">Users & Roles Collection</h5>
                  <p className="text-[11px] font-mono text-slate-500 mb-2">_id, name, email, passwordHash, role, phone, isVerified, createdAt</p>
                  <p className="text-slate-600 dark:text-slate-300">Central authentication table linking Doctors and Patients via 1:1 foreign keys.</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <h5 className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">Doctors & Patients Collection</h5>
                  <p className="text-[11px] font-mono text-slate-500 mb-2">_id, userId, specialization, departmentId, fee, rating, bloodGroup, admittedStatus</p>
                  <p className="text-slate-600 dark:text-slate-300">Stores clinical profiles, medical history arrays, and active bed allocations.</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <h5 className="font-bold text-indigo-600 dark:text-indigo-400 mb-1">Appointments & EHR Records</h5>
                  <p className="text-[11px] font-mono text-slate-500 mb-2">_id, patientId, doctorId, date, slot, status, priority, vitals, diagnosis, notes</p>
                  <p className="text-slate-600 dark:text-slate-300">Tracks booking slots, consultation status, BP, SpO2, and clinical notes.</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                  <h5 className="font-bold text-amber-600 dark:text-amber-400 mb-1">Billing & Invoices Collection</h5>
                  <p className="text-[11px] font-mono text-slate-500 mb-2">_id, invoiceNumber, patientId, totalAmount, paymentStatus, paymentMethod, transactionId</p>
                  <p className="text-slate-600 dark:text-slate-300">Stores line item breakdowns for consultations, lab orders, pharmacy, and bed stay.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'apis' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">REST API Endpoints Specification</h4>
              
              <div className="space-y-2 font-mono text-[11px]">
                {[
                  { method: 'POST', endpoint: '/api/auth/login', desc: 'Authenticate user & issue JWT bearer token' },
                  { method: 'POST', endpoint: '/api/auth/register', desc: 'Register new user & log email verification link' },
                  { method: 'GET', endpoint: '/api/doctors', desc: 'Retrieve doctor directory with department filter' },
                  { method: 'POST', endpoint: '/api/appointments', desc: 'Book appointment slot & generate unpaid invoice' },
                  { method: 'POST', endpoint: '/api/billing/verify-payment', desc: 'Verify Razorpay signature & issue PDF receipt' },
                  { method: 'POST', endpoint: '/api/ai/symptom-check', desc: 'Proxies symptom triage request to Gemini 2.5 Flash API' },
                  { method: 'GET', endpoint: '/api/analytics', desc: 'Aggregates revenue, bed occupancy, and hospital KPIs' }
                ].map((api, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${api.method === 'POST' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'}`}>
                        {api.method}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">{api.endpoint}</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 font-sans text-xs">{api.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rbac' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Role-Based Access Control (RBAC) Matrix</h4>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                      <th className="py-2 px-3">Module Feature</th>
                      <th className="py-2 px-3">Super Admin</th>
                      <th className="py-2 px-3">Hospital Admin</th>
                      <th className="py-2 px-3">Doctor</th>
                      <th className="py-2 px-3">Receptionist</th>
                      <th className="py-2 px-3">Patient</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {[
                      { feature: 'System Configuration & Audit Logs', sa: true, ha: true, doc: false, rec: false, pat: false },
                      { feature: 'Manage Doctors & Departments', sa: true, ha: true, doc: false, rec: false, pat: false },
                      { feature: 'Admit/Discharge Patients', sa: true, ha: true, doc: true, rec: true, pat: false },
                      { feature: 'Create Prescriptions & EHR Records', sa: true, ha: false, doc: true, rec: false, pat: false },
                      { feature: 'Book Appointments & Check-in', sa: true, ha: true, doc: true, rec: true, pat: true },
                      { feature: 'Pay Invoices via Razorpay', sa: true, ha: true, doc: false, rec: true, pat: true },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">{row.feature}</td>
                        <td className="py-2.5 px-3">{row.sa ? '✅ Full' : '❌'}</td>
                        <td className="py-2.5 px-3">{row.ha ? '✅ Full' : '❌'}</td>
                        <td className="py-2.5 px-3">{row.doc ? '✅ Clinical' : '❌'}</td>
                        <td className="py-2.5 px-3">{row.rec ? '✅ Desk' : '❌'}</td>
                        <td className="py-2.5 px-3">{row.pat ? '✅ Portal' : '❌'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'curriculum' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">12-Week MERN Stack Internship Curriculum Roadmap</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { week: 'Weeks 1-2', title: 'React SPA Fundamentals', desc: 'Vite setup, Tailwind styling, Component hierarchy, State management' },
                  { week: 'Weeks 3-4', title: 'Express REST API Development', desc: 'Node.js routing, Middleware, JWT Auth, Input validation, Error handling' },
                  { week: 'Weeks 5-6', title: 'Database & Data Modeling', desc: 'MongoDB schemas, Mongoose models, Indexing, Data normalization' },
                  { week: 'Weeks 7-8', title: 'Role-Based Dashboards', desc: 'RBAC implementation, Recharts analytics, Department & Bed telemetry' },
                  { week: 'Weeks 9-10', title: 'Payment & Third-Party Services', desc: 'Razorpay checkout simulator, Nodemailer SMTP logs, PDF export' },
                  { week: 'Weeks 11-12', title: 'AI Integration & Deployment', desc: 'Gemini AI triage engine, Docker containerization, Cloud Run hosting' }
                ].map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                      {item.week}
                    </span>
                    <h5 className="font-bold text-slate-900 dark:text-white mt-1.5">{item.title}</h5>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
