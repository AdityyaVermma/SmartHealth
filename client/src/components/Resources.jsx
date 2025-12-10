import React from 'react';
import { BookOpen, Droplets, Shield, PhoneCall, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const Resources = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="page-header">
                <h1 className="page-title">Health Resources</h1>
                <p className="page-subtitle">Guidelines and information for community safety and disease prevention.</p>
            </div>

            <div className="dashboard-grid">
                <motion.div variants={itemVariants} className="glass-panel card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '0.5rem', color: '#0ea5e9' }}>
                            <Droplets size={24} />
                        </div>
                        <h3 className="card-title">Water Safety Guidelines</h3>
                    </div>
                    <ul style={{ listStyle: 'none', color: 'var(--text-muted)' }}>
                        <li style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--primary)' }}>•</span> Boil water for at least 1 minute before drinking.
                        </li>
                        <li style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--primary)' }}>•</span> Use chlorine tablets as prescribed by health workers.
                        </li>
                        <li style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--primary)' }}>•</span> Store water in clean, covered containers.
                        </li>
                    </ul>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem', color: '#10b981' }}>
                            <Shield size={24} />
                        </div>
                        <h3 className="card-title">Disease Prevention</h3>
                    </div>
                    <ul style={{ listStyle: 'none', color: 'var(--text-muted)' }}>
                        <li style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--primary)' }}>•</span> Wash hands frequently with soap and water.
                        </li>
                        <li style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--primary)' }}>•</span> Avoid street food from unhygienic sources.
                        </li>
                        <li style={{ marginBottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--primary)' }}>•</span> Maintain proper sanitation in and around homes.
                        </li>
                    </ul>
                </motion.div>

                <motion.div variants={itemVariants} className="glass-panel card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.5rem', color: '#f59e0b' }}>
                            <PhoneCall size={24} />
                        </div>
                        <h3 className="card-title">Emergency Contacts</h3>
                    </div>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Ambulance</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>108</div>
                        </div>
                        <div style={{ padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Health Helpline</div>
                            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>104</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <motion.div variants={itemVariants} className="glass-panel card">
                <div className="card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <FileText size={24} color="var(--primary)" />
                        <h3 className="card-title">Downloadable Materials</h3>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                    {['Hygiene Handbook (PDF)', 'Water Safety Poster (JPG)', 'Community Guidelines (PDF)'].map((item, i) => (
                        <div key={i} style={{
                            padding: '1rem',
                            background: 'var(--bg-glass)',
                            borderRadius: '0.5rem',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }} className="resource-item">
                            <span style={{ fontWeight: 500 }}>{item}</span>
                            <div style={{ padding: '0.25rem 0.75rem', background: 'var(--primary)', color: 'white', borderRadius: '0.25rem', fontSize: '0.875rem' }}>Download</div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Resources;
