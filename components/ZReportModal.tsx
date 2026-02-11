"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Wallet, CheckCircle, AlertTriangle, Calculator, DollarSign } from 'lucide-react';
import { Spinner } from './Spinner';

export default function ZReportModal({ isOpen, onClose, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(true);
  const [actualCash, setActualCash] = useState("");
  const [notes, setNotes] = useState("");
  
  // System Totals
  const [totals, setTotals] = useState({
    cash: 0,
    tng: 0,
    card: 0,
    expected: 0
  });

  useEffect(() => {
    if (isOpen) {
      calculateTodaySales();
    }
  }, [isOpen]);

  const calculateTodaySales = async () => {
    setCalculating(true);
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch all sales for today
    const { data } = await supabase
      .from('sales')
      .select('total_amount, payment_method')
      .gte('created_at', today);

    if (data) {
      const cash = data.filter(s => s.payment_method === 'cash').reduce((acc, s) => acc + Number(s.total_amount), 0);
      const tng = data.filter(s => s.payment_method === 'tng').reduce((acc, s) => acc + Number(s.total_amount), 0);
      const card = data.filter(s => s.payment_method === 'card').reduce((acc, s) => acc + Number(s.total_amount), 0);
      
      setTotals({
        cash,
        tng,
        card,
        expected: cash // We only reconcile the physical cash
      });
    }
    setCalculating(false);
  };

  const handleClosing = async () => {
    const cashValue = parseFloat(actualCash);
    if (isNaN(cashValue)) return alert("Please enter a valid cash amount");
    
    setLoading(true);
    const variance = cashValue - totals.cash;

    const { error } = await supabase.from('daily_closings').insert([{
      expected_cash: totals.cash,
      actual_cash: cashValue,
      total_tng: totals.tng,
      total_card: totals.card,
      variance: variance,
      notes: notes
    }]);

    if (error) {
      if (error.code === '23505') alert("Closing already performed for today!");
      else alert(error.message);
    } else {
      onSuccess();
      onClose();
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
           <div className="flex items-center gap-3">
             <div className="bg-slate-900 p-2 rounded-xl text-white"><Calculator size={24}/></div>
             <h2 className="text-xl font-black text-slate-800 tracking-tighter uppercase italic">Shift Closing (Z-Report)</h2>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X/></button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto">
          {calculating ? (
            <div className="py-20 text-center space-y-3">
               <Spinner className="mx-auto text-blue-600" size={32} />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Analyzing Today's Ledger...</p>
            </div>
          ) : (
            <>
              {/* System totals readout */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                   <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Expected Cash</p>
                   <p className="text-2xl font-black text-blue-900">RM {totals.cash.toFixed(2)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">TNG/Card Total</p>
                   <p className="text-2xl font-black text-slate-800">RM {(totals.tng + totals.card).toFixed(2)}</p>
                </div>
              </div>

              {/* Input section */}
              <div className="space-y-4">
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                     <DollarSign size={12}/> Physical Cash in Drawer (RM)
                   </label>
                   <input 
                    autoFocus
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    className="w-full p-5 bg-gray-50 border-2 border-slate-100 rounded-2xl text-2xl font-black text-slate-900 focus:border-blue-500 outline-none transition-all shadow-inner"
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value)}
                   />
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Closing Notes / Discrepancy Reason</label>
                   <textarea 
                    className="w-full p-4 bg-gray-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-blue-500"
                    rows={2}
                    placeholder="e.g. Small change short RM0.50..."
                    onChange={(e) => setNotes(e.target.value)}
                   />
                </div>
              </div>

              {/* Live Variance readout */}
              {actualCash && (
                <div className={clsx(
                  "p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in",
                  (parseFloat(actualCash) - totals.cash) === 0 ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
                )}>
                  {(parseFloat(actualCash) - totals.cash) === 0 ? <CheckCircle size={20}/> : <AlertTriangle size={20}/>}
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Calculated Variance</p>
                    <p className="font-bold">RM {(parseFloat(actualCash) - totals.cash).toFixed(2)}</p>
                  </div>
                </div>
              )}
            </>
          )}

          <button 
            onClick={handleClosing}
            disabled={loading || calculating || !actualCash}
            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg flex justify-center items-center gap-3 hover:bg-slate-800 active:scale-95 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {loading ? <Spinner size={24} /> : <Wallet size={24}/>}
            {loading ? "SAVING..." : "COMMIT CLOSING & SYNC"}
          </button>
        </div>
      </div>
    </div>
  );
}