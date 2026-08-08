import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { Wrench, Plus, Search, AlertCircle, CheckCircle2, Shield, Calendar, X } from 'lucide-react';
import { InventoryItem } from '../types';

export const InventoryManager: React.FC = () => {
  const { inventory, departments, addInventoryItem, updateInventoryCondition, searchQuery, setSearchQuery } = useHospital();
  const { activeRole } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'ICU Machinery' | 'Surgical Equipment' | 'Diagnostic Gear' | 'General Supplies' | 'PPE & Hygiene'>('ICU Machinery');
  const [quantity, setQuantity] = useState(5);
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-cardio');
  const [status, setStatus] = useState<'Optimal' | 'Requires Maintenance' | 'Low Stock' | 'Critical'>('Optimal');

  const filteredInventory = inventory.filter(item => {
    return item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.category.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    await addInventoryItem({
      name,
      category,
      quantity: Number(quantity),
      unit: 'Units',
      minThreshold: 2,
      lastMaintenanceDate: new Date().toISOString().substring(0, 10),
      nextMaintenanceDate: '2026-12-31',
      status,
      departmentId
    });

    setShowAddModal(false);
  };

  const getStatusBadge = (st: InventoryItem['status']) => {
    switch (st) {
      case 'Optimal': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'Requires Maintenance': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300 animate-pulse';
      case 'Low Stock': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'Critical': return 'bg-rose-500 text-white animate-pulse';
    }
  };

  const canEdit = activeRole === 'Super Admin' || activeRole === 'Hospital Admin';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Hospital Asset & Medical Equipment Maintenance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track ventilators, MRI magnets, surgical tools, and preventive maintenance schedules.
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Asset / Equipment</span>
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search asset name or category..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInventory.map(item => {
          const dept = departments.find(d => d.id === item.departmentId);

          return (
            <div key={item.id} className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                    {item.category}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(item.status)}`}>
                    {item.status}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white">{item.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Allocated to {dept?.name || 'Main Hospital Wing'}
                </p>

                <div className="mt-4 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p>Quantity in Wing: <strong className="text-slate-900 dark:text-white">{item.quantity} {item.unit}</strong></p>
                  <p className="text-[11px] text-slate-400">Last Serviced: {item.lastMaintenanceDate}</p>
                </div>
              </div>

              {canEdit && (
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  {item.status === 'Optimal' ? (
                    <button
                      onClick={() => updateInventoryCondition(item.id, 'Requires Maintenance')}
                      className="px-3 py-1.5 text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Wrench className="w-3.5 h-3.5" /> Flag Maintenance
                    </button>
                  ) : (
                    <button
                      onClick={() => updateInventoryCondition(item.id, 'Optimal')}
                      className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Optimal
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Register Hospital Asset / Machinery</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Equipment Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="GE Healthcare ICU Ventilator V2" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                    <option value="ICU Machinery">ICU Machinery</option>
                    <option value="Surgical Equipment">Surgical Equipment</option>
                    <option value="Diagnostic Gear">Diagnostic Gear</option>
                    <option value="General Supplies">General Supplies</option>
                    <option value="PPE & Hygiene">PPE & Hygiene</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Allocated Wing</label>
                  <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Quantity</label>
                <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                Register Equipment Record
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
