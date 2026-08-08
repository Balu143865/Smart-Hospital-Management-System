import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { Building2, Bed, Users, ShieldAlert, Plus, Edit2, X, Check } from 'lucide-react';
import { Department } from '../types';

export const DepartmentsManager: React.FC = () => {
  const { departments, updateBedOccupancy } = useHospital();
  const { activeRole } = useAuth();
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [bedsInput, setBedsInput] = useState<number>(0);

  const canEdit = activeRole === 'Super Admin' || activeRole === 'Hospital Admin';

  const handleSaveBeds = async (deptId: string) => {
    await updateBedOccupancy(deptId, bedsInput);
    setEditingDeptId(null);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Hospital Wings & Bed Occupancy Telemetry
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time monitoring of ICU, Ward, Cardiology, and Surgical bed capacities.
          </p>
        </div>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => {
          const occupancyPct = Math.round((dept.occupiedBeds / dept.totalBeds) * 100);
          const isFull = occupancyPct >= 90;

          return (
            <div key={dept.id} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
              
              {isFull && (
                <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-bl-xl uppercase tracking-wider animate-pulse">
                  High Occupancy Alert
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-cyan-500/20">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{dept.name}</h3>
                  <p className="text-xs text-slate-500">Head: {dept.headDoctor}</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                {dept.description}
              </p>

              {/* Progress Bar */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-600 dark:text-slate-300">Bed Occupancy Rate</span>
                  <span className={isFull ? 'text-rose-600 dark:text-rose-400' : 'text-cyan-600 dark:text-cyan-400'}>
                    {dept.occupiedBeds} / {dept.totalBeds} ({occupancyPct}%)
                  </span>
                </div>

                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isFull ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                    }`}
                    style={{ width: `${occupancyPct}%` }}
                  />
                </div>
              </div>

              {/* Quick Update Beds Control */}
              {canEdit && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {editingDeptId === dept.id ? (
                    <div className="flex items-center gap-2 w-full">
                      <input
                        type="number"
                        value={bedsInput}
                        onChange={(e) => setBedsInput(Number(e.target.value))}
                        className="w-20 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                        max={dept.totalBeds}
                        min={0}
                      />
                      <button
                        onClick={() => handleSaveBeds(dept.id)}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Save
                      </button>
                      <button
                        onClick={() => setEditingDeptId(null)}
                        className="p-1 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingDeptId(dept.id);
                        setBedsInput(dept.occupiedBeds);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 rounded-lg hover:bg-cyan-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Adjust Occupied Beds</span>
                    </button>
                  )}
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
