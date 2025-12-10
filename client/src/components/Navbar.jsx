import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, AlertTriangle, FilePlus, LayoutDashboard, BookOpen, Sun, Moon, LogOut, LogIn, UserPlus, User, Users, Shield } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass-nav" style={{ backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border-color)', height: '70px', display: 'flex', alignItems: 'center' }}>
            <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>

                {/* 1. BRAND ZONE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
                        <div style={{
                            background: 'var(--primary-gradient)',
                            width: '36px', height: '36px', borderRadius: '10px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                        }}>
                            <Activity size={20} color="white" strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1, margin: 0, color: 'var(--text-main)' }}>
                                SmartHealth<span style={{ color: 'var(--primary)' }}>NE</span>
                            </h1>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.5px' }}>
                                RAPID RESPONSE SYSTEM
                            </span>
                        </div>
                    </div>

                    {user?.role === 'national_admin' && (
                        <div style={{
                            padding: '4px 12px', borderRadius: '20px',
                            background: 'rgba(239, 68, 68, 0.08)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444', fontSize: '0.7rem', fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.05em',
                            display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                            <Shield size={12} fill="currentColor" />
                            National Portal
                        </div>
                    )}
                </div>

                {/* 2. NAVIGATION ZONE */}
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', height: '70px' }}>
                    {[
                        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
                        { path: '/report', icon: FilePlus, label: 'Report', roles: ['health_worker', 'admin', 'national_admin'] },
                        { path: '/alerts', icon: AlertTriangle, label: 'Alerts', roles: ['community', 'health_worker', 'admin', 'national_admin'] },
                        { path: '/users', icon: Users, label: 'Users', roles: ['admin', 'national_admin'] },
                        { path: '/resources', icon: BookOpen, label: 'Resources' }
                    ].map((link) => {
                        if (link.roles && (!user || !link.roles.includes(user.role))) return null;

                        return (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                style={{
                                    textDecoration: 'none', height: '100%',
                                    display: 'flex', alignItems: 'center',
                                    position: 'relative',
                                    padding: '0 4px'
                                }}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: isActive ? 1 : 0.6, transition: 'opacity 0.2s' }}>
                                            <span style={{ fontWeight: isActive ? 600 : 500, color: 'var(--text-main)', fontSize: '0.9rem' }}>{link.label}</span>
                                        </div>
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                style={{
                                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                                    height: '3px', background: 'var(--primary)',
                                                    borderTopLeftRadius: '3px', borderTopRightRadius: '3px'
                                                }}
                                            />
                                        )}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>

                {/* 3. CONTROLS ZONE */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'transparent', border: 'none', color: 'var(--text-muted)',
                            cursor: 'pointer', padding: '8px', display: 'flex',
                            transition: 'color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                    >
                        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>

                    {isAuthenticated() ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{user?.name}</span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                    {user?.role?.replace('_', ' ')}
                                </span>
                            </div>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '50%',
                                background: 'var(--bg-card)', border: '1px solid var(--border-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                <User size={20} color="var(--text-muted)" />
                            </div>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: 'transparent', border: 'none', color: '#ef4444',
                                    cursor: 'pointer', padding: '8px',
                                    display: 'flex', alignItems: 'center'
                                }}
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button
                                onClick={() => navigate('/login')}
                                style={{
                                    background: 'transparent', border: 'none',
                                    color: 'var(--text-main)', fontWeight: 500,
                                    cursor: 'pointer'
                                }}
                            >
                                Log In
                            </button>
                            <button
                                onClick={() => navigate('/signup')}
                                className="btn-primary"
                                style={{
                                    padding: '8px 20px', borderRadius: '20px',
                                    fontSize: '0.9rem', fontWeight: 600
                                }}
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

