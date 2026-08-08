import React from 'react';
import jsPDF from 'jspdf';
import { useHospital } from '../context/HospitalContext';
import { DollarSign, CreditCard, FileText, FileDown, CheckCircle2, Clock, Search } from 'lucide-react';
import { Invoice } from '../types';

export const BillingManager: React.FC = () => {
  const { invoices, openCheckoutModal, searchQuery, setSearchQuery } = useHospital();

  const filteredInvoices = invoices.filter(inv => {
    return inv.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const exportInvoicePDF = (inv: Invoice) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Smart Hospital Management System', 14, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL MEDICAL INVOICE & TAX RECEIPT', 14, 28);
    doc.line(14, 32, 196, 32);

    doc.setFontSize(10);
    doc.text(`Invoice No: ${inv.invoiceNumber}`, 14, 42);
    doc.text(`Invoice Date: ${inv.date}`, 14, 48);
    doc.text(`Payment Status: ${inv.paymentStatus.toUpperCase()}`, 14, 54);

    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT BILLING TO', 14, 66);
    doc.setFont('helvetica', 'normal');
    doc.text(`Patient Name: ${inv.patientName}`, 14, 72);
    doc.text(`Patient ID: ${inv.patientId}`, 14, 78);

    doc.setFont('helvetica', 'bold');
    doc.text('ITEMIZED MEDICAL CHARGES', 14, 90);
    doc.setFont('helvetica', 'normal');

    let y = 98;
    (inv.items || []).forEach((item, index) => {
      doc.text(`${index + 1}. ${item.description}`, 14, y);
      doc.text(`$${(item.amount ?? 0).toFixed(2)}`, 160, y, { align: 'right' });
      y += 8;
    });

    doc.line(14, y, 196, y);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL AMOUNT DUE:', 14, y);
    doc.text(`$${(inv.totalAmount ?? 0).toFixed(2)}`, 160, y, { align: 'right' });

    if (inv.paymentMethod) {
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.text(`Gateway Channel: ${inv.paymentMethod} (Transaction Ref: ${inv.transactionId || 'pay_rzp_mock'})`, 14, y);
    }

    doc.save(`Invoice_${inv.invoiceNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Hospital Billing & Payment Gateways
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Itemized invoices, Razorpay checkout, UPI integrations, and downloadable tax receipts.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search invoice number or patient name..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>

      {/* Mobile Card List */}
      <div className="block sm:hidden space-y-3">
        {filteredInvoices.map(inv => (
          <div key={inv.id} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-extrabold text-sm text-slate-900 dark:text-white">{inv.invoiceNumber}</p>
                <p className="text-[10px] text-slate-400">{inv.date}</p>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                inv.paymentStatus === 'Paid'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300'
              }`}>
                {inv.paymentStatus}
              </span>
            </div>

            <div className="text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Patient Name</span>
              <p className="font-bold text-slate-900 dark:text-white">{inv.patientName}</p>
            </div>

            <div className="text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Itemized Services</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                {(inv.items || []).map((it, idx) => (
                  <li key={idx} className="truncate">{it.description} — ${(it.amount ?? 0).toFixed(2)}</li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Amount</span>
                <span className="text-base font-black text-cyan-600 dark:text-cyan-400">${(inv.totalAmount ?? 0).toFixed(2)}</span>
              </div>

              {inv.paymentStatus === 'Unpaid' ? (
                <button
                  onClick={() => openCheckoutModal(inv)}
                  className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Pay Now
                </button>
              ) : (
                <button
                  onClick={() => exportInvoicePDF(inv)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5" /> PDF Receipt
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Invoices Table */}
      <div className="hidden sm:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Invoice No & Date</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Itemized Services</th>
                <th className="py-3 px-4">Total Bill</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</p>
                    <span className="text-[10px] text-slate-400">{inv.date}</span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {inv.patientName}
                  </td>

                  <td className="py-3.5 px-4">
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                      {(inv.items || []).map((it, idx) => (
                        <li key={idx} className="truncate max-w-xs">{it.description} — ${(it.amount ?? 0).toFixed(2)}</li>
                      ))}
                    </ul>
                  </td>

                  <td className="py-3.5 px-4 text-sm font-black text-cyan-600 dark:text-cyan-400">
                    ${(inv.totalAmount ?? 0).toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                      inv.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300'
                    }`}>
                      {inv.paymentStatus}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1">
                    {inv.paymentStatus === 'Unpaid' ? (
                      <button
                        onClick={() => openCheckoutModal(inv)}
                        className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center gap-1"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Pay via Razorpay
                      </button>
                    ) : (
                      <button
                        onClick={() => exportInvoicePDF(inv)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-cyan-700 dark:text-cyan-400 rounded-xl hover:bg-cyan-50 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <FileDown className="w-3.5 h-3.5" /> Download PDF Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
