import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useHospital } from '../context/HospitalContext';
import { ProfileAvatarUpload } from './ProfileAvatarUpload';
import {
  Hospital, Moon, Sun, Bell, Search, User, ShieldCheck, Mail, FileCode2,
  ChevronDown, AlertTriangle, CheckCircle, Info, Sparkles, LogOut, Menu,
  Upload, Camera, X, Edit3, Save
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, isSidebarOpen, onOpenAuth }) => {
  const { user, activeRole, switchRole, logout, updateProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const {
    searchQuery, setSearchQuery, notifications, markNotificationRead,
    triggerEmergencyAlert, setShowArchitectureModal, setShowEmailLogModal
  } = useHospital();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setShowRoleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // User Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAvatar, setProfileAvatar] = useState(user?.avatar || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenProfileModal = () => {
    if (user) {
      setProfileName(user.name);
      setProfilePhone(user.phone || '');
      setProfileAvatar(user.avatar || '');
      setShowProfileModal(true);
    }
  };

  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProfileAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileName,
      phone: profilePhone,
      avatar: profileAvatar,
    });
    setShowProfileModal(false);
  };

  const notifs = notifications || [];
  const unreadCount = notifs.filter(n => !n.isRead).length;

  const roles: UserRole[] = ['Super Admin', 'Hospital Admin', 'Doctor', 'Receptionist', 'Patient'];

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'Super Admin': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-300';
      case 'Hospital Admin': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-300';
      case 'Doctor': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300';
      case 'Receptionist': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300';
      case 'Patient': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-300';
    }
  };

  const getShortRole = (role: UserRole) => {
    switch (role) {
      case 'Super Admin': return 'Super';
      case 'Hospital Admin': return 'Admin';
      case 'Doctor': return 'Doctor';
      case 'Receptionist': return 'Recept';
      case 'Patient': return 'Patient';
    }
  };

  return (
    <header className="sticky top-0 z-30 shrink-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors max-w-full">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Mobile Sidebar Toggle & Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 rounded-xl transition-colors cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              title="Toggle Navigation Menu"
              aria-label="Toggle Navigation Menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          <div
            onClick={onToggleSidebar}
            className="flex items-center gap-2 cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
              <Hospital className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="hidden xs:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm sm:text-lg tracking-tight text-slate-900 dark:text-white">
                  MediPulse<span className="text-cyan-600 dark:text-cyan-400">OS</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 rounded border border-cyan-300 dark:border-cyan-800">
                  Enterprise
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Search Bar - Hidden on small mobile */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search doctors, patients, records, invoices, drugs..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
            />
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">

          {/* Emergency Alert Trigger - XL screens */}
          <button
            onClick={() => triggerEmergencyAlert('ER Trauma Code Red', 'Level-1 Ambulance inbound with severe trauma patient. ICU Room 02 prepared.')}
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-sm shadow-rose-500/30 transition-all cursor-pointer animate-pulse"
            title="Trigger ER Trauma Alert across system"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Emergency Code</span>
          </button>

          {/* Architecture / ER Diagram Documentation Button - SM+ screens */}
          <button
            onClick={() => setShowArchitectureModal(true)}
            className="hidden sm:flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="View Software Architecture & ER Diagram"
          >
            <FileCode2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Docs</span>
          </button>

          {/* Nodemailer Email Log Simulator - SM+ screens */}
          <button
            onClick={() => setShowEmailLogModal(true)}
            className="hidden sm:block p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer relative"
            title="View Nodemailer Log Inbox"
          >
            <Mail className="w-4 h-4" />
          </button>

          {/* Real-time Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowRoleDropdown(false);
              }}
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="fixed sm:absolute top-14 sm:top-auto left-3 sm:left-auto right-3 sm:right-0 mt-2 sm:mt-2 w-auto sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-fadeIn">
                <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">System Notifications</h4>
                  <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">{unreadCount} unread</span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${!n.isRead ? 'bg-cyan-50/50 dark:bg-cyan-950/20' : ''}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.type === 'emergency' && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                        {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                        {n.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                        {n.type === 'info' && <Info className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />}
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">{n.title}</p>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{n.message}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">{n.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer shrink-0"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Light and Dark Mode"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            )}
          </button>

          {/* Active Role Switcher Dropdown */}
          <div className="relative" ref={roleRef}>
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowNotifications(false);
              }}
              className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 text-[10px] sm:text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${getRoleColor(activeRole)}`}
              title="Switch User Role (RBAC)"
            >
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">{activeRole}</span>
              <span className="sm:hidden">{getShortRole(activeRole)}</span>
              <ChevronDown className="w-3 h-3 shrink-0 ml-0.5" />
            </button>

            {showRoleDropdown && (
              <div className="fixed sm:absolute top-14 sm:top-auto right-3 sm:right-0 mt-2 sm:mt-2 w-52 sm:w-52 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-fadeIn">
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Role (RBAC)
                </div>
                {roles.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${activeRole === r ? 'text-cyan-600 dark:text-cyan-400 font-bold bg-cyan-50 dark:bg-cyan-950/40' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    <span>{r}</span>
                    {activeRole === r && <CheckCircle className="w-3.5 h-3.5 text-cyan-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1 border-l border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleOpenProfileModal}
                className="flex items-center gap-1.5 group cursor-pointer focus:outline-none"
                title="Edit Profile & Upload Avatar"
              >
                <div className="relative">
                  <img
                    src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"}
                    alt={user.name}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-cyan-500/30 group-hover:ring-cyan-500 shrink-0 transition-all"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-cyan-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-2.5 h-2.5" />
                  </div>
                </div>
                <span className="hidden md:inline-block text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              <button
                onClick={logout}
                className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-2.5 py-1 text-xs font-semibold bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-sm transition-all shrink-0"
            >
              Sign In
            </button>
          )}

        </div>
      </div>

      {/* User Profile & Upload Avatar Modal */}
      {showProfileModal && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowProfileModal(false);
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-150 my-auto text-left max-h-[90vh] flex flex-col">
            <button
              type="button"
              onClick={() => setShowProfileModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white z-10 cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 shrink-0 pr-6">
              <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Profile Settings & Avatar</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update photo, account name, and phone</p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs overflow-y-auto pr-1 flex-1">
              
              {/* Reusable ProfileAvatarUpload with Cloudinary integration */}
              <ProfileAvatarUpload
                value={profileAvatar}
                onChange={setProfileAvatar}
                label="Profile Picture (Cloudinary & Local Upload)"
              />

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Display Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Phone Number</label>
                <input
                  type="text"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Email Address (Read-Only)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 bg-slate-200/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>

            </form>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

