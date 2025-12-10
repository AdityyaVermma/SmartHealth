import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, Mountain, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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
        setLoading(true);

        const result = await login(formData.email, formData.password);

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
                    maxWidth: '450px',
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
                        Welcome Back
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
                        Login to Smart Health NE
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

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
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
                            <Lock size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : (
                            <>
                                <LogIn size={20} />
                                Login
                            </>
                        )}
                    </button>
                </form>

                {/* Signup Link */}
                <div style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--border-color)'
                }}>
                    <p style={{ color: 'var(--text-muted)' }}>
                        Don't have an account?{' '}
                        <Link
                            to="/signup"
                            style={{
                                color: 'var(--primary)',
                                fontWeight: 600,
                                textDecoration: 'none'
                            }}
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
