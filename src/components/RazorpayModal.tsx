import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { useHospital } from '../context/HospitalContext';
import { safeFetchJson } from '../utils/apiHelper';
import { CreditCard, ShieldCheck, X, CheckCircle2, Lock, Sparkles, Building2 } from 'lucide-react';

export const RazorpayModal: React.FC = () => {
  const { activeCheckoutInvoice, closeCheckoutModal, payInvoice } = useHospital();
  
  const [paymentMethod, setPaymentMethod] = useState<'Razorpay' | 'Stripe' | 'UPI'>('Razorpay');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [upiId, setUpiId] = useState('sophia@upi');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!activeCheckoutInvoice) return null;

  const handlePayNow = async () => {
    setProcessing(true);

    try {
      // Step 1: Create Razorpay Order
      const orderData = await safeFetchJson('/api/billing/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: activeCheckoutInvoice.id,
          amount: activeCheckoutInvoice.totalAmount
        })
      });

      // Simulate 1.2s gateway delay
      setTimeout(async () => {
        const success = await payInvoice(
          activeCheckoutInvoice.id,
          paymentMethod,
          `pay_rzp_${Date.now()}`
        );

        setProcessing(false);

        if (success) {
          setCompleted(true);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }, 1200);

    } catch (err) {
      console.error(err);
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 relative">
        
        <button
          onClick={closeCheckoutModal}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {!completed ? (
          <div>
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center font-bold">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  Razorpay Secure Checkout
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Invoice {activeCheckoutInvoice.invoiceNumber}
                </p>
              </div>
            </div>

            {/* Bill Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 mb-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-500 dark:text-slate-400">Patient:</span>
                <span className="font-bold text-slate-900 dark:text-white">{activeCheckoutInvoice.patientName}</span>
              </div>
              <div className="space-y-1 my-2 py-2 border-y border-slate-200 dark:border-slate-700 text-xs">
                {(activeCheckoutInvoice.items || []).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span className="truncate pr-2">{item.description}</span>
                    <span className="font-semibold">${(item.amount ?? 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between text-sm font-black text-cyan-600 dark:text-cyan-400 pt-1">
                <span>Total Amount Due:</span>
                <span className="text-lg">${(activeCheckoutInvoice.totalAmount ?? 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3 mb-6">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Select Gateway Method</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Razorpay', 'Stripe', 'UPI'] as const).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      paymentMethod === m
                        ? 'bg-cyan-50 dark:bg-cyan-950/50 border-cyan-500 text-cyan-600 dark:text-cyan-400 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {paymentMethod === 'UPI' ? (
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mt-2 mb-1">Enter VPA / UPI ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mt-2 mb-1">Card Details</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePayNow}
              disabled={processing}
              className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {processing ? (
                <span>Verifying Gateway Signature...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Pay ${(activeCheckoutInvoice.totalAmount ?? 0).toFixed(2)} via {paymentMethod}</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> 256-Bit SSL Encrypted Razorpay API Channel
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Payment Successful!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Transaction ID: <span className="font-mono text-cyan-600 dark:text-cyan-400">pay_rzp_{Date.now()}</span>
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-3">
              An itemized email receipt has been dispatched to {activeCheckoutInvoice.patientName}.
            </p>
            <button
              onClick={closeCheckoutModal}
              className="mt-6 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Close & Download Receipt
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
