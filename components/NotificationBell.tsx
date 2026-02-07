'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    // Initial fetch and polling every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const markAsRead = async (id?: number) => {
        try {
            const body = id ? { id } : { markAllRead: true };
            const res = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                if (id) {
                    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
                    setUnreadCount(prev => Math.max(0, prev - 1));
                } else {
                    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                    setUnreadCount(0);
                }
            }
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const handleNotificationClick = async (notification: any) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }
        setIsOpen(false);
        if (notification.link) {
            router.push(notification.link);
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    padding: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#333'
                }}
                aria-label="Notifications"
            >
                <Bell size={24} strokeWidth={1.5} />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            style={{
                                position: 'absolute',
                                top: '0px',
                                right: '0px',
                                background: '#e74c3c',
                                color: '#fff',
                                borderRadius: '50%',
                                width: '18px',
                                height: '18px',
                                fontSize: '11px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold'
                            }}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: '40px',
                            right: '-10px',
                            width: '320px',
                            background: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                            zIndex: 1000,
                            overflow: 'hidden',
                            border: '1px solid #f0f0f0'
                        }}
                    >
                        <div style={{
                            padding: '15px',
                            borderBottom: '1px solid #f0f0f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#fafafa'
                        }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Notifications</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => markAsRead()}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        color: '#3498db',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    Tout marquer comme lu
                                </button>
                            )}
                        </div>

                        <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                            {notifications.length === 0 ? (
                                <div style={{ padding: '30px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                                    <Bell size={24} style={{ marginBottom: '10px', opacity: 0.3 }} />
                                    <p style={{ margin: 0 }}>Aucune notification</p>
                                </div>
                            ) : (
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    {notifications.map(notif => (
                                        <li
                                            key={notif.id}
                                            onClick={() => handleNotificationClick(notif)}
                                            style={{
                                                padding: '15px',
                                                borderBottom: '1px solid #f0f0f0',
                                                cursor: 'pointer',
                                                background: notif.isRead ? '#fff' : '#f0f9ff',
                                                transition: 'background 0.2s',
                                                position: 'relative'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = notif.isRead ? '#fff' : '#f0f9ff'}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                <div style={{
                                                    minWidth: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    background: notif.isRead ? 'transparent' : '#3498db',
                                                    marginTop: '6px'
                                                }} />
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: '0 0 4px', fontSize: '14px', color: '#333' }}>{notif.title}</h4>
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#666', lineHeight: '1.4' }}>{notif.message}</p>
                                                    <span style={{ fontSize: '10px', color: '#aaa', marginTop: '6px', display: 'block' }}>
                                                        {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
