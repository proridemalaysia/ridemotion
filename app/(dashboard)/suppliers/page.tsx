"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Plus, Phone, Mail, MapPin, Search, ExternalLink, Trash2, Building2 } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSuppliers();
  }, []);

  async function fetchSuppliers() {
    setLoading(true);
    const { data } = await supabase
      .from('suppliers')
      .select('*')
      .order('name', { ascending: true });
    
    if (data) setSuppliers(data);
    setLoading(false);
  }

  const deleteSupplier = async (id: string) => {
    if (confirm("Are you sure you want to remove this supplier?")) {
      await supabase.from('suppliers').delete().eq('id', id);
      fetchSuppliers();
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contact_person?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Supplier Hub</h2>
          <p className="text-slate-500 text-sm">Manage vendor relationships and contact directory</p>
        </div>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
          onClick={() => alert("Add Supplier Modal - Form Logic follows standard pattern")}
        >
          <Plus size={18} /> 
          Add Supplier
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Vendors</p>
            <h3 className="text-xl font-bold text-slate-800">{suppliers.length} Registered</h3>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search suppliers..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded text-sm outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Supplier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-400">
            <Spinner size={32} className="mx-auto mb-2" />
            <p className="text-sm">Fetching supplier directory...</p>
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-lg border border-dashed border-gray-300 text-gray-400">
            <p className="text-sm">No suppliers found.</p>
          </div>
        ) : filteredSuppliers.map((sup) => (
          <div key={sup.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded flex items-center justify-center">
                    <Users size={24} />
                 </div>
                 <button 
                  onClick={() => deleteSupplier(sup.id)} 
                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                 >
                    <Trash2 size={16} />
                 </button>
              </div>
              
              <h3 className="text-base font-bold text-slate-800 leading-tight mb-1">{sup.name}</h3>
              <span className="text-[10px] font-semibold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                {sup.category || 'General Supplier'}
              </span>

              <div className="mt-6 space-y-3">
                 <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Phone size={14} className="text-slate-300" /> {sup.phone || 'No phone recorded'}
                 </div>
                 <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail size={14} className="text-slate-300" /> {sup.email || 'No email recorded'}
                 </div>
                 <div className="flex items-start gap-3 text-sm text-slate-500">
                    <MapPin size={14} className="text-slate-300 shrink-0 mt-0.5" /> 
                    <span className="leading-snug">{sup.address || 'No address provided'}</span>
                 </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-50 flex justify-between items-center bg-gray-50/30">
               <div className="text-[11px] text-gray-400 font-medium">Contact: {sup.contact_person || 'N/A'}</div>
               <button className="text-blue-600 hover:text-blue-800 text-xs font-semibold flex items-center gap-1">
                  View History <ExternalLink size={12}/>
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}