import React, { useState } from 'react';
import {
    MapPin, Thermometer, Droplets, Activity,
    ShieldAlert, Send, FileText, CheckCircle2,
    AlertTriangle, Stethoscope, Info, Check, X,
    LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import reportImage from '../assets/alert.jpg'; // Re-using the abstract energetic image or similar

const ReportForm = () => {
    const { token } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState('idle');

    const [form, setForm] = useState({
        state: 'Assam',
        location: '',
        symptoms: [],
        severity: 'Low',
        waterSource: '',
        notes: ''
    });

    const NORTH_EAST_STATES = [
        "Arunachal Pradesh", "Assam", "Manipur", "Meghalaya",
        "Mizoram", "Nagaland", "Sikkim", "Tripura"
    ];

    const SYMPTOMS_LIST = [
        { id: 'Fever', icon: Thermometer },
        { id: 'Diarrhea', icon: Droplets },
        { id: 'Vomiting', icon: Activity },
        { id: 'Skin Rash', icon: ShieldAlert },
        { id: 'Fatigue', icon: Activity },
        { id: 'Stomach Pain', icon: AlertTriangle }
    ];

    const WATER_SOURCES = [
        'River', 'Well', 'Community Well', 'Pond', 'Tap Water', 'Other'
    ];

    const handleSymptomToggle = (id) => {
        setForm(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(id)
                ? prev.symptoms.filter(s => s !== id)
                : [...prev.symptoms, id]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus('idle');

        if (!form.location || !form.waterSource || form.symptoms.length === 0) {
            alert('Please fill in Location, Water Source, and at least one Symptom.');
            setSubmitting(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                setStatus('success');
                setForm({
                    state: 'Assam',
                    location: '',
                    symptoms: [],
                    severity: 'Low',
                    waterSource: '',
                    notes: ''
                });
                setTimeout(() => setStatus('idle'), 4000);
            } else {
                throw new Error('Failed to submit');
            }
        } catch (err) {
            console.error(err);
            alert('Error submitting report');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '1600px', padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'flex-start', justifyContent: 'center', minHeight: '80vh' }}>

            {/* Left Side: Hero Section (Separate Box) */}
            <div style={{
                width: '450px', // Reduced width
                minHeight: '600px',
                borderRadius: '2rem',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)',
                background: '#0f172a',
                flexShrink: 0
            }}>
                {/* Background Image */}
                <div style={{ position: 'absolute', inset: 0 }}>
                    <img
                        src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                        alt="Medical Tech"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4, filter: 'grayscale(100%) contrast(1.2)' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 50%, rgba(15, 23, 42, 0.9) 100%)' }} />
                </div>

                <div style={{ position: 'relative', zIndex: 10, padding: '3rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '2rem', backdropFilter: 'blur(10px)' }}>
                            <Activity size={18} color="#34d399" />
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', letterSpacing: '0.5px' }}>LIVE DATA FEED</span>
                        </div>

                        <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', color: 'white' }}>
                            New <br />
                            Incident
                        </h1>

                        <p style={{ fontSize: '1.05rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                            Precise data collection drives our rapid response protocols.
                        </p>
                    </div>

                    <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.6)', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(52, 211, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ShieldAlert size={20} color="#34d399" />
                            </div>
                            <div>
                                <div style={{ color: 'white', fontWeight: 700 }}>Secure Channel</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>End-to-end encrypted</div>
                            </div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
                            Authorized Personnel Only
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: The Form (Separate Box) */}
            <div className="glass-panel" style={{
                flex: 1,
                maxWidth: '900px',
                minHeight: '600px',
                padding: '3rem',
                borderRadius: '2rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative' // For overlay
            }}>
                <form onSubmit={handleSubmit} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

                    {/* Location Section */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
                            <span style={{ width: 28, height: 28, borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>1</span>
                            Geographic Information
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label className="form-label">State Region</label>
                                <select
                                    value={form.state} onChange={e => setForm({ ...form, state: e.target.value })}
                                    className="form-select" style={{ background: 'var(--bg-main)' }}
                                >
                                    {NORTH_EAST_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Village / Sector</label>
                                <input
                                    value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                                    placeholder="Enter precise location"
                                    className="form-input" style={{ background: 'var(--bg-main)' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Symptoms Section */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
                            <span style={{ width: 28, height: 28, borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>2</span>
                            Clinical Signs
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {SYMPTOMS_LIST.map(sym => {
                                const active = form.symptoms.includes(sym.id);
                                return (
                                    <div
                                        key={sym.id} onClick={() => handleSymptomToggle(sym.id)}
                                        style={{
                                            padding: '0.75rem 1.25rem', borderRadius: '1rem', cursor: 'pointer',
                                            background: active ? 'var(--primary)' : 'var(--bg-main)',
                                            color: active ? 'white' : 'var(--text-muted)',
                                            border: active ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                                            fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                                            transition: 'all 0.2s',
                                            boxShadow: active ? '0 4px 12px var(--shadow-color)' : 'none'
                                        }}
                                    >
                                        <sym.icon size={16} /> {sym.id}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
                                <span style={{ width: 28, height: 28, borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>3</span>
                                Source
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                {WATER_SOURCES.map(src => (
                                    <div
                                        key={src} onClick={() => setForm({ ...form, waterSource: src })}
                                        style={{
                                            padding: '0.75rem', textAlign: 'center', borderRadius: '0.75rem', cursor: 'pointer',
                                            background: form.waterSource === src ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-main)',
                                            color: form.waterSource === src ? 'var(--primary)' : 'var(--text-muted)',
                                            border: form.waterSource === src ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                                            fontSize: '0.9rem', fontWeight: 600
                                        }}
                                    >
                                        {src}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
                                <span style={{ width: 28, height: 28, borderRadius: '8px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>4</span>
                                Severity
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {['Low', 'Medium', 'High'].map(level => {
                                    let activeColor = level === 'High' ? '#ef4444' : level === 'Medium' ? '#f97316' : '#10b981';
                                    let activeBg = level === 'High' ? 'rgba(239, 68, 68, 0.1)' : level === 'Medium' ? 'rgba(249, 115, 22, 0.1)' : 'rgba(16, 185, 129, 0.1)';
                                    let active = form.severity === level;
                                    return (
                                        <div
                                            key={level} onClick={() => setForm({ ...form, severity: level })}
                                            style={{
                                                padding: '0.75rem 1rem', borderRadius: '0.75rem', cursor: 'pointer',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                background: active ? activeBg : 'var(--bg-main)',
                                                border: active ? `1px solid ${activeColor}` : '1px solid var(--border-color)'
                                            }}
                                        >
                                            <span style={{ fontWeight: 600, color: active ? activeColor : 'var(--text-muted)', fontSize: '0.9rem' }}>{level}</span>
                                            {active && <Check size={16} color={activeColor} />}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', fontSize: '1.2rem', padding: '1.25rem', justifyContent: 'center', borderRadius: '1rem' }}
                            disabled={submitting}
                        >
                            {submitting ? 'Submitting Data...' : 'Submit Final Report'} <Send size={20} />
                        </button>
                    </div>

                    {/* Success Overlay */}
                    <AnimatePresence>
                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                style={{
                                    position: 'absolute', inset: 0,
                                    background: 'var(--bg-card)', backdropFilter: 'blur(20px)',
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20,
                                    borderRadius: '2rem'
                                }}
                            >
                                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} style={{ width: 100, height: 100, background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', boxShadow: '0 0 40px var(--shadow-color)' }}>
                                    <CheckCircle2 color="white" size={50} />
                                </motion.div>
                                <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>Submitted</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Report successfully logged in database.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </form>
            </div>
        </div>
    );
};

export default ReportForm;
