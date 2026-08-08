import React, { useState } from 'react';
import { useHospital } from '../context/HospitalContext';
import { useAuth } from '../context/AuthContext';
import { Pill, AlertTriangle, Plus, Search, MapPin, DollarSign, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { PharmacyItem } from '../types';

export const PharmacyManager: React.FC = () => {
  const { pharmacyItems, pharmacy, addPharmacyItem, reorderStock, searchQuery, setSearchQuery } = useHospital();
  const { activeRole } = useAuth();

  const itemsList = pharmacyItems || pharmacy || [];

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState<'Antibiotics' | 'Analgesics' | 'Cardiology' | 'Diabetes' | 'Respiratory'>('Antibiotics');
  const [dosage, setDosage] = useState('500mg');
  const [stockQuantity, setStockQuantity] = useState(100);
  const [minReorderLevel, setMinReorderLevel] = useState(25);
  const [unitPrice, setUnitPrice] = useState(12.5);
  const [rackLocation, setRackLocation] = useState('Rack A-12');
  const [expiryDate, setExpiryDate] = useState('2027-12-31');

  const filteredItems = itemsList.filter((item: any) => {
    const itemName = item.name || '';
    const generic = item.genericName || item.sku || '';
    const matchesSearch = itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          generic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    await addPharmacyItem({
      name,
      genericName,
      category,
      dosage,
      stockQuantity: Number(stockQuantity),
      minReorderLevel: Number(minReorderLevel),
      unitPrice: Number(unitPrice),
      rackLocation,
      expiryDate,
      manufacturer: 'Global Pharma Inc'
    });
    setShowAddModal(false);
  };

  const canManage = activeRole === 'Super Admin' || activeRole === 'Hospital Admin' || activeRole === 'Pharmacist';

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Pharmacy Inventory & Automatic Reorder Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time medicine stock tracking, batch numbers, rack location lookup, and automated stock alerts.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine Batch</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search medicine name or generic compound..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800"
        >
          <option value="All">All Categories</option>
          <option value="Antibiotics">Antibiotics</option>
          <option value="Analgesics">Analgesics</option>
          <option value="Cardiology">Cardiology</option>
          <option value="Diabetes">Diabetes</option>
          <option value="Respiratory">Respiratory</option>
        </select>
      </div>

      {/* Mobile Card List */}
      <div className="block sm:hidden space-y-3">
        {filteredItems.map((item: any) => {
          const stock = item.stockQuantity ?? item.stockCount ?? 0;
          const minStock = item.minReorderLevel ?? item.reorderLevel ?? 0;
          const isLowStock = stock <= minStock;
          const rack = item.rackLocation || item.locationRack || 'Rack A-1';
          const generic = item.genericName || item.sku || 'Generic Formula';
          const price = Number(item.unitPrice || 0);

          return (
            <div key={item.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Pill className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{item.name}</p>
                    <span className="text-sm font-black text-slate-900 dark:text-white">${price.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic truncate">{generic}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Dosage / Category</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">{item.dosage || 'Standard'}</span>
                  <span className="text-[10px] text-slate-400">{item.category}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Rack Location</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {rack}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Current Stock</span>
                  <span className={`font-black text-sm ${isLowStock ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                    {stock} units
                  </span>
                  {isLowStock && (
                    <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                      LOW
                    </span>
                  )}
                </div>

                <button
                  onClick={() => reorderStock && reorderStock(item.id, 50)}
                  className="px-3 py-1.5 text-xs font-semibold bg-cyan-50 dark:bg-cyan-950 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-400 rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reorder
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Pharmacy Table */}
      <div className="hidden sm:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Medicine & Compound</th>
                <th className="py-3 px-4">Dosage / Category</th>
                <th className="py-3 px-4">Rack Location</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.map((item: any) => {
                const stock = item.stockQuantity ?? item.stockCount ?? 0;
                const minStock = item.minReorderLevel ?? item.reorderLevel ?? 0;
                const isLowStock = stock <= minStock;
                const rack = item.rackLocation || item.locationRack || 'Rack A-1';
                const generic = item.genericName || item.sku || 'Generic Formula';
                const price = Number(item.unitPrice || 0);

                return (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-300 flex items-center justify-center font-bold">
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{item.name}</p>
                          <p className="text-[11px] text-slate-400 italic">{generic}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      <span className="font-bold">{item.dosage || 'Standard'}</span>
                      <span className="block text-[11px] text-slate-400">{item.category}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-bold">{rack}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-black text-sm ${isLowStock ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                          {stock} units
                        </span>
                        {isLowStock && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 animate-pulse flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      ${price.toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {canManage && (
                        <button
                          onClick={() => reorderStock && reorderStock(item.id, 50)}
                          className="px-3 py-1.5 text-xs font-semibold bg-cyan-50 dark:bg-cyan-950 hover:bg-cyan-100 text-cyan-700 dark:text-cyan-400 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Restock +50</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl p-6 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Add Pharmacy Stock Batch</h3>

            <form onSubmit={handleCreateMedicine} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Brand Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Amoxicillin 500" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Generic Formula</label>
                <input type="text" value={genericName} onChange={(e) => setGenericName(e.target.value)} placeholder="Amoxicillin Trihydrate" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white">
                    <option value="Antibiotics">Antibiotics</option>
                    <option value="Analgesics">Analgesics</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Diabetes">Diabetes</option>
                    <option value="Respiratory">Respiratory</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Dosage Strength</label>
                  <input type="text" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="500 mg" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" required />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Quantity</label>
                  <input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Unit Price ($)</label>
                  <input type="number" step="0.01" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Rack Location</label>
                  <input type="text" value={rackLocation} onChange={(e) => setRackLocation(e.target.value)} placeholder="Rack A-12" className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white" />
                </div>
              </div>

              <button type="submit" className="w-full mt-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer">
                Save Medicine Batch
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
