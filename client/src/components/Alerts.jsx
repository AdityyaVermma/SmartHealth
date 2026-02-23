import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldCheck, Send, AlertCircle, AlertOctagon, Search, Filter, Bell, FileText, Check, Mail, MessageSquare, Users, Trash2, X, Plus, Activity, ChevronRight, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import alertImage from '../assets/alert.jpg';

const Alerts = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterLevel, setFilterLevel] = useState('all');
    const [activeTab, setActiveTab] = useState('active'); // 'active' | 'pending' | 'contacts'
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Contact Management State

    const [showContactModal, setShowContactModal] = useState(false);
    const [contactForm, setContactForm] = useState({
        name: '',
        type: 'email', // email only
        contactsString: ''
    });

    // Alert Form State
    const [alertForm, setAlertForm] = useState({
        location: '',
        message: '',
        level: 'medium',
        channels: { sms: true, email: true },
        targetAudience: 'affected_area',
        manualPhoneNumbers: '',
        manualEmails: '',
        targetGroups: []
    });

    // Approval Modal State
    const [approvingAlert, setApprovingAlert] = useState(null); // { id, location }
    const [approvalConfig, setApprovalConfig] = useState({
        channels: { sms: true, email: true },
        targetAudience: 'affected_area',
        manualPhoneNumbers: '',
        manualEmails: '',
        targetGroups: []
    });

    // Contact Groups State
    const [contactGroups, setContactGroups] = useState([]);

    const [submitting, setSubmitting] = useState(false);
    const { token, user } = useAuth();

    const isAdmin = user?.role === 'admin' || user?.role === 'national_admin';
    const isHealthWorker = user?.role === 'health_worker';

    const alertLevels = {
        low: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', label: 'Advisory', icon: AlertCircle, desc: 'Minor health updates' },
        medium: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Warning', icon: AlertTriangle, desc: 'Potential threats pending' },
        high: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', label: 'Urgent', icon: AlertOctagon, desc: 'Immediate action required' },
        critical: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', label: 'Critical', icon: AlertOctagon, desc: 'Severe outbreak alert' }
    };

    useEffect(() => {
        if (token && (isAdmin || isHealthWorker)) {
            fetch(`${API_URL}/contacts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => {
                    if (!res.ok) throw new Error('Unsuccessful response');
                    return res.json();
                })
                .then(data => {
                    if (Array.isArray(data)) {
                        setContactGroups(data);
                    } else {
                        setContactGroups([]);
                    }
                })
                .catch(err => {
                    console.error('Failed to fetch contact groups', err);
                    setContactGroups([]);
                });
        }
    }, [token, isAdmin, isHealthWorker]);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const res = await fetch(`${API_URL}/api/alerts`, { headers });

                if (!res.ok) throw new Error('Failed to fetch alerts');

                const data = await res.json();
                // Normalize data from API
                const formattedAlerts = data.map(alert => ({
                    ...alert,
                    level: alert.level ? alert.level.toLowerCase() : 'medium',
                    status: alert.status || 'approved', // Default to approved for old alerts
                    createdAt: alert.createdAt
                }));

                setAlerts(formattedAlerts);
            } catch (err) {
                console.error('Error fetching alerts:', err);
                if (alerts.length === 0) setAlerts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, [token]);

    const handleSubmitAlert = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        // Convert channels object to array
        const selectedChannels = Object.keys(alertForm.channels).filter(k => alertForm.channels[k]);

        try {
            const res = await fetch(`${API_URL}/api/alerts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    location: alertForm.location,
                    message: alertForm.message,
                    level: alertForm.level,
                    channels: selectedChannels,
                    targetAudience: alertForm.targetAudience,
                    manualPhoneNumbers: [],
                    manualEmails: [],
                    targetGroups: alertForm.targetGroups
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create alert');
            }

            const newAlert = await res.json();
            const formattedAlert = {
                ...newAlert,
                level: newAlert.level.toLowerCase(),
                status: newAlert.status || (isAdmin ? 'approved' : 'pending')
            };

            setAlerts([formattedAlert, ...alerts]);
            setAlertForm({
                location: '',
                message: '',
                level: 'medium',
                channels: { sms: true, email: true },
                targetAudience: 'affected_area',
                manualPhoneNumbers: '',
                manualEmails: '',
                targetGroups: []
            });
            setShowCreateForm(false);

            if (isAdmin) {
                alert(`Alert Broadcasted via ${selectedChannels.join(' & ').toUpperCase()} successfully!`);
            } else {
                alert('Alert request submitted for approval!');
            }
        } catch (err) {
            console.error('Error creating alert:', err);
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmApproval = async () => {
        if (!approvingAlert) return;
        setSubmitting(true);

        const selectedChannels = Object.keys(approvalConfig.channels).filter(k => approvalConfig.channels[k]);

        try {
            const res = await fetch(`${API_URL}/api/alerts/${approvingAlert.id}/approve`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    channels: selectedChannels,
                    targetAudience: approvalConfig.targetAudience,
                    manualPhoneNumbers: [],
                    manualEmails: [],
                    targetGroups: approvalConfig.targetGroups
                })
            });

            if (!res.ok) throw new Error('Failed to approve alert');

            const updatedAlert = await res.json();
            setAlerts(alerts.map(a => a._id === approvingAlert.id || a.id === approvingAlert.id ? { ...a, status: 'approved' } : a));

            alert(`Verified! Broadcasting to citizens via ${selectedChannels.length ? selectedChannels.join(', ') : 'Notification only'}.`);
            setApprovingAlert(null);
        } catch (err) {
            console.error('Error approving alert:', err);
            alert('Failed to approve alert');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteAlert = async (id) => {
        if (!window.confirm('Are you sure you want to delete this alert?')) return;
        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/alerts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Failed to delete alert');

            setAlerts(alerts.filter(a => a._id !== id && a.id !== id));
            alert('Alert deleted successfully');
        } catch (err) {
            console.error('Error deleting alert:', err);
            alert('Failed to delete alert');
        } finally {
            setSubmitting(false);
        }
    };

    const handleResolveAlert = async (id) => {
        if (!window.confirm('Are you sure you want to resolve this alert?')) return;

        try {
            const res = await fetch(`${API_URL}/api/alerts/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: false })
            });

            if (!res.ok) throw new Error('Failed to resolve alert');

            setAlerts(alerts.filter(a => a._id !== id && a.id !== id));
            alert('Alert resolved successfully');
        } catch (err) {
            console.error('Error resolving alert:', err);
            alert('Failed to resolve alert');
        }
    };

    const handleCreateContactGroup = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const contactsList = contactForm.contactsString.split(',').map(s => s.trim()).filter(Boolean);

            const res = await fetch(`${API_URL}api/contacts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: contactForm.name,
                    type: contactForm.type,
                    contacts: contactsList
                })
            });

            if (!res.ok) throw new Error('Failed to create group');

            const newGroup = await res.json();
            setContactGroups([...contactGroups, newGroup]);
            setShowContactModal(false);
            setContactForm({ name: '', type: 'email', contactsString: '' });
            alert('Contact Group Created!');
        } catch (error) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteContactGroup = async (id) => {
        if (!window.confirm('Are you sure you want to delete this group?')) return;
        try {
            const res = await fetch(`${API_URL}/contacts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setContactGroups(contactGroups.filter(g => g._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete group', error);
        }
    };

    // Filter Logic
    const filteredAlerts = alerts.filter(alert => {
        // Tab Filter
        const isPending = alert.status === 'pending';
        // Admin: Active shows approved, Pending shows pending

        if (activeTab === 'active') {
            const isApproved = !isPending;
            const isMyPending = isPending && user && alert.createdBy && (alert.createdBy._id === user.id || alert.createdBy._id === user._id || alert.createdBy === user.id);
            return isApproved || isMyPending;
        }
        if (activeTab === 'pending') {
            return isPending;
        }

        return true;
    });

    // Apply other filters to the subset
    const displayedAlerts = filteredAlerts.filter(alert => {
        const matchesLevel = filterLevel === 'all' || alert.level === filterLevel;
        const matchesSearch = alert.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.message?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLevel && matchesSearch;
    });

    const getLevelStyle = (level) => {
        switch (level?.toLowerCase()) {
            case 'low': return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 100%)', label: 'Advisory', icon: AlertCircle };
            case 'medium': return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0) 100%)', label: 'Warning', icon: AlertTriangle };
            case 'high': return { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', border: '#f97316', gradient: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2) 0%, rgba(249, 115, 22, 0) 100%)', label: 'High Priority', icon: AlertOctagon };
            case 'critical': return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.05) 100%)', label: 'Critical Alert', icon: AlertTriangle, shadow: '0 0 20px rgba(239, 68, 68, 0.3)' };
            default: return { color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)', border: '#64748b', gradient: 'none', label: 'Notice', icon: Bell };
        }
    };

    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: '1.5rem' }}>
            <motion.div
                animate={{ scale: [1, 1.2, 1], boxShadow: ['0 0 0px var(--primary)', '0 0 20px var(--primary)', '0 0 0px var(--primary)'] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ padding: '2rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', backdropFilter: 'blur(10px)' }}>
                <Bell size={48} color="var(--primary)" />
            </motion.div>
            <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem', fontWeight: 300 }}>Syncing National Alert Network...</h3>
        </div>
    );

    return (
        <div className="container" style={{ maxWidth: '1600px', padding: '0 2rem' }}>

            {/* --- HERO DASHBOARD SECTION --- */}
            <header style={{ position: 'relative', borderRadius: '2.5rem', overflow: 'hidden', marginBottom: '3rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', minHeight: '250px' }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                    <img src={alertImage} alt="Alert Network" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4) saturate(1.2)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 50%, rgba(15, 23, 42, 0.4) 100%)' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.2), transparent 40%)' }} />
                </div>

                <div style={{ position: 'relative', zIndex: 10, padding: '2.5rem', display: 'grid', gridTemplateColumns: '1fr auto', gap: '4rem', alignItems: 'center', height: '100%' }}>
                    <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '2rem', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem', color: '#34d399', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }} />
                            LIVE SYSTEM STATUS: ONLINE
                        </div>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: '1rem', letterSpacing: '-0.03em' }}>
                            Rapid Response <br />
                            <span style={{ background: 'linear-gradient(to right, #34d399, #6ee7b7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Alert Network
                            </span>
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: '#94a3b8', maxWidth: '600px', lineHeight: 1.6 }}>
                            Real-time epidemiological surveillance and emergency broadcast system for North East India.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}
                    >
                        {[
                            { label: 'Active Alerts', value: alerts.filter(a => !a.status || a.status === 'approved').length, color: '#f8fafc', icon: Activity },
                            { label: 'Critical Zones', value: alerts.filter(a => a.level === 'critical').length, color: '#fca5a5', icon: AlertOctagon },
                            { label: 'Broadcasts', value: alerts.length, color: '#cbd5e1', icon: Send },
                            { label: 'Groups', value: contactGroups?.length || 0, color: '#cbd5e1', icon: Users }
                        ].map((stat, i) => (
                            <div key={i} className="glass-panel" style={{ padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', borderRadius: '1.5rem', minWidth: '160px', transition: 'transform 0.3s ease' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                                    <stat.icon size={20} color={stat.color} style={{ opacity: 0.7 }} />
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </header>

            {/* --- CONTROLS BAR --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>

                {/* TABS (Admin Only) */}
                {(isAdmin || isHealthWorker) ? (
                    <div style={{ background: 'var(--bg-card)', padding: '0.5rem', borderRadius: '1rem', display: 'flex', gap: '0.5rem', border: '1px solid var(--border-color)', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        {[
                            { id: 'active', label: 'Live Broadcasts', icon: Send },
                            { id: 'pending', label: 'Pending Review', icon: FileText, count: alerts.filter(a => a.status === 'pending').length },
                            { id: 'contacts', label: 'Pulse Groups', icon: Users }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '0.75rem',
                                    border: 'none',
                                    background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                                    color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem'
                                }}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                                {tab.count > 0 && <span style={{ background: '#ef4444', color: 'white', fontSize: '0.75rem', padding: '0.1rem 0.5rem', borderRadius: '1rem' }}>{tab.count}</span>}
                            </button>
                        ))}
                    </div>
                ) : <div />}

                {/* SEARCH & FILTERS */}
                {activeTab !== 'contacts' && (
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search alerts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    padding: '0.75rem 1rem 0.75rem 3rem',
                                    borderRadius: '2rem',
                                    border: '1px solid var(--border-color)',
                                    background: 'var(--bg-glass)',
                                    color: 'var(--text-main)',
                                    outline: 'none',
                                    minWidth: '250px'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {['all', 'critical', 'medium'].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setFilterLevel(level)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '2rem',
                                        border: filterLevel === level ? `1px solid ${level === 'critical' ? '#ef4444' : 'var(--primary)'}` : '1px solid var(--border-color)',
                                        background: filterLevel === level ? (level === 'critical' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)') : 'transparent',
                                        color: filterLevel === level ? (level === 'critical' ? '#ef4444' : 'var(--primary)') : 'var(--text-muted)',
                                        cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize'
                                    }}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>

                        {(isAdmin || isHealthWorker) && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowCreateForm(!showCreateForm)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '2rem',
                                    background: 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.4)'
                                }}
                            >
                                <Plus size={20} />
                                {showCreateForm ? 'Cancel Operation' : 'New Broadcast'}
                            </motion.button>
                        )}
                    </div>
                )}
            </div>

            {/* --- CREATE FORM (EXPANDABLE) --- */}
            <AnimatePresence>
                {showCreateForm && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', marginBottom: '3rem' }}
                    >
                        <div className="glass-panel" style={{ padding: '3rem', borderRadius: '2rem', border: '1px solid var(--primary)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(0,0,0,0) 100%)' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '3rem' }}>
                                <div>
                                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--text-heading)' }}>
                                        Broadcast <br /> Center
                                    </h2>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: 1.6 }}>
                                        Initialize a new alert aimed at specific zones. <br />
                                        <span style={{ color: '#ef4444' }}>Ensure all details, specifically the urgency level, are verified before submission.</span>
                                    </p>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ padding: '1rem', background: 'var(--bg-card)', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.8rem', borderRadius: '0.8rem' }}><CheckCircle color="var(--primary)" size={24} /></div>
                                            <div>
                                                <div style={{ fontWeight: 700 }}>Verification</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Admin approval required for public release.</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmitAlert} style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '1.5rem', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-main)', padding: '0.5rem', borderRadius: '1rem' }}>
                                        {Object.entries(alertLevels).map(([key, config]) => (
                                            <div
                                                key={key}
                                                onClick={() => setAlertForm({ ...alertForm, level: key })}
                                                style={{
                                                    padding: '1rem',
                                                    borderRadius: '0.8rem',
                                                    background: alertForm.level === key ? config.bg : 'transparent',
                                                    border: alertForm.level === key ? `1px solid ${config.color}` : '1px solid transparent',
                                                    cursor: 'pointer',
                                                    textAlign: 'center',
                                                    transition: 'all 0.2s ease',
                                                    opacity: alertForm.level === key ? 1 : 0.6
                                                }}
                                            >
                                                <config.icon size={20} color={config.color} style={{ margin: '0 auto 0.5rem' }} />
                                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: alertForm.level === key ? config.color : 'var(--text-muted)' }}>{config.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <input type="text" value={alertForm.location} onChange={e => setAlertForm({ ...alertForm, location: e.target.value })} placeholder="Target Location (e.g., Guwahati, Kamrup)" className="form-input" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', background: 'var(--bg-main)' }} required />
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <textarea value={alertForm.message} onChange={e => setAlertForm({ ...alertForm, message: e.target.value })} placeholder="Enter detailed alert message, instructions, and precautions..." rows="4" className="form-textarea" style={{ width: '100%', padding: '1rem', fontSize: '1rem', background: 'var(--bg-main)' }} required />
                                    </div>

                                    {isAdmin && (
                                        <div style={{ marginBottom: '2rem' }}>
                                            <label className="form-label" style={{ marginBottom: '1rem', display: 'block', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Broadcast Channels & Groups</label>

                                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                                <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1rem', background: 'var(--bg-main)', borderRadius: '0.8rem', cursor: 'pointer', border: '1px solid var(--border-color)' }}>
                                                    <input type="checkbox" checked={alertForm.channels.email} onChange={e => setAlertForm({ ...alertForm, channels: { ...alertForm.channels, email: e.target.checked } })} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                                                    <Mail size={18} /> Official Email
                                                </label>
                                            </div>

                                            {contactGroups.length > 0 && (
                                                <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: '0.8rem', border: '1px solid var(--border-color)' }}>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>Target Specific Pulse Groups:</div>
                                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                        {contactGroups.map(group => (
                                                            <label key={group._id} style={{
                                                                display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                                padding: '0.4rem 0.8rem',
                                                                borderRadius: '2rem',
                                                                background: alertForm.targetGroups.includes(group._id) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                                                                border: alertForm.targetGroups.includes(group._id) ? '1px solid #10b981' : '1px solid transparent',
                                                                cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem'
                                                            }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={alertForm.targetGroups.includes(group._id)}
                                                                    onChange={e => {
                                                                        const newGroups = e.target.checked
                                                                            ? [...alertForm.targetGroups, group._id]
                                                                            : alertForm.targetGroups.filter(id => id !== group._id);
                                                                        setAlertForm({ ...alertForm, targetGroups: newGroups });
                                                                    }}
                                                                    style={{ display: 'none' }}
                                                                />
                                                                <Users size={14} color={alertForm.targetGroups.includes(group._id) ? '#10b981' : 'var(--text-muted)'} />
                                                                <span style={{ color: alertForm.targetGroups.includes(group._id) ? '#10b981' : 'var(--text-muted)' }}>{group.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', borderRadius: '1rem', fontWeight: 700 }} disabled={submitting}>
                                        {submitting ? 'Initializing...' : 'Initialize Broadcast'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MAIN CONTENT AREA --- */}
            {activeTab === 'contacts' ? (
                // --- CONTACTS MANAGEMENT UI ---
                <div style={{ animation: 'fadeIn 0.5s ease' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-heading)' }}>Distribution Groups</h2>
                        <button onClick={() => setShowContactModal(true)} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '0.8rem 1.5rem', borderRadius: '1rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Plus size={18} /> New Group
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
                        {contactGroups.map((group, i) => (
                            <motion.div key={group._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-panel card" style={{ padding: '2rem', position: 'relative', borderLeft: '4px solid #3b82f6' }}>
                                <button onClick={() => handleDeleteContactGroup(group._id)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#ef4444', opacity: 0.5, cursor: 'pointer' }}><Trash2 size={18} /></button>

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ padding: '0.8rem', borderRadius: '1rem', background: 'rgba(59, 130, 246, 0.1)' }}><Users size={24} color="#3b82f6" /></div>
                                    <div>
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{group.name}</h4>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{group.type.toUpperCase()} LIST</span>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.8rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}><span>Recipients</span> <strong>{group.contacts.length}</strong></div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', opacity: 0.8, lineHeight: 1.5 }}>
                                        {group.contacts.slice(0, 3).join(', ')} {group.contacts.length > 3 && `+ ${group.contacts.length - 3} more`}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                        {contactGroups.length === 0 && (
                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: 'var(--text-muted)', border: '2px dashed var(--border-color)', borderRadius: '2rem' }}>
                                No distribution groups found. Create one to streamline alerts.
                            </div>
                        )}
                    </div>

                    {/* Contact Modal */}
                    <AnimatePresence>
                        {showContactModal && (
                            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backdropFilter: 'blur(5px)' }}>
                                <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-panel card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem', background: 'var(--bg-card)' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Create Distribution List</h2>
                                    <form onSubmit={handleCreateContactGroup}>
                                        <div style={{ marginBottom: '1rem' }}><label className="form-label">Group Name</label><input className="form-input" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} placeholder="e.g. Village Heads" required /></div>
                                        <div style={{ marginBottom: '1.5rem' }}><label className="form-label">Emails (Comma separated)</label><textarea className="form-input" rows="4" value={contactForm.contactsString} onChange={e => setContactForm({ ...contactForm, contactsString: e.target.value })} placeholder="email1@example.com, email2@example.com" required /></div>
                                        <div style={{ display: 'flex', gap: '1rem' }}>
                                            <button type="button" onClick={() => setShowContactModal(false)} className="btn" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                                            <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Create Group</button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            ) : (
                // --- ALERTS GRID UI ---
                <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {displayedAlerts.map((alert, i) => {
                        const style = getLevelStyle(alert.level);
                        const isPending = alert.status === 'pending';

                        return (
                            <motion.div
                                key={alert._id || i}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className="glass-panel"
                                style={{
                                    padding: '0',
                                    background: 'var(--bg-card)',
                                    border: `1px solid ${style.border}`,
                                    boxShadow: style.shadow || '0 10px 30px -10px rgba(0,0,0,0.3)',
                                    borderRadius: '1.5rem',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    display: 'flex', flexDirection: 'column'
                                }}
                            >
                                {/* Colored Header Gradient */}
                                <div style={{ height: '6px', width: '100%', background: style.color }} />
                                {alert.level === 'critical' && <div style={{ position: 'absolute', top: 0, right: 0, padding: '0.5rem 1rem', background: '#ef4444', color: 'white', fontSize: '0.7rem', fontWeight: 800, borderBottomLeftRadius: '1rem' }}>URGENT</div>}

                                <div style={{ padding: '1.25rem', flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                        <div style={{ padding: '0.6rem', borderRadius: '0.6rem', background: style.bg, color: style.color }}>
                                            <style.icon size={20} />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.2, margin: 0 }}>{alert.location}</h3>
                                            <span style={{ fontSize: '0.75rem', color: style.color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{style.label}</span>
                                        </div>
                                    </div>

                                    <p style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '1rem', opacity: 0.9 }}>
                                        {alert.message}
                                    </p>

                                    <div style={{ padding: '0.6rem', background: 'var(--bg-main)', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isPending ? '#fb923c' : '#10b981' }} />
                                            {isPending ? 'Pending Review' : 'Active Broadcast'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            {new Date(alert.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {(isAdmin || isHealthWorker) && (
                                    <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', background: 'rgba(0,0,0,0.02)' }}>
                                        {isPending && isAdmin ? (
                                            <>
                                                <button onClick={() => handleDeleteAlert(alert._id)} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.6rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', cursor: 'pointer', flex: 1, fontSize: '0.85rem' }}>Reject</button>
                                                <button onClick={() => setApprovingAlert({ id: alert._id, location: alert.location })} style={{ padding: '0.5rem 0.75rem', borderRadius: '0.6rem', background: '#10b981', color: 'white', border: 'none', cursor: 'pointer', flex: 2, fontWeight: 600, fontSize: '0.85rem' }}>Approve Broadcast</button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleResolveAlert(alert._id)} style={{ width: '100%', padding: '0.5rem', borderRadius: '0.6rem', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem' }}>Mark Resolved</button>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {displayedAlerts.length === 0 && activeTab !== 'contacts' && (
                <div style={{ textAlign: 'center', padding: '6rem 2rem', opacity: 0.7 }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-glass)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <ShieldCheck size={40} color="var(--text-muted)" />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>No Active Alerts found</h3>
                    <p style={{ color: 'var(--text-muted)' }}>System status is normal. No threats detected in this category.</p>
                </div>
            )}

            {/* Approval Modal (Admin) */}
            <AnimatePresence>
                {approvingAlert && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>
                        <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2.5rem', borderRadius: '2rem', background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                    <Send size={30} color="#34d399" />
                                </div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white' }}>Confirm Broadcast</h2>
                                <p style={{ color: '#94a3b8' }}>You are about to send an alert to <strong>{approvingAlert.location}</strong>.</p>
                            </div>

                            <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem', cursor: 'pointer' }}>
                                    <input type="checkbox" checked={approvalConfig.channels.email} onChange={(e) => setApprovalConfig({ ...approvalConfig, channels: { ...approvalConfig.channels, email: e.target.checked } })} style={{ width: '20px', height: '20px', accentColor: '#34d399' }} />
                                    <div><div style={{ fontWeight: 600, color: 'white' }}>Email Notification</div><div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Send to official health channels</div></div>
                                </label>

                                {contactGroups.length > 0 && (
                                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '1rem' }}>
                                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.8rem' }}>Target Pulse Groups:</div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                            {contactGroups.map(group => (
                                                <label key={group._id} style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                    padding: '0.4rem 0.8rem',
                                                    borderRadius: '2rem',
                                                    background: approvalConfig.targetGroups.includes(group._id) ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.05)',
                                                    border: approvalConfig.targetGroups.includes(group._id) ? '1px solid #34d399' : '1px solid transparent',
                                                    cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem'
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={approvalConfig.targetGroups.includes(group._id)}
                                                        onChange={e => {
                                                            const newGroups = e.target.checked
                                                                ? [...approvalConfig.targetGroups, group._id]
                                                                : approvalConfig.targetGroups.filter(id => id !== group._id);
                                                            setApprovalConfig({ ...approvalConfig, targetGroups: newGroups });
                                                        }}
                                                        style={{ display: 'none' }}
                                                    />
                                                    <Users size={14} color={approvalConfig.targetGroups.includes(group._id) ? '#34d399' : '#94a3b8'} />
                                                    <span style={{ color: approvalConfig.targetGroups.includes(group._id) ? '#34d399' : '#94a3b8' }}>{group.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <button onClick={() => setApprovingAlert(null)} style={{ padding: '1rem', borderRadius: '1rem', background: 'transparent', border: '1px solid #475569', color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                                <button onClick={handleConfirmApproval} disabled={submitting} style={{ padding: '1rem', borderRadius: '1rem', background: '#34d399', border: 'none', color: '#064e3b', cursor: 'pointer', fontWeight: 700 }}>{submitting ? 'Sending...' : 'Broadcast Now'}</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Alerts;
