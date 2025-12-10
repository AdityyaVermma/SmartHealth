import React from 'react';
import { Activity, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <div className="logo" style={{ marginBottom: '1rem' }}>
                            <div style={{ background: 'var(--primary-gradient)', padding: '6px', borderRadius: '6px', display: 'flex' }}>
                                <Activity size={18} color="white" />
                            </div>
                            <span style={{ fontSize: '1.25rem' }}>SmartHealth NE</span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            Empowering communities with real-time health monitoring and early warning systems.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><a href="/">Dashboard</a></li>
                            <li><a href="/report">Report Case</a></li>
                            <li><a href="/alerts">Active Alerts</a></li>
                            <li><a href="/resources">Resources</a></li>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h4>Contact</h4>
                        <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <Mail size={16} /> support@smarthealthne.org
                            </li>
                            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <Phone size={16} /> +91 123 456 7890
                            </li>
                            <li style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <MapPin size={16} /> Guwahati, Assam
                            </li>
                        </ul>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    © 2025 Smart Community Health System. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
