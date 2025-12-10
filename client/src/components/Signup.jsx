import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Shield, AlertCircle, Mountain, Droplets, MapPin, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'community',
        location: '',
        phoneNumber: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const result = await register(
            formData.name,
            formData.email,
            formData.password,
            formData.role,
            formData.location,
            formData.phoneNumber
        );

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                right: '-5%',
                width: '500px',
                height: '500px',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-10%',
                left: '-5%',
                width: '400px',
                height: '400px',
                background: 'radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                pointerEvents: 'none'
            }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-panel"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '3rem',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {/* Logo and Title */}
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1rem',
                        background: 'var(--bg-glass)',
                        borderRadius: '1rem',
                        marginBottom: '1.5rem'
                    }}>
                        <Mountain size={32} color="#10b981" />
                        <Droplets size={28} color="#0ea5e9" />
                    </div>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        background: 'var(--primary-gradient)',
                        WebkitBackgroundClip: 'text',
                        backgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Join Our Community
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                        Create your Smart Health NE account
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            padding: '1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '0.75rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'center',
                            color: '#ef4444'
                        }}
                    >
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </motion.div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            <User size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Mail size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>



                    <div className="form-group">
                        <label className="form-label">
                            <MapPin size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Village / Location
                        </label>
                        <input
                            type="text"
                            name="location"
                            className="form-input"
                            placeholder="e.g. Guwahati"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Phone size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            className="form-input"
                            placeholder="For SMS Alerts"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="At least 6 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="form-input"
                            placeholder="Re-enter password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '2rem' }}>
                        <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>Select ID Type</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            {/* Community Member */}
                            <div
                                onClick={() => setFormData({ ...formData, role: 'community' })}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '0.75rem',
                                    border: `2px solid ${formData.role === 'community' ? '#10b981' : 'rgba(255,255,255,0.1)'}`, // Using hex for primary green
                                    background: formData.role === 'community' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: formData.role === 'community' ? '#10b981' : 'var(--text-main)' }}>
                                    <User size={20} />
                                    <span>Community</span>
                                </div>
                            </div>

                            {/* Health Worker */}
                            <div
                                onClick={() => setFormData({ ...formData, role: 'health_worker' })}
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '0.75rem',
                                    border: `2px solid ${formData.role === 'health_worker' ? '#10b981' : 'rgba(255,255,255,0.1)'}`,
                                    background: formData.role === 'health_worker' ? 'rgba(16, 185, 129, 0.1)' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', fontWeight: 600, color: formData.role === 'health_worker' ? '#10b981' : 'var(--text-main)' }}>
                                    <Shield size={20} />
                                    <span>Health Worker</span>
                                </div>
                            </div>

                            {/* National Admin */}
                            <div
                                onClick={() => setFormData({ ...formData, role: 'national_admin' })}
                                style={{
                                    gridColumn: 'span 2',
                                    padding: '0.75rem',
                                    borderRadius: '0.75rem',
                                    border: `2px solid ${formData.role === 'national_admin' ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, // Red for admin distinction
                                    background: formData.role === 'national_admin' ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    textAlign: 'center'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 600, color: formData.role === 'national_admin' ? '#ef4444' : 'var(--text-main)' }}>
                                    <Shield size={20} />
                                    <span>Administration of India</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : (
                            <>
                                <UserPlus size={20} />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                {/* Login Link */}
                <div style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--border-color)'
                }}>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            style={{
                                color: 'var(--primary)',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}
                        >
                            Login
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div >
    );
};

export default Signup;
