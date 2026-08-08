import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HospitalProvider, useHospital } from './context/HospitalContext';
import { ThemeProvider } from './context/ThemeContext';
import { GSAPLandingPage } from './components/GSAPLandingPage';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { AuthModal } from './components/AuthModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { RazorpayModal } from './components/RazorpayModal';
import { EmailLogModal } from './components/EmailLogModal';

import { DashboardOverview } from './components/DashboardOverview';
import { DoctorsManager } from './components/DoctorsManager';
import { PatientsManager } from './components/PatientsManager';
import { AppointmentsManager } from './components/AppointmentsManager';
import { DepartmentsManager } from './components/DepartmentsManager';
import { PharmacyManager } from './components/PharmacyManager';
import { LaboratoryManager } from './components/LaboratoryManager';
import { MedicalRecordsManager } from './components/MedicalRecordsManager';
import { PrescriptionsManager } from './components/PrescriptionsManager';
import { InventoryManager } from './components/InventoryManager';
import { BillingManager } from './components/BillingManager';
import { AiAssistant } from './components/AiAssistant';
import { AuditLogsManager } from './components/AuditLogsManager';

const AppContent: React.FC = () => {
  const { user, switchRole } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('landing');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If user is not logged in OR activeTab is 'landing', render standalone Public Portal Landing Page
  if (!user || activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-white transition-colors max-w-full overflow-x-hidden">
        <GSAPLandingPage
          onGoToTab={(tab) => {
            if (!user) switchRole('Hospital Admin');
            setActiveTab(tab as ActiveTab);
          }}
          onOpenAuth={() => {}}
        />
        <AuthModal />
        <ArchitectureModal />
        <RazorpayModal />
        <EmailLogModal />
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onGoToTab={(t) => setActiveTab(t as ActiveTab)} />;
      case 'doctors':
        return <DoctorsManager />;
      case 'patients':
        return <PatientsManager />;
      case 'appointments':
        return <AppointmentsManager />;
      case 'departments':
        return <DepartmentsManager />;
      case 'pharmacy':
        return <PharmacyManager />;
      case 'laboratory':
        return <LaboratoryManager />;
      case 'medical-records':
        return <MedicalRecordsManager />;
      case 'prescriptions':
        return <PrescriptionsManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'billing':
        return <BillingManager />;
      case 'ai-assistant':
        return <AiAssistant />;
      case 'audit-logs':
        return <AuditLogsManager />;
      default:
        return <DashboardOverview onGoToTab={(t) => setActiveTab(t as ActiveTab)} />;
    }
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans antialiased selection:bg-cyan-500 selection:text-white max-w-full overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen max-w-full overflow-hidden">
        
        {/* Top Navbar */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />

        {/* Dynamic Page Workspace Body */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderTabContent()}
          </div>
        </main>

      </div>

      {/* Global Modals */}
      <AuthModal />
      <ArchitectureModal />
      <RazorpayModal />
      <EmailLogModal />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HospitalProvider>
          <AppContent />
        </HospitalProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
