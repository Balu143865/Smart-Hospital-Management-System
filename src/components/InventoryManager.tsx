import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import {
  Wrench, Plus, Search, AlertCircle, CheckCircle2, Shield, Calendar, X,
  AlertTriangle, Bell, Package, PackageCheck, RefreshCw, TrendingDown,
  Pill, Zap, Filter, ArrowUpRight, ChevronDown, Check, Sparkles
} from 'lucide-react';
import { InventoryItem, PharmacyItem } from '../types';

export const InventoryManager: React.FC = () => {
  const {
    inventory,
    pharmacy,
    pharmacyItems,
    departments,
    addInventoryItem,
    updateInventoryCondition,
    reorderStock,
    triggerEmergencyAlert,
    refreshData,
    searchQuery,
    setSearchQuery
  } = useHospital();

  const { activeRole } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'LowStock' | 'Medications' | 'Equipment' | 'Maintenance'>('All');
  const [showAlertDrawer, setShowAlertDrawer] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'ICU Machinery' | 'Surgical Equipment' | 'Diagnostic Gear' | 'General Supplies' | 'PPE & Hygiene'>('ICU Machinery');
  const [quantity, setQuantity] = useState(5);
  const [minThreshold, setMinThreshold] = useState(10);
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || 'dept-cardio');
  const [status, setStatus] = useState<'Optimal' | 'Requires Maintenance' | 'Low Stock' | 'Critical'>('Optimal');

  // Combined medication list from pharmacy for low stock cross-checks
  const allMeds: PharmacyItem[] = pharmacyItems || pharmacy || [];

  // Low Stock Items identification (Inventory + Pharmacy)
  const lowStockInventory = inventory.filter(item => item.quantity <= item.minThreshold || item.status === 'Low Stock' || item.status === 'Critical');
  const lowStockMeds = allMeds.filter(m => (m.stockCount ?? 0) <= (m.reorderLevel ?? 20));

  const totalLowStockCount = lowStockInventory.length + lowStockMeds.length;
  const criticalCount = inventory.filter(i => i.status === 'Critical' || i.quantity <= Math.ceil(i.minThreshold / 2)).length +
                       allMeds.filter(m => (m.stockCount ?? 0) <= 10).length;

  // Handler to restock inventory item
  const handleRestockInventory = async (itemId: string, addQty: number) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const newQty = item.quantity + addQty;
    const newStatus = newQty > item.minThreshold ? 'Optimal' : (newQty <= Math.ceil(item.minThreshold / 2) ? 'Critical' : 'Low Stock');

    try {
      await fetch(`/api/inventory/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty, status: newStatus })
      });
      await refreshData();
      setActionNotice(`Restocked ${addQty} units for ${item.name}. New total: ${newQty} ${item.unit}`);
      setTimeout(() => setActionNotice(null), 4000);
    } catch (e) {
      console.error('Restock error:', e);
    }
  };

  // Handler to dispatch low-stock emergency alert notification
  const handleDispatchLowStockAlert = async () => {
    const criticalNames = [...lowStockInventory.map(i => i.name), ...lowStockMeds.map(m => m.name)].slice(0, 3).join(', ');
    await triggerEmergencyAlert(
      '⚠️ Urgent Inventory & Medication Reorder Alert',
      `Low stock warning: ${totalLowStockCount} items below safety threshold (${criticalNames}). Immediate supply order required!`
    );
    setActionNotice('Hospital-wide Low Stock Reorder Emergency Alert dispatched to Administrators!');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    await addInventoryItem({
      name,
      category,
      quantity: Number(quantity),
      unit: 'Units',
      minThreshold: Number(minThreshold),
      lastMaintenanceDate: new Date().toISOString().substring(0, 10),
      nextMaintenanceDate: '2026-12-31',
      status: Number(quantity) <= Number(minThreshold) ? 'Low Stock' : status,
      departmentId
    });

    setShowAddModal(false);
    setActionNotice(`Registered new asset: ${name}`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Helper for color-coded status badges
  const getStatusBadgeClass = (itemStatus: InventoryItem['status'], qty: number, threshold: number) => {
    if (qty <= Math.ceil(threshold / 2) || itemStatus === 'Critical') {
      return 'bg-rose-500 text-white dark:bg-rose-600 border-rose-600 shadow-sm animate-pulse font-extrabold';
    }
    if (qty <= threshold || itemStatus === 'Low Stock') {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-bold';
    }
    if (itemStatus === 'Requires Maintenance') {
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800 font-bold';
    }
    return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-semibold';
  };

  // Filtered lists based on tab and search
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'LowStock') return item.quantity <= item.minThreshold || item.status === 'Low Stock' || item.status === 'Critical';
    if (activeTab === 'Equipment') return item.category === 'ICU Machinery' || item.category === 'Surgical Equipment' || item.category === 'Diagnostic Gear';
    if (activeTab === 'Maintenance') return item.status === 'Requires Maintenance';

    return true;
  });

  const filteredMeds = allMeds.filter(med => {
    const matchesSearch = med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (med.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'LowStock') {
      const qty = med.stockCount ?? 0;
      const thresh = med.reorderLevel ?? 20;
      return qty <= thresh;
    }
    return activeTab === 'All' || activeTab === 'Medications';
  });

  const canEdit = activeRole === 'Super Admin' || activeRole === 'Hospital Admin';

  return (
    <div className="space-y-6">

      {/* Action Notification Toast */}
      {actionNotice && (
        <div className="p-4 rounded-2xl bg-cyan-600 text-white font-bold text-xs shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-white hover:text-cyan-200 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Hospital Assets & Low-Stock Notification Hub
            </h2>
            {totalLowStockCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-sm flex items-center gap-1 animate-pulse">
                <AlertTriangle className="w-3 h-3" />
                {totalLowStockCount} Low Stock
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time visual monitoring for critical hospital supplies, life-saving machinery, and low-stock medication badges.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={handleDispatchLowStockAlert}
              className="px-3.5 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              title="Broadcast Hospital Low-Stock Alert to Admin Console"
            >
              <Bell className="w-4 h-4 animate-bounce text-amber-200" />
              <span>Broadcast Stock Alert</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Asset / Equipment</span>
            </button>
          </div>
        )}
      </div>

      {/* LOW STOCK NOTIFICATION CENTER BANNER */}
      {totalLowStockCount > 0 && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-rose-950/90 to-slate-900 border-2 border-rose-500/40 text-white shadow-2xl relative overflow-hidden">
          <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    Stock Alert Notification Center ({totalLowStockCount} Items Below Minimum Threshold)
                  </h3>
                  {criticalCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-black bg-rose-600 text-white rounded-md border border-rose-400 animate-ping">
                      {criticalCount} CRITICAL
                    </span>
                  )}
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  Automated sensors detected <strong className="text-white">{lowStockInventory.length} inventory assets</strong> and <strong className="text-amber-300">{lowStockMeds.length} medications</strong> operating below safety stock reserves.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveTab('LowStock')}
                className="px-3.5 py-2 bg-rose-500 hover:bg-rose-400 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Filter className="w-3.5 h-3.5" /> View Low Stock Only
              </button>
              <button
                onClick={() => setShowAlertDrawer(!showAlertDrawer)}
                className="p-2 text-slate-300 hover:text-white bg-slate-800/80 rounded-xl hover:bg-slate-700 cursor-pointer"
                title={showAlertDrawer ? 'Collapse Alert Drawer' : 'Expand Alert Drawer'}
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${showAlertDrawer ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Item Reorder Cards in Alert Drawer */}
          {showAlertDrawer && (
            <div className="mt-4 pt-4 border-t border-rose-500/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Inventory Low Stock Highlights */}
              {lowStockInventory.map(item => (
                <div key={item.id} className="p-3 bg-slate-950/80 rounded-2xl border border-rose-500/30 flex items-center justify-between text-xs gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                      <p className="font-extrabold text-white truncate">{item.name}</p>
                    </div>
                    <p className="text-[10px] text-rose-300 mt-0.5">
                      Stock: <strong className="text-white font-bold">{item.quantity} {item.unit}</strong> (Min: {item.minThreshold})
                    </p>
                  </div>

                  {canEdit && (
                    <button
                      onClick={() => handleRestockInventory(item.id, 20)}
                      className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded-lg shadow flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <RefreshCw className="w-3 h-3" /> +20 Units
                    </button>
                  )}
                </div>
              ))}

              {/* Pharmacy Medication Low Stock Highlights */}
              {lowStockMeds.map(med => {
                const stock = med.stockCount ?? 0;
                const minLvl = med.reorderLevel ?? 20;

                return (
                  <div key={med.id} className="p-3 bg-slate-950/80 rounded-2xl border border-amber-500/40 flex items-center justify-between text-xs gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <p className="font-extrabold text-white truncate">{med.name}</p>
                      </div>
                      <p className="text-[10px] text-amber-300 mt-0.5">
                        Stock: <strong className="text-white font-bold">{stock} units</strong> (Reorder: {minLvl})
                      </p>
                    </div>

                    {canEdit && (
                      <button
                        onClick={() => reorderStock && reorderStock(med.id, 50)}
                        className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold text-[10px] rounded-lg shadow flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <RefreshCw className="w-3 h-3" /> +50 Meds
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full md:w-auto overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('All')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'All' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" /> All Assets & Meds
          </button>

          <button
            onClick={() => setActiveTab('LowStock')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'LowStock' ? 'bg-rose-600 text-white shadow-md' : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Alerts</span>
            {totalLowStockCount > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] rounded-full bg-rose-500 text-white font-black">
                {totalLowStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('Medications')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'Medications' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Pill className="w-3.5 h-3.5" /> Medications
          </button>

          <button
            onClick={() => setActiveTab('Equipment')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'Equipment' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Machinery & Gear
          </button>

          <button
            onClick={() => setActiveTab('Maintenance')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'Maintenance' ? 'bg-cyan-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" /> Maintenance Needed
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search asset, medication, or wing..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* INVENTORY ASSET CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Render Inventory Items */}
        {filteredInventory.map(item => {
          const dept = departments.find(d => d.id === item.departmentId);
          const isLow = item.quantity <= item.minThreshold || item.status === 'Low Stock' || item.status === 'Critical';
          const isCritical = item.status === 'Critical' || item.quantity <= Math.ceil(item.minThreshold / 2);

          // Stock Percentage for visual capacity bar
          const maxCapacity = item.minThreshold * 2;
          const stockRatio = Math.min(100, Math.round((item.quantity / maxCapacity) * 100));

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-sm flex flex-col justify-between ${
                isCritical
                  ? 'border-2 border-rose-500/80 dark:border-rose-500/80 shadow-rose-500/10'
                  : isLow
                  ? 'border-2 border-amber-400/80 dark:border-amber-500/60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 truncate">
                    {item.category}
                  </span>

                  {/* COLOR-CODED BADGE */}
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] border flex items-center gap-1 ${getStatusBadgeClass(item.status, item.quantity, item.minThreshold)}`}>
                    {isCritical ? <AlertCircle className="w-3 h-3" /> : isLow ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    <span>{isCritical ? 'CRITICAL LOW' : isLow ? 'LOW STOCK' : item.status}</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{item.name}</span>
                </h3>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Allocated: <strong className="text-slate-700 dark:text-slate-300">{dept?.name || 'Main Hospital Wing'}</strong>
                </p>

                {/* Stock Quantity Gauge & Visual Capacity Bar */}
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Quantity Reserve</span>
                    <span className={`font-black ${isCritical ? 'text-rose-600 dark:text-rose-400' : isLow ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(8, stockRatio)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Min Safety Threshold: {item.minThreshold} {item.unit}</span>
                    <span>Last Serviced: {item.lastMaintenanceDate}</span>
                  </div>
                </div>
              </div>

              {/* Actions Dock */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
                {canEdit && (
                  <div className="flex items-center gap-1.5 w-full justify-between">
                    <button
                      onClick={() => handleRestockInventory(item.id, 10)}
                      className="px-3 py-1.5 text-xs font-bold bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 hover:bg-cyan-100 dark:hover:bg-cyan-900 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Restock +10
                    </button>

                    {item.status === 'Optimal' ? (
                      <button
                        onClick={() => updateInventoryCondition(item.id, 'Requires Maintenance')}
                        className="px-3 py-1.5 text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Wrench className="w-3.5 h-3.5" /> Maintenance
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
            </div>
          );
        })}

        {/* Render Low-Stock / Medication Pharmacy Items under Medications or All/LowStock tab */}
        {(activeTab === 'All' || activeTab === 'Medications' || activeTab === 'LowStock') && filteredMeds.map(med => {
          const stock = med.stockCount ?? 0;
          const minLvl = med.reorderLevel ?? 20;
          const isLow = stock <= minLvl;
          const isCritical = stock <= 10;

          return (
            <div
              key={`med-${med.id}`}
              className={`p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-sm flex flex-col justify-between ${
                isCritical
                  ? 'border-2 border-rose-500/80 dark:border-rose-500/80 shadow-rose-500/10'
                  : isLow
                  ? 'border-2 border-amber-400/80 dark:border-amber-500/60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3 gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                    <Pill className="w-3 h-3" /> Medication
                  </span>

                  {/* COLOR-CODED MEDICATION BADGE */}
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] border flex items-center gap-1 ${
                    isCritical
                      ? 'bg-rose-500 text-white dark:bg-rose-600 border-rose-600 shadow-sm animate-pulse font-extrabold'
                      : isLow
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-bold'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-semibold'
                  }`}>
                    {isCritical ? <AlertCircle className="w-3 h-3" /> : isLow ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    <span>{isCritical ? 'CRITICAL LOW' : isLow ? 'LOW STOCK' : 'Adequate'}</span>
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{med.name}</span>
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                  {med.category || 'Pharmaceutical Compound'} | Rack: <strong className="text-slate-700 dark:text-slate-300">{med.locationRack || 'Central Pharmacy'}</strong>
                </p>

                {/* Stock Quantity Gauge & Visual Capacity Bar */}
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Pharmacy Stock</span>
                    <span className={`font-black ${isCritical ? 'text-rose-600 dark:text-rose-400' : isLow ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {stock} units
                    </span>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(8, Math.round((stock / (minLvl * 2)) * 100)))}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                    <span>Reorder Level: {minLvl} units</span>
                    <span>Unit Price: ${med.unitPrice?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions Dock */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {canEdit && (
                  <button
                    onClick={() => reorderStock && reorderStock(med.id, 50)}
                    className="w-full py-2 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Restock +50 Medications
                  </button>
                )}
              </div>
            </div>
          );
        })}

      </div>

      {/* Register Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Register Hospital Asset / Machinery</h3>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Equipment / Asset Name</label>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Initial Quantity</label>
                  <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Min Reorder Threshold</label>
                  <input type="number" value={minThreshold} onChange={(e) => setMinThreshold(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
                </div>
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                Register Asset Record
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
