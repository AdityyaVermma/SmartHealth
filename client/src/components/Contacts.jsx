import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, Trash2, Phone, Mail, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const Contacts = () => {
    const { token, user } = useAuth();
    const [groups, setGroups] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'mixed', // sms, email, mixed
        contactsString: ''
    });

    useEffect(() => {
        fetchGroups();
    }, [token]);

    const fetchGroups = async () => {
        try {
            const res = await fetch(`${API_URL}/api/contacts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setGroups(data);
            }
        } catch (error) {
            console.error('Failed to fetch contact groups', error);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const contactsList = formData.contactsString.split(',').map(s => s.trim()).filter(Boolean);

            const res = await fetch(`${API_URL}/api/contacts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: formData.name,
                    type: formData.type,
                    contacts: contactsList
                })
            });

            if (!res.ok) throw new Error('Failed to create group');

            await fetchGroups();
            setShowCreateModal(false);
            setFormData({ name: '', type: 'mixed', contactsString: '' });
        } catch (error) {
            alert(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this group?')) return;
        try {
            const res = await fetch(`${API_URL}/api/contacts/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setGroups(groups.filter(g => g._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete group', error);
        }
    };

    return (
        <div className="fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                        Contact Groups
                    </h1>
                    <p style={{ color: 'var(--text-muted)' }}>Manage your broadcast lists for rapid alert dissemination.</p>
                </div>
                <motion.button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={20} />
                    Create New Group
                </motion.button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {groups.map(group => (
                    <motion.div
                        key={group._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-panel card"
                        style={{ padding: '1.5rem', position: 'relative' }}
                    >
                        <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                            <button
                                onClick={() => handleDelete(group._id)}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '12px',
                                background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Users size={24} color="#10b981" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{group.name}</h3>
                                <span className={`badge badge-${group.type === 'sms' ? 'warning' : group.type === 'email' ? 'info' : 'success'}`}>
                                    {group.type.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <span>Recipients</span>
                                <span>{group.contacts.length}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {group.contacts.slice(0, 3).map((c, i) => (
                                    <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                        {c.length > 20 ? c.substring(0, 18) + '...' : c}
                                    </span>
                                ))}
                                {group.contacts.length > 3 && (
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                                        +{group.contacts.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="glass-panel card"
                            style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: '#1e293b' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>New Contact Group</h2>
                                <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleCreate}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="form-label">Group Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., District Doctors"
                                        required
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label className="form-label">Channel Type</label>
                                    <select
                                        className="form-input"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="mixed">Mixed (Email & SMS)</option>
                                        <option value="sms">SMS Only</option>
                                        <option value="email">Email Only</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label className="form-label">Contacts List</label>
                                    <textarea
                                        className="form-input"
                                        value={formData.contactsString}
                                        onChange={e => setFormData({ ...formData, contactsString: e.target.value })}
                                        placeholder="Paste comma-separated emails or phone numbers here..."
                                        rows={5}
                                        required
                                    />
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                        Separate multiple contacts with commas.
                                    </p>
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
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Contacts;
