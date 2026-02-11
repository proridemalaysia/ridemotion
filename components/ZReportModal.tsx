"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Wallet, CheckCircle, AlertTriangle, Calculator, DollarSign } from 'lucide-react';
import { Spinner } from './Spinner';
import { clsx } from 'clsx'; // Added missing import

interface ZReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ZReportModal({ isOpen, onClose, onSuccess }: ZReportModalProps) {
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(true);
  const [actualCash, setActualCash] = useState("");
  const [notes, setNotes] = useState("");
  
  // System Totals State
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
    // Get start of today in ISO format
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('sales')
      .select('total_amount, payment_method')
      .gte('created_at', today.toISOString());

    if (error) {
      console.error("Error calculating sales:", error);
    }

    if (data) {
      const cash = data.filter(s => s.payment_method === 'cash').reduce((acc, s) => acc + Number(s.total_amount), 0);
      const tng = data.filter(s => s.payment_method === 'tng').reduce((acc, s) => acc + Number(s.total_amount), 0);
      const card = data.filter(s => s.payment_method === 'card').reduce((acc, s) => acc + Number(s.total_amount), 0);
      
      setTotals({
        cash,
        tng,
        card,
        expected: cash 
      });
    }
    setCalculating(false);
  };

  const handleClosing = async () => {
    const cashValue = parseFloat(actualCash);
    if (isNaN(cashValue)) {
      alert("Please enter a valid cash amount");
      return;
    }
    
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
      if (error.code === '23505') {
        alert("A Z-Report has already been submitted for today.");
      } else {
        alert(error.message);
      }
    } else {
      onSuccess();
      onClose();
      setActualCash("");
      setNotes("");
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const currentVariance = actualCash ? (parseFloat(actualCash) - totals.cash) : 0;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in duration-300">
        
        {/* Modal Header */}
        <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
           <div className="flex items-center gap-4">
             <div className="bg-slate-900 p-3 rounded-2xl text-white shadow-lg shadow-slate-200">
               <Calculator size={24}/>
             </div>
             <div>
               <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase italic">Z-Report Closing</h2>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift End Reconciliation</p>
             </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-slate-400"><X size={24}/></button>
        </div>

        <div className="p-10 space-y-8 overflow-y-auto">
          {calculating ? (
            <div className="py-20 text-center space-y-4">
               <Spinner className="mx-auto text-blue-600" size={40} />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">Auditing Today's Ledger...</p>
            </div>
          ) : (
            <>
              {/* System totals readout */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-5 rounded-3xl border border-blue-100 shadow-sm">
                   <p className="text-[10px] font-black text-blue-400 uppercase mb-1 tracking-widest">System Expected Cash</p>
                   <p className="text-2xl font-black text-blue-900">RM {totals.cash.toFixed(2)}</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">Digital Payments</p>
                   <p className="text-2xl font-black text-slate-800">RM {(totals.tng + totals.card).toFixed(2)}</p>
                </div>
              </div>

              {/* Input section */}
              <div className="space-y-6">
                <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                     <DollarSign size={14} className="text-blue-600"/> Physical Cash Counted (RM)
                   </label>
                   <input 
                    autoFocus
                    type="number" 
                    step="0.01"
                    placeholder="0.00"
                    className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-3xl font-black text-slate-900 focus:border-blue-500 focus:bg-white outline-none transition-all shadow-inner"
                    value={actualCash}
                    onChange={(e) => setActualCash(e.target.value)}
                   />
                </div>
                
                <div>
                   <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3">Auditor's Notes</label>
                   <textarea 
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:border-blue-500 transition-all"
                    rows={2}
                    placeholder="Describe any reasons for discrepancy..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                   />
                </div>
              </div>

              {/* Variance Visual Feedback */}
              {actualCash && (
                <div className={clsx(
                  "p-5 rounded-3xl border-2 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 transition-all",
                  currentVariance === 0 ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                )}>
                  <div className={clsx(
                    "p-2 rounded-xl",
                    currentVariance === 0 ? "bg-green-200" : "bg-red-200"
                  )}>
                    {currentVariance === 0 ? <CheckCircle size={24}/> : <AlertTriangle size={24}/>}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Calculated Variance</p>
                    <p className="text-xl font-black italic">
                      {currentVariance === 0 ? "Perfectly Balanced" : `RM ${currentVariance.toFixed(2)}`}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          <button 
            onClick={handleClosing}
            disabled={loading || calculating || !actualCash}
            className="w-full bg-slate-900 text-white py-6 rounded-[24px] font-black text-lg flex justify-center items-center gap-3 hover:bg-slate-800 active:scale-95 transition-all shadow-2xl shadow-slate-300 disabled:opacity-30 disabled:active:scale-100"
          >
            {loading ? <Spinner size={24} /> : <Wallet size={24}/>}
            {loading ? "COMMITTING DATA..." : "FINALIZE & CLOSE SHIFT"}
          </button>
        </div>
      </div>
    </div>
  );
}