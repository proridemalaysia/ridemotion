"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserCircle, Shield, Edit3, Trash2, Search, UserPlus, Check, X } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function ManageUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('role');
    if (data) setUsers(data);
    setLoading(false);
  }

  const updateRole = async (userId: string, newRole: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    
    if (error) alert(error.message);
    else fetchUsers();
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure? This will permanently revoke this user's access.")) return;
    // Note: In a real app, you'd call a Supabase Auth Admin API to delete the actual user
    const { error } = await supabase.from('profiles').delete().eq('id', userId);
    if (error) alert(error.message);
    else fetchUsers();
  };

  const filtered = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">Manage Users</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Staff & Access Control</p>
        </div>
        <button className="bg-[#2563EB] text-white px-4 py-2 rounded-md text-[12px] font-bold uppercase flex items-center gap-2 hover:bg-blue-700 active:scale-95 transition-all shadow-sm">
           <UserPlus size={16} strokeWidth={2.5}/> Invite Staff
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/30">
          <div className="relative w-80">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search user by name or ID..." 
              className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-md text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Role / Permissions</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[12px]">
              {loading ? (
                <tr><td colSpan={4} className="py-20 text-center"><Spinner/></td></tr>
              ) : filtered.map(user => (
                <tr key={user.id} className="hover:bg-blue-50/20 transition-all group">
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400 border border-slate-200">
                           {user.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                           <div className="font-bold text-slate-800 uppercase tracking-tight">{user.full_name || 'New Staff'}</div>
                           <div className="text-[10px] text-slate-400 font-mono uppercase tracking-tighter truncate w-32">{user.id}</div>
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <select 
                        value={user.role} 
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        className={`px-2 py-1 rounded text-[10px] font-bold uppercase border outline-none ${
                           user.role === 'admin' ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
                        }`}
                     >
                        <option value="admin">Admin (Full Access)</option>
                        <option value="staff">Staff (Limited)</option>
                        <option value="customer">Customer (Shop Only)</option>
                     </select>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium italic">
                     {new Date(user.updated_at).toLocaleDateString('en-MY')}
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Edit3 size={16}/></button>
                        <button onClick={() => deleteUser(user.id)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}