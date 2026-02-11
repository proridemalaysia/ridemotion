"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Phone, Mail, MapPin, Search, ExternalLink, Trash2 } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    const { data } = await supabase.from('suppliers').select('*').order('name');
    if (data) setSuppliers(data);
    setLoading(false);
  }

  const deleteSupplier = async (id: string) => {
    if (confirm("Delete this supplier? All linked purchase history will remain but the link will be broken.")) {
      await supabase.from('suppliers').delete().eq('id', id);
      fetchSuppliers();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight italic uppercase">Supplier Hub</h2>
          <p className="text-slate-400 text-sm font-medium">Manage your global vendor contacts</p>
        </div>
        <button 
          className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black flex items-center gap-3 hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-100"
          onClick={() => alert("Add Supplier Modal - Follow the same pattern as Product Modal")}
        >
          <Plus size={24} /> ADD NEW SUPPLIER
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Spinner className="mx-auto" /></div>
        ) : suppliers.map((sup) => (
          <div key={sup.id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
            <div className="flex justify-between items-start mb-6">
               <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-400 shadow-lg">
                  <Users size={28} />
               </div>
               <button onClick={() => deleteSupplier(sup.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
               </button>
            </div>
            
            <h3 className="text-xl font-black text-slate-800 mb-1 tracking-tight">{sup.name}</h3>
            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg tracking-widest italic">
              {sup.category || 'General Supplier'}
            </span>

            <div className="mt-8 space-y-4">
               <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Phone size={16} className="text-slate-300" /> {sup.phone || 'No Phone'}
               </div>
               <div className="flex items-center gap-3 text-sm font-bold text-slate-600">
                  <Mail size={16} className="text-slate-300" /> {sup.email || 'No Email'}
               </div>
               <div className="flex items-center gap-3 text-sm font-bold text-slate-500 leading-relaxed">
                  <MapPin size={16} className="text-slate-300 shrink-0" /> {sup.address || 'No Address Provided'}
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact: {sup.contact_person}</div>
               <button className="text-blue-600 hover:underline flex items-center gap-1 text-xs font-bold">
                  Purchase History <ExternalLink size={12}/>
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}