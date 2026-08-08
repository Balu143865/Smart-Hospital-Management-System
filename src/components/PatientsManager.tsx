import React, { useState, useRef } from 'react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { ProfileAvatarUpload } from './ProfileAvatarUpload';
import { Search, Plus, User, Heart, AlertCircle, Phone, MapPin, X, FileText, CheckCircle2, Upload, Camera } from 'lucide-react';
import { Patient } from '../types';

export const PatientsManager: React.FC = () => {
  const { patients, addPatient, medicalRecords, prescriptions, searchQuery, setSearchQuery } = useHospital();
  const { activeRole } = useAuth();
  
  const [bloodFilter, setBloodFilter] = useState<string>('All');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [allergies, setAllergies] = useState('Penicillin');
  const [chronicDiseases, setChronicDiseases] = useState('None');
  const [admittedStatus, setAdmittedStatus] = useState<'Outpatient' | 'Inpatient (Ward)' | 'ICU'>('Outpatient');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredPatients = patients.filter(pat => {
    const matchesSearch = pat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          pat.phone.includes(searchQuery);
    const matchesBlood = bloodFilter === 'All' || pat.bloodGroup === bloodFilter;
    return matchesSearch && matchesBlood;
  });

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    await addPatient({
      name,
      email,
      phone,
      age: Number(age),
      gender,
      bloodGroup,
      address,
      emergencyContact,
      allergies: allergies.split(',').map(s => s.trim()).filter(Boolean),
      chronicDiseases: chronicDiseases.split(',').map(s => s.trim()).filter(Boolean),
      admittedStatus,
      avatar: avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
    });
    setShowAddModal(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ICU': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 animate-pulse';
      case 'Inpatient (Ward)': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'Outpatient': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Patient EHR Directory & Admission Telemetry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Electronic Health Records (EHR), emergency contacts, blood group matching, and ward status.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Patient</span>
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patient name or phone number..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <select
          value={bloodFilter}
          onChange={(e) => setBloodFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <option value="All">All Blood Groups</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>
      </div>

      {/* Mobile Card List */}
      <div className="block sm:hidden space-y-3">
        {filteredPatients.map(pat => (
          <div key={pat.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <img
                src={pat.avatar}
                alt={pat.name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-cyan-500/20 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{pat.name}</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                    {pat.bloodGroup}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{pat.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Age / Gender</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{pat.age} yrs / {pat.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold block">Phone</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{pat.phone}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${getStatusBadge(pat.admittedStatus)}`}>
                {pat.admittedStatus} {pat.assignedBed ? `(${pat.assignedBed})` : ''}
              </span>

              <button
                onClick={() => setSelectedPatient(pat)}
                className="px-3 py-1.5 text-xs font-semibold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 rounded-lg cursor-pointer"
              >
                View EHR
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Patients Table */}
      <div className="hidden sm:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Patient Info</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Status & Ward</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPatients.map(pat => (
                <tr key={pat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={pat.avatar}
                        alt={pat.name}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-cyan-500/20"
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{pat.name}</p>
                        <p className="text-[11px] text-slate-400">{pat.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {pat.age} yrs / {pat.gender}
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded font-black text-rose-600 bg-rose-50 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
                      {pat.bloodGroup}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getStatusBadge(pat.admittedStatus)}`}>
                      {pat.admittedStatus} {pat.assignedBed ? `(${pat.assignedBed})` : ''}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{pat.phone}</span>
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedPatient(pat)}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 text-cyan-700 dark:text-cyan-400 rounded-lg transition-colors cursor-pointer"
                    >
                      View EHR Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Drawer */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Patient EHR Summary</h3>
              <button onClick={() => setSelectedPatient(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center">
              <img src={selectedPatient.avatar} alt={selectedPatient.name} className="w-20 h-20 rounded-full mx-auto object-cover ring-4 ring-cyan-500/20 mb-2" />
              <h4 className="font-extrabold text-lg text-slate-900 dark:text-white">{selectedPatient.name}</h4>
              <p className="text-xs text-slate-500">{selectedPatient.email} • {selectedPatient.phone}</p>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Age & Gender:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedPatient.age} yrs / {selectedPatient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Blood Group:</span>
                <span className="font-bold text-rose-600">{selectedPatient.bloodGroup}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Emergency Contact:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedPatient.emergencyContact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Allergies:</span>
                <span className="font-bold text-amber-600">{selectedPatient.allergies.join(', ') || 'None'}</span>
              </div>
            </div>

            <div>
              <h5 className="font-bold text-xs text-slate-900 dark:text-white mb-2">Linked Medical History</h5>
              {medicalRecords.filter(r => r.patientId === selectedPatient.id).map(rec => (
                <div key={rec.id} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 mb-2 text-xs">
                  <p className="font-bold text-cyan-600 dark:text-cyan-400">{rec.diagnosis}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{rec.visitDate} — Dr. {rec.doctorName}</p>
                  <p className="text-slate-700 dark:text-slate-300 mt-1">{rec.clinicalNotes}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Register Patient Record</h3>

            <form onSubmit={handleCreatePatient} className="space-y-3 text-xs max-h-[80vh] overflow-y-auto pr-1">
              
              {/* Profile Photo Upload Field */}
              <ProfileAvatarUpload
                value={avatar}
                onChange={setAvatar}
                label="Patient Photo / ID (Cloudinary & Local)"
              />

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Sophia Martinez" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sophia@gmail.com" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Phone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 016-5543" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Age</label>
                  <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value as any)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Blood Group</label>
                  <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Emergency Contact</label>
                <input type="text" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} placeholder="Spouse / Parent - Phone" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                Save Patient Record
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
