import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldCheck, Send, AlertCircle, AlertOctagon, Search, Filter, Bell, FileText, Check, Mail, MessageSquare, Users, Trash2, X, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
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
        low: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', label: 'Advisory', icon: AlertCircle },
        medium: { color: '#fb923c', bg: 'rgba(251, 146, 60, 0.1)', label: 'Warning', icon: AlertTriangle },
        high: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', label: 'Urgent', icon: AlertOctagon },
        critical: { color: '#dc2626', bg: 'rgba(220, 38, 38, 0.15)', label: 'Critical', icon: AlertOctagon }
    };

    useEffect(() => {
        if (token && (isAdmin || isHealthWorker)) {
            fetch('http://localhost:5000/api/contacts', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(data => setContactGroups(data))
                .catch(err => console.error('Failed to fetch contact groups', err));
        }
    }, [token, isAdmin, isHealthWorker]);

    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const res = await fetch('http://localhost:5000/api/alerts', { headers });

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
            const res = await fetch('http://localhost:5000/api/alerts', {
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
            const res = await fetch(`http://localhost:5000/api/alerts/${approvingAlert.id}/approve`, {
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
            const res = await fetch(`http://localhost:5000/api/alerts/${id}`, {
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
            const res = await fetch(`http://localhost:5000/api/alerts/${id}`, {
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

            const res = await fetch('http://localhost:5000/api/contacts', {
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
            const res = await fetch(`http://localhost:5000/api/contacts/${id}`, {
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
        // Worker: Active shows approved, Pending shows THEIR pending (if we had userId check, but simplistic for now)

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

    if (loading) return <div className="loading">Loading alerts...</div>;

    return (
        <div className="container">
            <div style={{ position: 'relative', borderRadius: '1.5rem', overflow: 'hidden', marginBottom: '3rem', height: '250px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <img src={alertImage} alt="Alerts" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.6), transparent)', display: 'flex', alignItems: 'center', padding: '3rem' }}>
                    <div>
                        <h1 style={{ color: 'white', marginBottom: '0.5rem', fontSize: '2.5rem', fontWeight: 700 }}>Health Alerts</h1>
                        <p style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>
                            {activeTab === 'pending' ? 'Review & Approve Requested Alerts' : 'Real-time notifications for disease outbreaks'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Admin & Worker Tabs */}
            {(isAdmin || isHealthWorker) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={activeTab === 'active' ? 'btn btn-primary' : 'btn'}
                            style={{ background: activeTab === 'active' ? '' : 'transparent', border: 'none' }}
                        >
                            📢 Active Broadcasts
                        </button>
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={activeTab === 'pending' ? 'btn btn-primary' : 'btn'}
                            style={{ background: activeTab === 'pending' ? '' : 'transparent', border: 'none', display: 'flex', gap: '0.5rem' }}
                        >
                            ⏳ Pending Requests
                            {alerts.filter(a => a.status === 'pending').length > 0 && (
                                <span style={{ background: '#ef4444', color: 'white', borderRadius: '50%', padding: '0.1rem 0.5rem', fontSize: '0.7rem' }}>
                                    {alerts.filter(a => a.status === 'pending').length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('contacts')}
                            className={activeTab === 'contacts' ? 'btn btn-primary' : 'btn'}
                            style={{ background: activeTab === 'contacts' ? '' : 'transparent', border: 'none' }}
                        >
                            👥 Contact Groups
                        </button>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn"
                        style={{ padding: '0.5rem', background: 'transparent', color: 'var(--text-muted)' }}
                        title="Refresh Data"
                    >
                        🔄 Refresh
                    </button>
                </div>
            )}

            {/* HEADER & CREATE BUTTON (Hide in Contacts Tab) */}
            {activeTab !== 'contacts' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {activeTab === 'pending' ? 'Pending Validation' : 'Active Alerts'}
                    </h2>

                    {/* Create/Request Button - Only for Worker/Admin */}
                    {(isHealthWorker || isAdmin) && (
                        <motion.button
                            className="btn btn-primary"
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            {isHealthWorker ? <FileText size={18} /> : <AlertTriangle size={18} />}
                            {showCreateForm ? 'Cancel' : (isHealthWorker ? 'Request Alert' : 'Broadcast Alert')}
                        </motion.button>
                    )}
                </div>
            )}

            {/* RENDER CONTACT GROUPS MANAGEMENT */}
            {activeTab === 'contacts' && (
                <div className="fade-in">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Manage Contact Groups</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Create and manage recipient lists for broadcasts.</p>
                        </div>
                        <button
                            className="btn btn-primary"
                            onClick={() => setShowContactModal(true)}
                            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                            <Plus size={18} /> New Group
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {contactGroups.map(group => (
                            <div
                                key={group._id}
                                className="glass-panel card"
                                style={{ padding: '1.5rem', position: 'relative' }}
                            >
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                    <button
                                        onClick={() => handleDeleteContactGroup(group._id)}
                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Users size={20} color="#10b981" />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{group.name}</h3>
                                        <span className={`badge badge-${group.type === 'sms' ? 'warning' : group.type === 'email' ? 'info' : 'success'}`} style={{ fontSize: '0.7rem' }}>
                                            {group.type.toUpperCase()}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        <span>Recipients ({group.contacts.length})</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {group.contacts.slice(0, 3).map((c, i) => (
                                            <span key={i} style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                                                {c.length > 15 ? c.substring(0, 13) + '...' : c}
                                            </span>
                                        ))}
                                        {group.contacts.length > 3 && (
                                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                                                +{group.contacts.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CREATE GROUP MODAL */}
                    {showContactModal && (
                        <div style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1100,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                        }}>
                            <div className="glass-panel card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: '#1e293b' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>New Contact Group</h2>
                                    <button onClick={() => setShowContactModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleCreateContactGroup}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label className="form-label">Group Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            value={contactForm.name}
                                            onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                            placeholder="e.g., District Doctors"
                                            required
                                        />
                                    </div>
                                    <div style={{ marginBottom: '1rem', display: 'none' }}>
                                        <label className="form-label">Channel Type</label>
                                        <select
                                            className="form-input"
                                            value={contactForm.type}
                                            onChange={e => setContactForm({ ...contactForm, type: e.target.value })}
                                            disabled={true}
                                        >
                                            <option value="email">Email Only</option>
                                        </select>
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label className="form-label">Contacts List (Comma Separated)</label>
                                        <textarea
                                            className="form-input"
                                            value={contactForm.contactsString}
                                            onChange={e => setContactForm({ ...contactForm, contactsString: e.target.value })}
                                            placeholder="e.g., doctor@health.gov.in, nurse@clinic.com"
                                            rows={5}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        style={{ width: '100%' }}
                                        disabled={submitting}
                                    >
                                        {submitting ? 'Creating...' : 'Create Group'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CREATE FORM */}
            {showCreateForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel card"
                    style={{ padding: '2rem', marginBottom: '2rem', border: isHealthWorker ? '2px dashed #fb923c' : 'none' }}
                >
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {isHealthWorker ? 'Submit Alert Request' : 'Broadcast Public Alert'}
                    </h3>
                    {isHealthWorker && <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Request will be sent to National Administration for approval before broadcast.</p>}

                    <form onSubmit={handleSubmitAlert}>
                        <div className="form-group">
                            <label className="form-label">Risk Level</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                                {Object.entries(alertLevels).map(([key, config]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setAlertForm({ ...alertForm, level: key })}
                                        style={{
                                            padding: '0.75rem',
                                            background: alertForm.level === key ? config.bg : 'var(--bg-glass)',
                                            border: `2px solid ${alertForm.level === key ? config.color : 'var(--border-color)'}`,
                                            borderRadius: '0.5rem',
                                            color: alertForm.level === key ? config.color : 'var(--text-main)',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {config.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Location/Village</label>
                            <input
                                type="text"
                                className="form-input"
                                value={alertForm.location}
                                onChange={(e) => setAlertForm({ ...alertForm, location: e.target.value })}
                                placeholder="e.g., Guwahati"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Alert Message</label>
                            <textarea
                                className="form-textarea"
                                rows="4"
                                value={alertForm.message}
                                onChange={(e) => setAlertForm({ ...alertForm, message: e.target.value })}
                                placeholder="Describe the health alert..."
                                required
                            />
                        </div>

                        {/* ADMIN ONLY: BROADCAST OPTIONS */}
                        {isAdmin && (
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Send size={16} /> Broadcast Channels
                                </h4>
                                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', display: 'none' }}>
                                        <input
                                            type="checkbox"
                                            checked={alertForm.channels.sms}
                                            onChange={(e) => setAlertForm({ ...alertForm, channels: { ...alertForm.channels, sms: e.target.checked } })}
                                        />
                                        <MessageSquare size={16} color="#3b82f6" />
                                        SMS Citizens
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={alertForm.channels.email}
                                            onChange={(e) => setAlertForm({ ...alertForm, channels: { ...alertForm.channels, email: e.target.checked } })}
                                        />
                                        <Mail size={16} color="#f59e0b" />
                                        Email Officials
                                    </label>
                                </div>
                                <div style={{ marginTop: '1rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.9rem' }}>Target Audience</label>
                                    <select
                                        className="form-input"
                                        value={alertForm.targetAudience}
                                        onChange={(e) => setAlertForm({ ...alertForm, targetAudience: e.target.value })}
                                    >
                                        <option value="affected_area">📍 Residents of {alertForm.location || 'Affected Area'} Only</option>
                                        <option value="district">🏙️ Entire District</option>
                                        <option value="all">🌍 All Registered Citizens (National)</option>
                                    </select>
                                </div>

                                <div style={{ marginTop: '1rem' }}>
                                    <label className="form-label">Recipients & groups</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto', padding: '0.5rem', background: '#0f172a', borderRadius: '0.5rem' }}>
                                        {contactGroups.map(group => (
                                            <label
                                                key={group._id}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem',
                                                    background: alertForm.targetGroups.includes(group._id) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                                                    borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.8rem',
                                                    border: alertForm.targetGroups.includes(group._id) ? '1px solid #10b981' : '1px solid transparent'
                                                }}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={alertForm.targetGroups.includes(group._id)}
                                                    onChange={(e) => {
                                                        const newGroups = e.target.checked
                                                            ? [...alertForm.targetGroups, group._id]
                                                            : alertForm.targetGroups.filter(id => id !== group._id);
                                                        setAlertForm({ ...alertForm, targetGroups: newGroups });
                                                    }}
                                                    style={{ accentColor: '#10b981' }}
                                                />
                                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {group.name}
                                                </div>
                                            </label>
                                        ))}
                                        {contactGroups.length === 0 && (
                                            <div style={{ gridColumn: '1 / -1', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center' }}>
                                                No contact groups found. Create one in the Contacts tab.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={submitting}
                        >
                            {submitting ? 'Processing...' : (isHealthWorker ? 'Submit for Approval' : 'Broadcast Now')}
                        </button>
                    </form>
                </motion.div >
            )
            }

            {/* APPROVAL MODAL */}
            {
                approvingAlert && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            className="glass-panel card"
                            style={{ maxWidth: '500px', width: '100%', padding: '2rem', background: '#1e293b' }}
                        >
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <ShieldCheck size={24} color="#10b981" />
                                Confirm Broadcast
                            </h3>
                            <p style={{ marginBottom: '1.5rem', color: 'var(--text-muted)' }}>
                                You are approving an alert for <strong>{approvingAlert.location}</strong>. Select the channels to notify:
                            </p>

                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem', display: 'none' }}>
                                        <input
                                            type="checkbox"
                                            checked={approvalConfig.channels.sms}
                                            onChange={(e) => setApprovalConfig({ ...approvalConfig, channels: { ...approvalConfig.channels, sms: e.target.checked } })}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <MessageSquare size={18} color="#3b82f6" />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>SMS Broadcast</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Send text alerts to citizens</div>
                                            </div>
                                        </div>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={approvalConfig.channels.email}
                                            onChange={(e) => setApprovalConfig({ ...approvalConfig, channels: { ...approvalConfig.channels, email: e.target.checked } })}
                                        />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Mail size={18} color="#f59e0b" />
                                            <div>
                                                <div style={{ fontWeight: 600 }}>Email Broadcast</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Send detailed email reports</div>
                                            </div>
                                        </div>
                                    </label>

                                    <div style={{ marginTop: '1rem' }}>
                                        <label className="form-label" style={{ fontSize: '0.8rem' }}>Recipients & Groups</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.3)', borderRadius: '0.5rem' }}>
                                            {contactGroups.map(group => (
                                                <label
                                                    key={group._id}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem',
                                                        background: approvalConfig.targetGroups.includes(group._id) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                                                        borderRadius: '0.3rem', cursor: 'pointer', fontSize: '0.8rem',
                                                        border: approvalConfig.targetGroups.includes(group._id) ? '1px solid #10b981' : '1px solid transparent'
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={approvalConfig.targetGroups.includes(group._id)}
                                                        onChange={(e) => {
                                                            const newGroups = e.target.checked
                                                                ? [...approvalConfig.targetGroups, group._id]
                                                                : approvalConfig.targetGroups.filter(id => id !== group._id);
                                                            setApprovalConfig({ ...approvalConfig, targetGroups: newGroups });
                                                        }}
                                                        style={{ accentColor: '#10b981' }}
                                                    />
                                                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {group.name}
                                                    </div>
                                                </label>
                                            ))}
                                            {contactGroups.length === 0 && (
                                                <div style={{ gridColumn: '1 / -1', color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', textAlign: 'center' }}>
                                                    No contact groups found.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '1.5rem' }}>
                                    <label className="form-label" style={{ fontSize: '0.9rem' }}>Target Audience</label>
                                    <select
                                        className="form-input"
                                        value={approvalConfig.targetAudience}
                                        onChange={(e) => setApprovalConfig({ ...approvalConfig, targetAudience: e.target.value })}
                                    >
                                        <option value="affected_area">📍 Residents of {approvingAlert.location} Only</option>
                                        <option value="district">🏙️ Entire District</option>
                                        <option value="all">🌍 All Registered Citizens (National)</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    className="btn"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                    onClick={() => setApprovingAlert(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    style={{ flex: 1, justifyContent: 'center' }}
                                    onClick={handleConfirmApproval}
                                    disabled={submitting}
                                >
                                    {submitting ? 'Broadcasting...' : 'Approve & Send'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div >
                )
            }

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Search size={18} color="var(--text-muted)" />
                    <input
                        type="text"
                        placeholder="Search alerts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ background: 'transparent', border: 'none', outline: 'none', width: '100%', color: 'var(--text-main)' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button onClick={() => setFilterLevel('all')} className={filterLevel === 'all' ? 'btn btn-primary' : 'btn'} style={{ padding: '0.75rem 1rem', fontSize: '0.9rem' }}>All</button>
                    <button onClick={() => setFilterLevel('low')} style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', background: filterLevel === 'low' ? alertLevels.low.bg : 'var(--bg-glass)', border: `1px solid ${filterLevel === 'low' ? alertLevels.low.color : 'var(--border-color)'}`, color: filterLevel === 'low' ? alertLevels.low.color : 'var(--text-main)', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>🟡 Advisory</button>
                    <button onClick={() => setFilterLevel('medium')} style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', background: filterLevel === 'medium' ? alertLevels.medium.bg : 'var(--bg-glass)', border: `1px solid ${filterLevel === 'medium' ? alertLevels.medium.color : 'var(--border-color)'}`, color: filterLevel === 'medium' ? alertLevels.medium.color : 'var(--text-main)', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>🟠 Warning</button>
                    <button onClick={() => setFilterLevel('high')} style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', background: filterLevel === 'high' ? alertLevels.high.bg : 'var(--bg-glass)', border: `1px solid ${filterLevel === 'high' ? alertLevels.high.color : 'var(--border-color)'}`, color: filterLevel === 'high' ? alertLevels.high.color : 'var(--text-main)', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>🔴 Urgent</button>
                    <button onClick={() => setFilterLevel('critical')} style={{ padding: '0.75rem 1rem', fontSize: '0.9rem', background: filterLevel === 'critical' ? alertLevels.critical.bg : 'var(--bg-glass)', border: `1px solid ${filterLevel === 'critical' ? alertLevels.critical.color : 'var(--border-color)'}`, color: filterLevel === 'critical' ? alertLevels.critical.color : 'var(--text-main)', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>🔴 Critical</button>
                </div>
            </div>

            {
                displayedAlerts.length === 0 ? (
                    <div className="glass-panel card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                            <ShieldCheck size={48} color="#10b981" />
                        </div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Alerts Found</h3>
                        <p style={{ color: 'var(--text-muted)' }}>
                            {activeTab === 'pending' ? 'No pending requests to review' : 'No active alerts match your criteria'}
                        </p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {displayedAlerts.map((alert, index) => {
                            const levelConfig = alertLevels[alert.level] || alertLevels.medium;
                            const IconComponent = levelConfig.icon;
                            const alertId = alert._id;
                            const isPending = alert.status === 'pending';

                            return (
                                <motion.div
                                    key={alertId}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-panel"
                                    style={{
                                        background: levelConfig.bg,
                                        borderLeft: `4px solid ${levelConfig.color}`,
                                        padding: '1.5rem',
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: '1.5rem',
                                        position: 'relative',
                                        opacity: isPending ? 0.9 : 1
                                    }}
                                >
                                    <div style={{ padding: '0.75rem', background: levelConfig.bg, borderRadius: '0.5rem', color: levelConfig.color, border: `2px solid ${levelConfig.color}` }}>
                                        <IconComponent size={24} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: levelConfig.color, background: levelConfig.bg, padding: '0.25rem 0.75rem', borderRadius: '1rem', border: `1px solid ${levelConfig.color}` }}>
                                                    {levelConfig.label}
                                                </span>
                                                {isPending && (
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#fb923c', background: 'rgba(251, 146, 60, 0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem', border: '1px solid #fb923c' }}>
                                                        PENDING APPROVAL
                                                    </span>
                                                )}
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                    {alert.createdAt ? new Date(alert.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                                                </span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {/* Approve Button (Admin Only, Pending Only) */}
                                                {isPending && isAdmin && (
                                                    <button
                                                        onClick={() => setApprovingAlert({ id: alertId, location: alert.location })}
                                                        className="btn btn-primary"
                                                        style={{
                                                            padding: '0.25rem 0.75rem',
                                                            fontSize: '0.8rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}
                                                    >
                                                        <Check size={14} />
                                                        Review Request
                                                    </button>
                                                )}

                                                {/* Resolve Button (Active Only) */}
                                                {!isPending && (isAdmin || isHealthWorker) && (
                                                    <button
                                                        onClick={() => handleResolveAlert(alertId)}
                                                        className="btn"
                                                        style={{
                                                            padding: '0.25rem 0.75rem',
                                                            fontSize: '0.8rem',
                                                            background: 'rgba(16, 185, 129, 0.1)',
                                                            color: '#10b981',
                                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}
                                                    >
                                                        <CheckCircle size={14} />
                                                        Resolve
                                                    </button>
                                                )}



                                                {/* Reject Button (Admin Only, Pending Only) */}
                                                {isPending && isAdmin && (
                                                    <button
                                                        onClick={() => handleDeleteAlert(alertId)}
                                                        className="btn"
                                                        style={{
                                                            padding: '0.25rem 0.75rem',
                                                            fontSize: '0.8rem',
                                                            border: '1px solid #ef4444',
                                                            color: '#ef4444',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}
                                                    >
                                                        <X size={14} />
                                                        Reject
                                                    </button>
                                                )}

                                                {/* Cancel Button (Requestor Only, Pending Only) */}
                                                {isPending && !isAdmin && user && alert.createdBy && (alert.createdBy._id === user.id || alert.createdBy._id === user._id) && (
                                                    <button
                                                        onClick={() => handleDeleteAlert(alertId)}
                                                        className="btn"
                                                        style={{
                                                            padding: '0.25rem 0.75rem',
                                                            fontSize: '0.8rem',
                                                            border: '1px solid #94a3b8',
                                                            color: '#64748b',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem'
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                        Cancel
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: levelConfig.color }}>
                                            {alert.location}
                                        </div>
                                        <div style={{ fontSize: '1rem', color: 'var(--text-main)', lineHeight: '1.6' }}>
                                            {alert.message}
                                        </div>
                                        {/* Display Channels if approved */}
                                        {!isPending && (alert.channels || []).length > 0 && (
                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                {(alert.channels || []).includes('sms') && (
                                                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                        <MessageSquare size={12} /> SMS Sent
                                                    </span>
                                                )}
                                                {(alert.channels || []).includes('email') && (
                                                    <span style={{ fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                        <Mail size={12} /> Email Sent
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {(alert.createdBy || alert.approvedBy) && (
                                            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                                                {alert.createdBy && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <span style={{ opacity: 0.7 }}>Requested by:</span>
                                                        <span style={{ fontWeight: 500 }}>{alert.createdBy.name || 'Health Worker'}</span>
                                                    </div>
                                                )}
                                                {alert.approvedBy && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                        <CheckCircle size={12} color="#10b981" />
                                                        <span style={{ opacity: 0.7 }}>Approved by:</span>
                                                        <span style={{ fontWeight: 500, color: '#10b981' }}>{alert.approvedBy.name || 'Admin'}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {/* Display Broadcast Summary if available */}
                                        {!isPending && alert.broadcastSummary && (
                                            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                                    <Send size={12} />
                                                    <strong>Broadcast Report ({new Date(alert.broadcastSummary.sentAt).toLocaleTimeString()}):</strong>
                                                </div>
                                                <div>
                                                    Sent to <strong>{alert.broadcastSummary.totalSent}</strong> recipients
                                                    (Community: {alert.broadcastSummary.recipientTypeCount.community || 0},
                                                    Health Workers: {alert.broadcastSummary.recipientTypeCount.health_worker || 0})
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )
            }
        </div >
    );
};

export default Alerts;
