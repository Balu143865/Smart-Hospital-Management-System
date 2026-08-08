import React, { useState, useEffect } from 'react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { 
  FlaskConical, Search, Plus, CheckCircle2, Clock, FileCheck, FileText, 
  AlertCircle, X, Film, Upload, Maximize2, Eye, Sliders, Sun, ZoomIn, 
  ZoomOut, RotateCcw, Download, Sparkles, Activity, Layers, User, Calendar, Stethoscope, FileSpreadsheet
} from 'lucide-react';
import { LabOrder, LabTestCatalog, RadiologyScan } from '../types';
import jsPDF from 'jspdf';

const exportRadiologyPDF = (scan: RadiologyScan) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header background banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('SMART HEALTHCARE MEDICAL CENTER', 14, 14);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('RADIOLOGY & DIAGNOSTIC IMAGING DIVISION • OFFICIAL REPORT', 14, 22);

  // Accent line
  doc.setFillColor(6, 182, 212); // cyan-500
  doc.rect(0, 32, 210, 2, 'F');

  // Metadata Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, 40, 182, 44, 3, 3, 'FD');

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('PATIENT & STUDY METADATA', 20, 48);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  // Left column
  doc.text(`Patient Name: ${scan.patientName}`, 20, 56);
  doc.text(`Patient ID: ${scan.patientId}`, 20, 63);
  doc.text(`Modality: ${scan.modality}`, 20, 70);
  doc.text(`Exam Title: ${scan.scanType}`, 20, 77);

  // Right column
  doc.text(`Scan Date: ${scan.scanDate}`, 110, 56);
  doc.text(`Ordering Physician: ${scan.doctorName}`, 110, 63);
  doc.text(`Reporting Radiologist: ${scan.radiologistName}`, 110, 70);
  doc.text(`Urgency Level: ${scan.urgency}`, 110, 77);

  // Section 1: Anatomical Area Box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 90, 182, 12, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`ANATOMICAL REGION EXAMINED: ${scan.bodyPart.toUpperCase()}`, 20, 97);

  // Section 2: Radiological Findings
  let currentY = 110;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(14, 116, 144); // cyan-700
  doc.text('RADIOLOGICAL FINDINGS', 14, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85);

  const splitFindings = doc.splitTextToSize(scan.findings, 182);
  doc.text(splitFindings, 14, currentY);
  currentY += splitFindings.length * 5 + 10;

  // Section 3: Diagnostic Impression Box
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(180, 83, 9); // amber-700
  doc.text('DIAGNOSTIC IMPRESSION', 14, currentY);

  currentY += 4;
  doc.setFillColor(254, 243, 199); // amber-100
  doc.setDrawColor(252, 211, 77); // amber-300
  
  const splitImpression = doc.splitTextToSize(scan.impression, 174);
  const boxHeight = Math.max(16, splitImpression.length * 5 + 8);
  
  doc.roundedRect(14, currentY, 182, boxHeight, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(120, 53, 15);
  doc.text(splitImpression, 18, currentY + 7);

  currentY += boxHeight + 14;

  // Electronic Signature Line
  doc.setDrawColor(203, 213, 225);
  doc.line(14, currentY, 196, currentY);

  currentY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('ELECTRONIC SIGNATURE & VERIFICATION', 14, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Digitally signed & approved by: ${scan.radiologistName}`, 14, currentY);
  doc.text(`Verification ID: RAD-VERIF-${Date.now().toString().slice(-8)}`, 14, currentY + 5);
  doc.text(`Report Status: ${scan.status} • Generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, currentY + 10);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Confidential Medical Diagnostic Record • Smart Hospital Management System', 105, 285, { align: 'center' });

  // Save the PDF
  const cleanPatientName = scan.patientName.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Radiology_Report_${cleanPatientName}_${scan.modality}.pdf`);
};

const INITIAL_RADIOLOGY_SCANS: RadiologyScan[] = [
  {
    id: 'rad-1',
    patientId: 'pat-1',
    patientName: 'Sophia Martinez',
    doctorId: 'doc-1',
    doctorName: 'Dr. Robert Chen',
    scanType: 'Chest X-Ray (PA & Lateral View)',
    modality: 'X-Ray',
    bodyPart: 'Chest / Thorax',
    scanDate: '2026-08-03 14:20',
    imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800',
    findings: 'Lungs are clear bilaterally. Cardiothoracic ratio is within normal limits (<0.5). No acute pulmonary infiltrates or pleural effusion identified. Trachea is midline.',
    impression: 'Normal 2-view chest radiograph. No active cardiopulmonary pathology.',
    radiologistName: 'Dr. Marcus Vance, MD (Radiology)',
    status: 'Reviewed',
    urgency: 'Routine',
  },
  {
    id: 'rad-2',
    patientId: 'pat-3',
    patientName: 'Emma Watson',
    doctorId: 'doc-2',
    doctorName: 'Dr. Alisha Sharma',
    scanType: 'Brain MRI Scan with Contrast',
    modality: 'MRI',
    bodyPart: 'Brain / Head',
    scanDate: '2026-08-04 10:15',
    imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800',
    findings: 'Symmetrical cerebral hemispheres. Mild T2/FLAIR hyperintensity in periventricular white matter. No midline shift, mass effect, or abnormal contrast enhancement.',
    impression: 'Mild age-related ischemic changes. No acute intracranial hemorrhage, mass, or acute infarction.',
    radiologistName: 'Dr. Elena Rostova, MD (Neuroradiology)',
    status: 'Reviewed',
    urgency: 'Urgent',
  },
  {
    id: 'rad-3',
    patientId: 'pat-2',
    patientName: 'Michael Vance',
    doctorId: 'doc-3',
    doctorName: 'Dr. David Miller',
    scanType: 'Lumbar Spine CT 3D Reconstruction',
    modality: 'CT Scan',
    bodyPart: 'Lumbar Spine (L1-L5)',
    scanDate: '2026-08-02 11:45',
    imageUrl: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800',
    findings: 'L4-L5 posterior disc protrusion causing moderate canal stenosis and bilateral neuroforaminal narrowing. Intact bony alignment.',
    impression: 'L4-L5 herniated nucleus pulposus with moderate central canal compromise.',
    radiologistName: 'Dr. Marcus Vance, MD (Radiology)',
    status: 'Critical Finding',
    urgency: 'Emergency',
  },
  {
    id: 'rad-4',
    patientId: 'pat-4',
    patientName: 'James Wilson',
    doctorId: 'doc-4',
    doctorName: 'Dr. Maya Lin',
    scanType: 'Right Knee Joint Ultrasound & Soft Tissue',
    modality: 'Ultrasound',
    bodyPart: 'Right Knee Joint',
    scanDate: '2026-08-01 09:30',
    imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
    findings: 'Minimal joint effusion in the suprapatellar bursa. Quadriceps and patellar tendons intact with normal fibrillar architecture.',
    impression: 'Mild suprapatellar bursitis. No full-thickness tendon tear.',
    radiologistName: 'Dr. Sarah Jenkins, MD (Musculoskeletal Radiology)',
    status: 'Reviewed',
    urgency: 'Routine',
  }
];

const PRESET_SCAN_IMAGES = [
  { name: 'Chest X-Ray', url: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800', modality: 'X-Ray' },
  { name: 'Brain MRI', url: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=800', modality: 'MRI' },
  { name: 'Spine CT Scan', url: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800', modality: 'CT Scan' },
  { name: 'Joint Ultrasound', url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800', modality: 'Ultrasound' },
];

export const LaboratoryManager: React.FC = () => {
  const { labOrders, labCatalog, labTests, patients, doctors, orderLabTest, updateLabOrderStatus, searchQuery, setSearchQuery } = useHospital();
  const { activeRole } = useAuth();

  const ordersList = labOrders || [];
  const catalogList = labCatalog || labTests || [];
  const patientList = patients || [];
  const doctorList = doctors || [];

  const [activeTab, setActiveTab] = useState<'Orders' | 'Catalog' | 'Radiology'>('Orders');
  const [showOrderModal, setShowOrderModal] = useState(false);

  // Radiology State
  const [radiologyScans, setRadiologyScans] = useState<RadiologyScan[]>(() => {
    const saved = localStorage.getItem('hospital_radiology_scans');
    return saved ? JSON.parse(saved) : INITIAL_RADIOLOGY_SCANS;
  });
  const [selectedModalityFilter, setSelectedModalityFilter] = useState<string>('All');
  const [selectedScanForViewer, setSelectedScanForViewer] = useState<RadiologyScan | null>(null);
  const [showUploadScanModal, setShowUploadScanModal] = useState(false);

  // Save radiology scans to local storage
  useEffect(() => {
    localStorage.setItem('hospital_radiology_scans', JSON.stringify(radiologyScans));
  }, [radiologyScans]);

  // DICOM Viewer Controls State
  const [invertDICOM, setInvertDICOM] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);

  // Form State (Lab Orders)
  const [patientId, setPatientId] = useState(patientList[0]?.id || 'pat-1');
  const [doctorId, setDoctorId] = useState(doctorList[0]?.id || 'doc-1');
  const [testId, setTestId] = useState(catalogList[0]?.id || 'lab-cbc');

  // Form State (Radiology Upload)
  const [radPatientId, setRadPatientId] = useState(patientList[0]?.id || 'pat-1');
  const [radDoctorId, setRadDoctorId] = useState(doctorList[0]?.id || 'doc-1');
  const [radScanType, setRadScanType] = useState('Chest X-Ray (AP View)');
  const [radModality, setRadModality] = useState<'X-Ray' | 'MRI' | 'CT Scan' | 'Ultrasound' | 'Mammogram'>('X-Ray');
  const [radBodyPart, setRadBodyPart] = useState('Chest / Thorax');
  const [radUrgency, setRadUrgency] = useState<'Routine' | 'Urgent' | 'Emergency'>('Routine');
  const [radRadiologist, setRadRadiologist] = useState('Dr. Marcus Vance, MD');
  const [radFindings, setRadFindings] = useState('Clear lung fields. No acute fractures or abnormalities detected.');
  const [radImpression, setRadImpression] = useState('Unremarkable diagnostic study.');
  const [radImageUrl, setRadImageUrl] = useState(PRESET_SCAN_IMAGES[0].url);

  const filteredOrders = ordersList.filter(o => {
    return (o.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
           (o.testName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
           (o.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredRadiologyScans = radiologyScans.filter(scan => {
    const matchesModality = selectedModalityFilter === 'All' || scan.modality === selectedModalityFilter;
    const matchesSearch = searchQuery === '' || 
      scan.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.scanType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.bodyPart.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scan.radiologistName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModality && matchesSearch;
  });

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const test = catalogList.find(t => t.id === testId);
    if (!test) return;

    if (orderLabTest) {
      await orderLabTest({
        patientId,
        doctorId,
        testId: test.id,
        testName: test.testName,
        category: test.category,
        price: test.price
      });
    }

    setShowOrderModal(false);
  };

  const handleUploadScan = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patientList.find(p => p.id === radPatientId);
    const doc = doctorList.find(d => d.id === radDoctorId);

    const newScan: RadiologyScan = {
      id: `rad-${Date.now()}`,
      patientId: radPatientId,
      patientName: pat?.name || 'Selected Patient',
      doctorId: radDoctorId,
      doctorName: doc?.name || 'Assigned Physician',
      scanType: radScanType,
      modality: radModality,
      bodyPart: radBodyPart,
      scanDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      imageUrl: radImageUrl,
      findings: radFindings,
      impression: radImpression,
      radiologistName: radRadiologist,
      status: radUrgency === 'Emergency' ? 'Critical Finding' : 'Reviewed',
      urgency: radUrgency
    };

    setRadiologyScans([newScan, ...radiologyScans]);
    setShowUploadScanModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setRadImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const resetViewerControls = () => {
    setInvertDICOM(false);
    setZoomLevel(1);
    setBrightness(100);
    setContrast(100);
  };

  const getStatusBadge = (status: LabOrder['status']) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'Testing': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300 animate-pulse';
      case 'Sample Collected': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'Ordered': return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
    }
  };

  const getModalityBadge = (modality: RadiologyScan['modality']) => {
    switch (modality) {
      case 'X-Ray': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
      case 'MRI': return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-300 dark:border-cyan-800';
      case 'CT Scan': return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-800';
      case 'Ultrasound': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800';
      case 'Mammogram': return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-300 dark:border-pink-800';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            Pathology & Radiology Diagnostics Unit
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Order blood panels, view digital X-Rays/MRI scans, track specimen collections, and manage diagnostic reports.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab('Orders')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'Orders' ? 'bg-white dark:bg-slate-900 text-cyan-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Patient Orders ({labOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('Catalog')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'Catalog' ? 'bg-white dark:bg-slate-900 text-cyan-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              Test Catalog ({labCatalog.length})
            </button>
            <button
              onClick={() => setActiveTab('Radiology')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'Radiology' ? 'bg-white dark:bg-slate-900 text-cyan-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-cyan-500" />
              Radiology View ({radiologyScans.length})
            </button>
          </div>

          {activeTab === 'Radiology' ? (
            <button
              onClick={() => setShowUploadScanModal(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Radiology Scan</span>
            </button>
          ) : (
            <button
              onClick={() => setShowOrderModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Order Lab Test</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'Orders' && (
        <>
          {/* Search bar */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patient name, lab test, or doctor..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {/* Mobile Card List */}
          <div className="block sm:hidden space-y-3">
            {filteredOrders.map(order => (
              <div key={order.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white">{order.patientName}</p>
                    <p className="text-[10px] text-slate-400">Ordered by Dr. {order.doctorName}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${getStatusBadge(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl text-xs">
                  <FlaskConical className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 dark:text-white truncate">{order.testName}</p>
                    <p className="text-[10px] text-slate-400">{order.category}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Test Fee</span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">${(order.price ?? 0).toFixed(2)}</span>
                  </div>

                  {order.status !== 'Completed' && (
                    <button
                      onClick={() => updateLabOrderStatus(order.id, 'Completed', 'Normal lab report findings, within physiological reference values.', { hemoglobin: '14.2 g/dL', WBC: '6,800 /uL' })}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-lg cursor-pointer"
                    >
                      Process & Ready
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Orders Table */}
          <div className="hidden sm:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Lab Diagnostic Test</th>
                    <th className="py-3 px-4">Ordered By</th>
                    <th className="py-3 px-4">Sample Status</th>
                    <th className="py-3 px-4">Test Fee</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        {order.patientName}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <FlaskConical className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{order.testName}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                        Dr. {order.doctorName}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusBadge(order.status)}`}>
                          {order.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                        ${(order.price ?? 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-1">
                        {order.status === 'Ordered' && (
                          <button
                            onClick={() => updateLabOrderStatus(order.id, 'Sample Collected')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-100 transition-colors cursor-pointer"
                          >
                            Collect Sample
                          </button>
                        )}
                        {order.status === 'Sample Collected' && (
                          <button
                            onClick={() => updateLabOrderStatus(order.id, 'Testing')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 rounded-lg hover:bg-cyan-100 transition-colors cursor-pointer"
                          >
                            Start Testing
                          </button>
                        )}
                        {order.status === 'Testing' && (
                          <button
                            onClick={() => updateLabOrderStatus(order.id, 'Completed', 'Normal Range. No pathological abnormalities detected.')}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                          >
                            Attach Final Result
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'Catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {catalogList.map(test => (
            <div key={test.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                    {test.category}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">{test.turnaroundHours} Hrs Turnaround</span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white">{test.testName}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Specimen Required: <strong className="text-slate-800 dark:text-slate-200">{test.sampleRequired}</strong>
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-lg font-black text-slate-900 dark:text-white">${(test.price ?? 0).toFixed(2)}</span>
                <button
                  onClick={() => {
                    setTestId(test.id);
                    setShowOrderModal(true);
                  }}
                  className="px-3 py-1.5 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  Order Test
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* RADIOLOGY VIEW TAB */}
      {activeTab === 'Radiology' && (
        <div className="space-y-6">
          
          {/* Filters & Search Header */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Modality:</span>
              {['All', 'X-Ray', 'MRI', 'CT Scan', 'Ultrasound', 'Mammogram'].map((mod) => (
                <button
                  key={mod}
                  onClick={() => setSelectedModalityFilter(mod)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                    selectedModalityFilter === mod
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {mod}
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search patient, scan type, radiologist..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Radiology Scans Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRadiologyScans.map((scan) => (
              <div
                key={scan.id}
                className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Image Container / Thumbnail */}
                  <div className="relative bg-slate-950 aspect-video overflow-hidden flex items-center justify-center cursor-pointer" onClick={() => setSelectedScanForViewer(scan)}>
                    <img
                      src={scan.imageUrl}
                      alt={scan.scanType}
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=800';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                    {/* Modality Tag */}
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border backdrop-blur-md ${getModalityBadge(scan.modality)}`}>
                      {scan.modality}
                    </span>

                    {/* Urgency Badge */}
                    {scan.urgency !== 'Routine' && (
                      <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase border ${
                        scan.urgency === 'Emergency' ? 'bg-rose-500 text-white border-rose-600 animate-pulse' : 'bg-amber-500 text-white border-amber-600'
                      }`}>
                        {scan.urgency}
                      </span>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                      <span className="text-[11px] font-bold drop-shadow">{scan.bodyPart}</span>
                      <span className="text-[10px] opacity-80 font-mono">{scan.scanDate.split(' ')[0]}</span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-[2px]">
                      <span className="px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
                        <Maximize2 className="w-3.5 h-3.5 text-cyan-500" />
                        Open DICOM Viewer
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-cyan-600 transition-colors">
                      {scan.scanType}
                    </h3>

                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
                        <User className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                        <span className="truncate">{scan.patientName}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[11px]">
                        <Stethoscope className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Ref: {scan.doctorName}</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 italic bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl mt-2 border border-slate-100 dark:border-slate-800">
                      "{scan.impression}"
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                    {scan.radiologistName}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        exportRadiologyPDF(scan);
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                      title="Download PDF Report"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-500" />
                      <span className="hidden sm:inline">PDF</span>
                    </button>

                    <button
                      onClick={() => setSelectedScanForViewer(scan)}
                      className="px-3 py-1 text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredRadiologyScans.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <Film className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No Radiology Scans Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No patient X-Rays or MRI scans match your current filter or search criteria.
              </p>
            </div>
          )}
        </div>
      )}

      {/* FULL DICOM RADIOLOGY VIEWER MODAL */}
      {selectedScanForViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white my-auto">
            
            {/* DICOM Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Film className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-xs sm:text-base text-white truncate">{selectedScanForViewer.scanType}</h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border shrink-0 ${getModalityBadge(selectedScanForViewer.modality)}`}>
                      {selectedScanForViewer.modality}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                    Patient: <strong className="text-slate-200">{selectedScanForViewer.patientName}</strong> • Date: {selectedScanForViewer.scanDate}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => exportRadiologyPDF(selectedScanForViewer)}
                  className="px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedScanForViewer(null);
                    resetViewerControls();
                  }}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Body (Interactive Canvas + Sidebar) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-hidden">
              
              {/* Main Image Viewport with Darkroom Controls */}
              <div className="lg:col-span-2 bg-slate-950 p-4 sm:p-6 flex flex-col items-center justify-between relative min-h-[350px] lg:min-h-[500px]">
                
                {/* Viewport Toolbar */}
                <div className="w-full flex items-center justify-between gap-2 z-10 bg-slate-900/80 backdrop-blur-md p-2 rounded-2xl border border-slate-800/80 mb-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setInvertDICOM(!invertDICOM)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                        invertDICOM ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                      title="Toggle Negative / DICOM Invert Filter"
                    >
                      <Sun className="w-3.5 h-3.5" />
                      <span>{invertDICOM ? 'Standard' : 'Invert (DICOM)'}</span>
                    </button>

                    <div className="h-4 w-px bg-slate-800 mx-1" />

                    <button
                      onClick={() => setZoomLevel(Math.min(zoomLevel + 0.25, 2.5))}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono text-slate-400 min-w-[36px] text-center">{Math.round(zoomLevel * 100)}%</span>
                    <button
                      onClick={() => setZoomLevel(Math.max(zoomLevel - 0.25, 0.75))}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={resetViewerControls}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200 cursor-pointer flex items-center gap-1 text-[11px]"
                    title="Reset All Adjustments"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                </div>

                {/* Scan Image Render Box */}
                <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-inner p-2">
                  <div
                    className="transition-all duration-200 max-h-full max-w-full flex items-center justify-center"
                    style={{
                      transform: `scale(${zoomLevel})`,
                      filter: `${invertDICOM ? 'invert(1) hue-rotate(180deg)' : 'none'} brightness(${brightness}%) contrast(${contrast}%)`
                    }}
                  >
                    <img
                      src={selectedScanForViewer.imageUrl}
                      alt={selectedScanForViewer.scanType}
                      className="max-h-[380px] w-auto object-contain rounded shadow-2xl"
                    />
                  </div>

                  {/* Corner DICOM Overlay Markers */}
                  <div className="absolute top-3 left-3 text-[10px] font-mono text-cyan-400/80 bg-black/60 px-2 py-1 rounded border border-cyan-500/20 pointer-events-none">
                    PAT: {selectedScanForViewer.patientName.toUpperCase()}
                  </div>
                  <div className="absolute top-3 right-3 text-[10px] font-mono text-cyan-400/80 bg-black/60 px-2 py-1 rounded border border-cyan-500/20 pointer-events-none">
                    MOD: {selectedScanForViewer.modality} ({selectedScanForViewer.bodyPart})
                  </div>
                  <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400/80 bg-black/60 px-2 py-1 rounded border border-slate-800 pointer-events-none">
                    STATUS: {selectedScanForViewer.status.toUpperCase()}
                  </div>
                  <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-400/80 bg-black/60 px-2 py-1 rounded border border-slate-800 pointer-events-none">
                    ZOOM: {Math.round(zoomLevel * 100)}%
                  </div>
                </div>

                {/* Brightness & Contrast Sliders */}
                <div className="w-full grid grid-cols-2 gap-4 bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-[11px] text-slate-400">Bright</span>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="text-[11px] text-slate-400">Contrast</span>
                    <input
                      type="range"
                      min="50"
                      max="150"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>
                </div>

              </div>

              {/* Clinical Report Sidebar */}
              <div className="bg-slate-900 p-6 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col justify-between overflow-y-auto space-y-6">
                
                <div className="space-y-4 text-xs">
                  
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">Radiology Diagnostic Report</span>
                    <h4 className="text-base font-extrabold text-white">{selectedScanForViewer.scanType}</h4>
                    <p className="text-slate-400 mt-0.5">Area Examined: <strong className="text-slate-200">{selectedScanForViewer.bodyPart}</strong></p>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Attending Physician:</span>
                      <span className="font-bold text-white">{selectedScanForViewer.doctorName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Reporting Radiologist:</span>
                      <span className="font-bold text-cyan-400">{selectedScanForViewer.radiologistName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Priority / Urgency:</span>
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        selectedScanForViewer.urgency === 'Emergency' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {selectedScanForViewer.urgency}
                      </span>
                    </div>
                  </div>

                  {/* Findings */}
                  <div>
                    <h5 className="font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                      Detailed Radiological Findings
                    </h5>
                    <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/40 p-3 rounded-2xl border border-slate-800/80">
                      {selectedScanForViewer.findings}
                    </p>
                  </div>

                  {/* Impression */}
                  <div>
                    <h5 className="font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Diagnostic Impression
                    </h5>
                    <p className="text-amber-200/90 font-medium text-xs leading-relaxed bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                      {selectedScanForViewer.impression}
                    </p>
                  </div>

                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <button
                    onClick={() => exportRadiologyPDF(selectedScanForViewer)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Diagnostic Report</span>
                  </button>

                  <button
                    onClick={() => {
                      alert(`Verified & Signed Radiology Report for ${selectedScanForViewer.patientName}`);
                      setSelectedScanForViewer(null);
                    }}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    Approve & Sign Diagnostic Report
                  </button>

                  <button
                    onClick={() => setSelectedScanForViewer(null)}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Close Viewer
                  </button>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* UPLOAD RADIOLOGY SCAN MODAL */}
      {showUploadScanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-3xl shadow-2xl p-6 relative text-xs my-auto">
            <button
              onClick={() => setShowUploadScanModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Upload Patient Radiology Scan</h3>
                <p className="text-[11px] text-slate-400">Attach DICOM X-Ray, MRI, CT, or Ultrasound images to patient record</p>
              </div>
            </div>

            <form onSubmit={handleUploadScan} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Patient</label>
                  <select
                    value={radPatientId}
                    onChange={(e) => setRadPatientId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    {patientList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Ordering Doctor</label>
                  <select
                    value={radDoctorId}
                    onChange={(e) => setRadDoctorId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    {doctorList.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Modality</label>
                  <select
                    value={radModality}
                    onChange={(e) => {
                      const mod = e.target.value as any;
                      setRadModality(mod);
                      if (mod === 'X-Ray') {
                        setRadScanType('Chest X-Ray (AP View)');
                        setRadImageUrl(PRESET_SCAN_IMAGES[0].url);
                      } else if (mod === 'MRI') {
                        setRadScanType('Brain MRI with Contrast');
                        setRadImageUrl(PRESET_SCAN_IMAGES[1].url);
                      } else if (mod === 'CT Scan') {
                        setRadScanType('Lumbar Spine CT 3D');
                        setRadImageUrl(PRESET_SCAN_IMAGES[2].url);
                      } else if (mod === 'Ultrasound') {
                        setRadScanType('Abdominal Soft Tissue Ultrasound');
                        setRadImageUrl(PRESET_SCAN_IMAGES[3].url);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="X-Ray">X-Ray</option>
                    <option value="MRI">MRI</option>
                    <option value="CT Scan">CT Scan</option>
                    <option value="Ultrasound">Ultrasound</option>
                    <option value="Mammogram">Mammogram</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Body Part / Area</label>
                  <input
                    type="text"
                    value={radBodyPart}
                    onChange={(e) => setRadBodyPart(e.target.value)}
                    placeholder="e.g. Chest / Thorax"
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Urgency</label>
                  <select
                    value={radUrgency}
                    onChange={(e) => setRadUrgency(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Routine">Routine</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Scan Title / Description</label>
                <input
                  type="text"
                  value={radScanType}
                  onChange={(e) => setRadScanType(e.target.value)}
                  placeholder="e.g. Chest X-Ray (PA & Lateral)"
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>

              {/* Image Upload Area */}
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Scan Image (File Upload or Preset)</label>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-700">
                    <img src={radImageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700 cursor-pointer"
                    />

                    <div className="flex items-center gap-1 overflow-x-auto pt-1">
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">Or Preset:</span>
                      {PRESET_SCAN_IMAGES.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setRadImageUrl(preset.url)}
                          className={`px-2 py-0.5 text-[10px] rounded-lg border font-medium cursor-pointer whitespace-nowrap ${
                            radImageUrl === preset.url ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Reporting Radiologist</label>
                <input
                  type="text"
                  value={radRadiologist}
                  onChange={(e) => setRadRadiologist(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Radiological Findings</label>
                <textarea
                  value={radFindings}
                  onChange={(e) => setRadFindings(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Diagnostic Impression</label>
                <input
                  type="text"
                  value={radImpression}
                  onChange={(e) => setRadImpression(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Save & Store Radiology Scan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 relative">
            <button onClick={() => setShowOrderModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Order Lab Diagnostic Test</h3>

            <form onSubmit={handleOrder} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Select Patient</label>
                <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Ordering Physician</label>
                <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>)}
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Select Test Panel</label>
                <select value={testId} onChange={(e) => setTestId(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                  {labCatalog.map(t => <option key={t.id} value={t.id}>{t.testName} — ${t.price} ({t.sampleRequired})</option>)}
                </select>
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                Confirm & Dispatch Lab Order
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

