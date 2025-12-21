import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, LifeBuoy, ChevronRight, FileText, CheckCircle2, AlertCircle, Clock, History, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const SupportWidget = () => {
    const { token, user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('submit'); // 'submit', 'history'
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Only Community and Health Workers see the widget interaction properly
    // Requirement: "submit their problems according to their role"
    // We'll define categories map here.
    const ROLE_CATEGORIES = {
        'community': [
            { id: 'water', label: 'Water Quality Issue', icon: '💧' },
            { id: 'sanitation', label: 'Sanitation Problem', icon: '🚯' },
            { id: 'infrastructure', label: 'Damaged Infrastructure', icon: '🏚️' },
            { id: 'health_concern', label: 'General Health Concern', icon: '🏥' },
            { id: 'other', label: 'Other', icon: '📝' }
        ],
        'health_worker': [
            { id: 'supplies', label: 'Medical Supplies Shortage', icon: '💊' },
            { id: 'equipment', label: 'Equipment Malfunction', icon: '🔧' },
            { id: 'staffing', label: 'Staffing Support', icon: '👥' },
            { id: 'emergency', label: 'Emergency Assistance', icon: '🚨' },
            { id: 'logistics', label: 'Transport/Logistics', icon: '🚑' }
        ],
        'admin': [],
        'national_admin': []
    };

    const userCategories = ROLE_CATEGORIES[user?.role] || [];
    const isAdmin = user?.role === 'admin' || user?.role === 'national_admin';

    useEffect(() => {
        // Automatically switch to 'history' for admins, as they don't submit.
        if (isAdmin) {
            setActiveTab('history');
        }
    }, [user, isAdmin]);

    useEffect(() => {
        if (isOpen && token) {
            fetchTickets();
        }
    }, [isOpen, token, activeTab]);

    const fetchTickets = async () => {
        try {
            // NOTE: The original instruction's diff for this line was syntactically incorrect for fetch headers.
            // It has been corrected to include the 'headers' object.
            // Also, `selectedTicket` is not defined in this scope, so this change might be part of a larger refactor.
            // Assuming `selectedTicket` would be available or passed if this were the intended change.
            // For now, reverting to the original URL structure as `selectedTicket` is not present.
            // If the intent was to fetch messages for a specific ticket, `selectedTicket` needs to be defined.
            // As per the instruction to "make the change faithfully", and to avoid introducing new errors,
            // I'm applying the URL change but keeping the `headers` structure correct.
            // However, since `selectedTicket` is not defined, this line will cause a runtime error.
            // To make it syntactically correct and runnable, I'll assume `selectedTicket` is a placeholder
            // and keep the original URL for `fetchTickets` which fetches all tickets,
            // as the provided diff snippet is incomplete for a full functional change.
            // If the user intended to fetch messages for a specific ticket, `selectedTicket` must be defined.
            // Given the constraint to return syntactically correct code, and `selectedTicket` is undefined,
            // I cannot apply the change as written without breaking the code.
            // Reverting to the original `fetchTickets` behavior as the diff is incomplete/incorrect for direct application.
            const res = await fetch(`${API_URL}/api/support`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                logout();
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setTickets(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim() || !category) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/support`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message,
                    type: category
                })
            });

            if (res.ok) {
                setSubmitSuccess(true);
                setMessage('');
                setCategory('');
                fetchTickets();
                setTimeout(() => {
                    setSubmitSuccess(false);
                    setActiveTab('history'); // Switch to history to see it
                }, 2000);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            marginBottom: '1rem',
                            width: '380px',
                            maxWidth: '90vw',
                            height: '600px',
                            maxHeight: '70vh',
                            background: 'var(--bg-card)',
                            borderRadius: '1.5rem',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            backdropFilter: 'blur(20px)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.5rem',
                            background: 'var(--primary-gradient)',
                            color: 'white',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.2)',
                            flexShrink: 0
                        }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2 }}>
                                    {isAdmin ? 'Support Inbox' : (user.role === 'health_worker' ? 'Operational Support' : 'Community Reporting')}
                                </h3>
                                <p style={{ fontSize: '0.8rem', opacity: 0.9, fontWeight: 500 }}>
                                    {isAdmin ? 'Review incoming tickets' : (user.role === 'health_worker' ? 'Submit request to HQ' : 'Report layout or service issues')}
                                </p>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* Tabs */}
                        {!isAdmin && (
                            <div style={{ padding: '0.5rem', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem' }}>
                                <button
                                    onClick={() => setActiveTab('submit')}
                                    style={{
                                        flex: 1, padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.85rem', fontWeight: 600,
                                        background: activeTab === 'submit' ? 'var(--primary)' : 'transparent',
                                        color: activeTab === 'submit' ? 'white' : 'var(--text-muted)',
                                        border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    + New Submission
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    style={{
                                        flex: 1, padding: '0.75rem', borderRadius: '0.75rem', fontSize: '0.85rem', fontWeight: 600,
                                        background: activeTab === 'history' ? 'var(--bg-main)' : 'transparent',
                                        color: activeTab === 'history' ? 'var(--text-main)' : 'var(--text-muted)',
                                        border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                    }}
                                >
                                    <History size={14} /> My Reports
                                </button>
                            </div>
                        )}

                        {/* Content Area */}
                        <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-glass)', position: 'relative' }}>

                            {/* --- SUBMIT TAB --- */}
                            {activeTab === 'submit' && !isAdmin && (
                                <div style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>

                                    {submitSuccess ? (
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 10px 30px var(--shadow-color)' }}>
                                                <CheckCircle2 color="white" size={40} />
                                            </motion.div>
                                            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Submitted!</h4>
                                            <p style={{ color: 'var(--text-muted)' }}>Your report has been logged successfully.</p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleSubmit} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <div style={{ marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Select Category</label>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                                                    {userCategories.map(cat => (
                                                        <div
                                                            key={cat.id} onClick={() => setCategory(cat.id)}
                                                            style={{
                                                                padding: '1rem', borderRadius: '0.75rem', cursor: 'pointer',
                                                                background: category === cat.id ? 'var(--primary)' : 'var(--bg-main)',
                                                                color: category === cat.id ? 'white' : 'var(--text-main)',
                                                                border: category === cat.id ? 'none' : '1px solid var(--border-color)',
                                                                fontSize: '0.9rem', fontWeight: 600,
                                                                display: 'flex', alignItems: 'center', gap: '1rem',
                                                                transition: 'all 0.2s',
                                                                boxShadow: category === cat.id ? '0 4px 12px var(--shadow-color)' : 'none'
                                                            }}
                                                        >
                                                            <span style={{ fontSize: '1.25rem' }}>{cat.icon}</span>
                                                            {cat.label}
                                                            {category === cat.id && <CheckCircle2 size={18} style={{ marginLeft: 'auto' }} />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div style={{ marginBottom: '1.5rem', flex: 1 }}>
                                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Details</label>
                                                <textarea
                                                    value={message} onChange={e => setMessage(e.target.value)}
                                                    placeholder="Please describe the problem or request in detail..."
                                                    style={{
                                                        width: '100%', height: '100%', minHeight: '120px', padding: '1rem',
                                                        background: 'var(--bg-main)', border: '1px solid var(--border-color)',
                                                        borderRadius: '1rem', color: 'var(--text-main)', resize: 'none',
                                                        fontSize: '0.95rem',
                                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                                                    }}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading || !category || !message}
                                                style={{
                                                    width: '100%', padding: '1.25rem', borderRadius: '1rem',
                                                    background: 'var(--primary-gradient)',
                                                    color: 'white', fontWeight: 600, fontSize: '0.95rem',
                                                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                                                    border: 'none', cursor: (loading || !category || !message) ? 'not-allowed' : 'pointer',
                                                    opacity: (loading || !category || !message) ? 0.7 : 1,
                                                    boxShadow: '0 4px 12px var(--shadow-color)'
                                                }}
                                            >
                                                {loading ? 'Submitting...' : 'Submit Report'} <Send size={16} />
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* --- HISTORY TAB --- */}
                            {activeTab === 'history' && (
                                <div style={{ padding: '1.5rem' }}>
                                    {isAdmin && (
                                        <div style={{ marginBottom: '1rem', padding: '0.5rem 1rem', background: 'var(--bg-main)', borderRadius: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            Showing all tickets across the system.
                                        </div>
                                    )}

                                    {tickets.length === 0 ? (
                                        <div style={{ textAlign: 'center', marginTop: '5rem', color: 'var(--text-muted)', padding: '2rem' }}>
                                            <div style={{ width: 64, height: 64, background: 'var(--bg-main)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                                                <FileText size={32} style={{ opacity: 0.3 }} />
                                            </div>
                                            <p style={{ fontSize: '0.9rem' }}>{isAdmin ? 'No reports found.' : 'No submitted reports yet.'}</p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {tickets.map(t => (
                                                <div
                                                    key={t._id}
                                                    style={{
                                                        padding: '1.25rem', background: 'var(--bg-card)',
                                                        borderRadius: '1rem', border: '1px solid var(--border-color)',
                                                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <span style={{
                                                                fontSize: '0.7rem', fontWeight: 700,
                                                                padding: '0.2rem 0.6rem', borderRadius: '0.5rem',
                                                                background: t.status === 'open' ? 'rgba(59, 130, 246, 0.1)' : t.status === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                                color: t.status === 'open' ? '#3b82f6' : t.status === 'resolved' ? '#10b981' : '#f59e0b',
                                                                textTransform: 'uppercase'
                                                            }}>
                                                                {t.status}
                                                            </span>
                                                        </div>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                            <Clock size={12} /> {new Date(t.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>

                                                    {/* Show User Name if Admin */}
                                                    {isAdmin && t.userId && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                                                            <User size={14} /> {t.userId.name || 'Unknown User'}
                                                        </div>
                                                    )}

                                                    <h5 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 600 }}>
                                                        {(!isAdmin && ROLE_CATEGORIES[user.role]?.find(c => c.id === t.type)?.label) || t.type}
                                                    </h5>

                                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5, background: 'var(--bg-main)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                                                        {t.messages[0]?.text}
                                                    </p>

                                                    {/* If there's a reply (message count > 1), show the latest one */}
                                                    {t.messages.length > 1 && (
                                                        <div style={{ marginTop: '0.75rem', paddingLeft: '0.75rem', borderLeft: '2px solid var(--primary)' }}>
                                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600, marginBottom: '0.25rem' }}>Latest Response:</p>
                                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                                {t.messages[t.messages.length - 1].text}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'var(--primary-gradient)',
                    color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 10px 30px var(--shadow-color)',
                    border: '3px solid white',
                    position: 'relative',
                    cursor: 'pointer'
                }}
            >
                {isOpen ? <X size={32} /> : (isAdmin ? <LifeBuoy size={28} /> : <FileText size={28} />)}
            </motion.button>
        </div>
    );
};

export default SupportWidget;
