"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link'; // Import added
import { supabase } from '@/lib/supabase';
import { Bell, AlertTriangle, ShoppingBag, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    fetchNotifications();

    // 1. Listen for real-time notifications via Supabase Realtime
    const channel = supabase
      .channel('notifications-live')
      .on(
        'postgres_changes', 
        { event: 'INSERT', table: 'notifications' }, 
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          // Play a subtle notification sound
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
          audio.play().catch(() => {}); 
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setNotifications(data);
  }

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
    fetchNotifications();
  };

  const deleteNotification = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id);
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <div className="relative">
      {/* The Bell Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all relative group"
      >
        <Bell size={22} className={clsx(unreadCount > 0 && "animate-bounce")} />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)}></div>
          
          <div className="absolute right-0 mt-4 w-96 bg-white rounded-3xl shadow-2xl border border-slate-100 z-[110] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-5 border-b flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Alert Center</h3>
              <button 
                onClick={markAllRead} 
                className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-tighter"
              >
                Mark all read
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="p-10 text-center text-slate-400 italic text-xs font-medium">
                  No new alerts at this time.
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={clsx(
                      "p-4 flex gap-4 transition-colors", 
                      !n.is_read ? "bg-blue-50/40" : "bg-white"
                    )}
                  >
                    <div className={clsx(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                      n.type === 'low_stock' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                    )}>
                      {n.type === 'low_stock' ? <AlertTriangle size={18}/> : <ShoppingBag size={18}/>}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight truncate">{n.title}</p>
                        <button 
                          onClick={() => deleteNotification(n.id)} 
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={12}/>
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">{n.message}</p>
                      <p className="text-[9px] text-slate-300 font-bold uppercase mt-2 italic">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Link 
              href="/admin" 
              className="block p-4 text-center text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest border-t bg-gray-50/50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              View System Dashboard
            </Link>
          </div>
        </>
      )}
    </div>
  );
}