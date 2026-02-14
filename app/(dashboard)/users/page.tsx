"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Shield, Edit3, Trash2, Search, Save, X, User } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function ManageUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('full_name');
    if (data) setUsers(data);
    setLoading(false);
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('profiles')
      .update(editingUser)
      .eq('id', editingUser.id);

    if (error) alert(error.message);
    else {
      setEditingUser(null);
      fetchUsers();
    }
  };

  const filtered = users.filter(u => u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800 uppercase italic">Staff & Member Database</h2>
        <div className="relative w-64">
           <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
           <input className="w-full pl-9 p-2 border rounded-xl text-xs outline-none focus:ring-1 focus:ring-blue-500" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-slate-50 border-b text-slate-400 font-bold uppercase tracking-widest">
            <tr><th className="px-6 py-4">User Details</th><th className="px-6 py-4">Access Role</th><th className="px-6 py-4">Wallet & Tax</th><th className="px-6 py-4 text-right">Action</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="py-20 text-center"><Spinner/></td></tr>
            ) : filtered.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center font-bold text-slate-400">{user.full_name?.charAt(0)}</div>
                    <div>
                        <div className="font-bold text-slate-800 uppercase">{user.full_name}</div>
                        <div className="text-[10px] text-slate-400 italic">{user.phone || 'No phone'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${user.role === 'admin' ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"}`}>{user.role}</span></td>
                <td className="px-6 py-4">
                  <div className="flex flex-col text-[10px] font-bold">
                    <span className="text-orange-600">Points: {user.loyalty_points || 0}</span>
                    <span className="text-slate-400 tracking-tighter">LTV: RM {Number(user.total_spent || 0).toFixed(2)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setEditingUser(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg active:scale-95 transition-all"><Edit3 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MASTER OVERRIDE MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleUpdate} className="bg-white rounded-[32px] p-8 w-full max-w-2xl shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b pb-4">
               <h3 className="font-bold text-slate-800 uppercase text-sm italic">Master Data Override: {editingUser.full_name}</h3>
               <button type="button" onClick={() => setEditingUser(null)} className="active:scale-95"><X size={24}/></button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-4">
                  <p className="text-[10px] font-bold text-blue-600 uppercase border-b border-blue-50 pb-1">Basic Identity</p>
                  <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Full Name</label><input className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold" value={editingUser.full_name} onChange={e => setEditingUser({...editingUser, full_name: e.target.value})} /></div>
                  <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Role</label>
                    <select className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                        <option value="customer">customer</option><option value="staff">staff</option><option value="admin">admin</option>
                    </select>
                  </div>
                  <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Phone</label><input className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold" value={editingUser.phone || ''} onChange={e => setEditingUser({...editingUser, phone: e.target.value})} /></div>
               </div>

               <div className="space-y-4">
                  <p className="text-[10px] font-bold text-orange-600 border-b border-orange-50 pb-1 uppercase">Financial & Tax</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Loyalty Points</label><input type="number" className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold" value={editingUser.loyalty_points || 0} onChange={e => setEditingUser({...editingUser, loyalty_points: parseInt(e.target.value)})} /></div>
                    <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Total Spent (RM)</label><input type="number" className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold" value={editingUser.total_spent || 0} onChange={e => setEditingUser({...editingUser, total_spent: parseFloat(e.target.value)})} /></div>
                  </div>
                  <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">TIN (LHDN)</label><input className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold" value={editingUser.tin || ''} onChange={e => setEditingUser({...editingUser, tin: e.target.value})} /></div>
                  <div><label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">BRN / NRIC</label><input className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold" value={editingUser.brn || ''} onChange={e => setEditingUser({...editingUser, brn: e.target.value})} /></div>
               </div>

               <div className="col-span-2">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Full Shipping Address</label>
                  <textarea rows={3} className="w-full p-3 bg-slate-50 border rounded-xl text-xs font-medium" value={editingUser.address || ''} onChange={e => setEditingUser({...editingUser, address: e.target.value})} />
               </div>
            </div>
            
            <button type="submit" className="w-full bg-[#020617] text-white py-4 rounded-2xl font-bold uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl hover:bg-slate-800"><Save size={18}/> Commit Overrides</button>
          </form>
        </div>
      )}
    </div>
  );
}