"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserCircle, Shield, Edit3, Trash2, Search, Star, Save, X } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function ManageUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<any>(null);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('role');
    if (data) setUsers(data);
    setLoading(false);
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editingUser.full_name,
        role: editingUser.role,
        loyalty_points: editingUser.loyalty_points
      })
      .eq('id', editingUser.id);

    if (error) alert(error.message);
    else {
      setEditingUser(null);
      fetchUsers();
    }
  };

  return (
    <div className="p-8 space-y-6">
      <h2 className="text-2xl font-bold text-slate-800 uppercase italic">Staff & User Management</h2>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-slate-50 border-b text-slate-400 font-bold uppercase">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-center">Loyalty Points</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={4} className="py-10 text-center"><Spinner/></td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-blue-50/20">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-800 uppercase">{user.full_name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{user.id.slice(0,8)}...</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${user.role === 'admin' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{user.role}</span>
                </td>
                <td className="px-6 py-4 text-center font-bold text-slate-600">{user.loyalty_points || 0}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => setEditingUser(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-90"><Edit3 size={18}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <form onSubmit={handleUpdate} className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
               <h3 className="font-bold text-slate-800 uppercase">Override User Data</h3>
               <button type="button" onClick={() => setEditingUser(null)}><X size={20}/></button>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
              <input className="w-full p-3 bg-slate-50 border rounded-xl" value={editingUser.full_name} onChange={e => setEditingUser({...editingUser, full_name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Role</label>
                  <select className="w-full p-3 bg-slate-50 border rounded-xl" value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value})}>
                     <option value="customer">customer</option>
                     <option value="staff">staff</option>
                     <option value="admin">admin</option>
                  </select>
               </div>
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Points</label>
                  <input type="number" className="w-full p-3 bg-slate-50 border rounded-xl" value={editingUser.loyalty_points} onChange={e => setEditingUser({...editingUser, loyalty_points: parseInt(e.target.value)})} />
               </div>
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"><Save size={18}/> Commit Overrides</button>
          </form>
        </div>
      )}
    </div>
  );
}