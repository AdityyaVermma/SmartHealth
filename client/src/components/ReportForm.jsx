import React, { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import reportImage from '../assets/report.jpg';

const ReportForm = () => {
    const { user, token } = useAuth();
    const [formData, setFormData] = useState({
        state: 'Assam',
        location: '',
        symptoms: '',
        waterSource: '',
        severity: 'Low',
        notes: ''
    });
    const [status, setStatus] = useState('idle');

    const neStates = [
        "Arunachal Pradesh",
        "Assam",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "Sikkim",
        "Tripura"
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const response = await fetch('http://localhost:5000/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    symptoms: formData.symptoms.split(',').map(s => s.trim())
                })
            });

            if (response.ok) {
                setStatus('success');
                setFormData({
                    state: 'Assam',
                    location: '',
                    symptoms: '',
                    waterSource: '',
                    severity: 'Low',
                    notes: ''
                });
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    const inputFocus = {
        scale: 1.01,
        borderColor: "var(--primary)",
        boxShadow: "0 0 0 4px rgba(16, 185, 129, 0.1)"
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="container"
        >
            <motion.div variants={itemVariants} className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 className="page-title">Submit Health Report</h1>
                <p className="page-subtitle">Help us track and prevent water-borne diseases by reporting cases in your region.</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '3rem', alignItems: 'start' }}>
                <motion.div variants={itemVariants} className="glass-panel card">
                    <AnimatePresence mode='wait'>
                        {status === 'success' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                    color: '#34d399',
                                    borderRadius: '0.75rem',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                            >
                                <CheckCircle size={20} />
                                Report submitted successfully! Thank you for your contribution.
                            </motion.div>
                        )}

                        {status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                style={{
                                    padding: '1rem',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    color: '#fca5a5',
                                    borderRadius: '0.75rem',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}
                            >
                                <AlertCircle size={20} />
                                Error submitting report. Please check your connection and try again.
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <motion.div variants={itemVariants} className="form-group">
                                <label className="form-label">State</label>
                                <div style={{ position: 'relative' }}>
                                    <motion.select
                                        whileFocus={inputFocus}
                                        name="state"
                                        className="form-select"
                                        value={formData.state}
                                        onChange={handleChange}
                                        required
                                        style={{ paddingLeft: '2.5rem' }}
                                    >
                                        {neStates.map(state => (
                                            <option key={state} value={state} style={{ color: 'black' }}>{state}</option>
                                        ))}
                                    </motion.select>
                                    <Map size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="form-group">
                                <label className="form-label">Village / Town</label>
                                <motion.input
                                    whileFocus={inputFocus}
                                    type="text"
                                    name="location"
                                    className="form-input"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    placeholder="e.g., Sonapur"
                                />
                            </motion.div>
                        </div>

                        <motion.div variants={itemVariants} className="form-group">
                            <label className="form-label">Symptoms</label>
                            <motion.input
                                whileFocus={inputFocus}
                                type="text"
                                name="symptoms"
                                className="form-input"
                                value={formData.symptoms}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Fever, Diarrhea, Vomiting"
                            />
                        </motion.div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <motion.div variants={itemVariants} className="form-group">
                                <label className="form-label">Water Source</label>
                                <motion.select
                                    whileFocus={inputFocus}
                                    name="waterSource"
                                    className="form-select"
                                    value={formData.waterSource}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" style={{ color: 'black' }}>Select Source</option>
                                    <option value="Community Well" style={{ color: 'black' }}>Community Well</option>
                                    <option value="River" style={{ color: 'black' }}>River</option>
                                    <option value="Pond" style={{ color: 'black' }}>Pond</option>
                                    <option value="Hand Pump" style={{ color: 'black' }}>Hand Pump</option>
                                    <option value="Tap Water" style={{ color: 'black' }}>Tap Water</option>
                                    <option value="Other" style={{ color: 'black' }}>Other</option>
                                </motion.select>
                            </motion.div>

                            <motion.div variants={itemVariants} className="form-group">
                                <label className="form-label">Severity</label>
                                <motion.select
                                    whileFocus={inputFocus}
                                    name="severity"
                                    className="form-select"
                                    value={formData.severity}
                                    onChange={handleChange}
                                >
                                    <option value="Low" style={{ color: 'black' }}>Low (Mild)</option>
                                    <option value="Medium" style={{ color: 'black' }}>Medium (Moderate)</option>
                                    <option value="High" style={{ color: 'black' }}>High (Urgent)</option>
                                </motion.select>
                            </motion.div>
                        </div>

                        <motion.div variants={itemVariants} className="form-group">
                            <label className="form-label">Additional Notes</label>
                            <motion.textarea
                                whileFocus={inputFocus}
                                name="notes"
                                className="form-textarea"
                                rows="3"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Any other relevant details..."
                            ></motion.textarea>
                        </motion.div>

                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                            disabled={status === 'submitting'}
                        >
                            {status === 'submitting' ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%' }}
                                />
                            ) : (
                                <>
                                    <Send size={18} />
                                    Submit Report
                                </>
                            )}
                        </motion.button>
                    </form>
                </motion.div>

                <motion.div variants={itemVariants} style={{ position: 'sticky', top: '6rem' }}>
                    <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.5rem' }}>
                        <img src={reportImage} alt="Community Health" style={{ width: '100%', display: 'block' }} />
                    </div>
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ marginBottom: '1rem', color: 'var(--primary)' }}>Why Report?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                            Timely reporting helps us identify potential outbreaks before they spread. Your data is crucial for:
                        </p>
                        <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-main)' }}>
                            <li style={{ marginBottom: '0.5rem' }}>Early detection of water contamination</li>
                            <li style={{ marginBottom: '0.5rem' }}>Rapid response resource allocation</li>
                            <li>Community awareness and safety</li>
                        </ul>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ReportForm;
