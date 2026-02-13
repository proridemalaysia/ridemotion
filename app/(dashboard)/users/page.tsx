"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { UserCircle, Shield, Edit3, Trash2, Search, UserPlus } from 'lucide-react';
import { Spinner } from '@/components/Spinner';

export default function ManageUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('role');
    if (data) setUsers(data);
    setLoading(false);
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight uppercase italic">Manage Users</h2>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Access Control & Roles</p>
        </div>
        <button className="bg-[#2563EB] text-white px-4 py-2 rounded-md text-[12px] font-bold uppercase flex items-center gap-2">
           <UserPlus size={16}/> Add Staff
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-[12px]">
           <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
             <tr>
               <th className="px-6 py-4">User Name</th>
               <th className="px-6 py-4">Role</th>
               <th className="px-6 py-4">Created At</th>
               <th className="px-6 py-4 text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {loading ? (
               <tr><td colSpan={4} className="py-10 text-center"><Spinner/></td></tr>
             ) : users.map(user => (
               <tr key={user.id} className="hover:bg-gray-50 transition-all">
                  <td className="px-6 py-4">
                     <div className="font-bold text-slate-800 uppercase">{user.full_name || 'Guest'}</div>
                     <div className="text-[10px] text-slate-400 truncate w-40">{user.id}</div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase border ${
                        user.role === 'admin' ? "bg-red-50 text-red-600 border-red-100" : "bg-blue-50 text-blue-600 border-blue-100"
                     }`}>
                        {user.role}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">
                     {new Date(user.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                     <div className="flex justify-end gap-3">
                        <button className="text-slate-400 hover:text-blue-600"><Edit3 size={16}/></button>
                        <button className="text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                     </div>
                  </td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
}