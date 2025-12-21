import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, AlertTriangle, FileText, Search, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

const VillageReports = () => {
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('http://localhost:5000/api/stats')
            .then(res => res.json())
            .then(data => {
                if (data.locations) {
                    const locArray = Object.entries(data.locations).map(([name, stats]) => ({
                        name,
                        totalCases: typeof stats === 'number' ? stats : (stats.totalCases || stats.cases || 0),
                        registeredCases: typeof stats === 'object' ? (stats.registeredCases || 0) : 0,
                    }));
                    setLocations(locArray.sort((a, b) => b.totalCases - a.totalCases));
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching village stats:", err);
                setLoading(false);
            });
    }, []);

    const handleDelete = async (locationName) => {
        if (!window.confirm(`Are you sure you want to remove all reports for ${locationName}? This action cannot be undone.`)) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/api/reports/location/${encodeURIComponent(locationName)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                // Remove from state
                setLocations(prev => prev.filter(loc => loc.name !== locationName));
                alert(`Successfully removed ${locationName} and its reports.`);
            } else {
                const data = await res.json();
                alert(`Failed to delete: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error deleting location:', error);
            alert('Error connecting to server');
        }
    };

    const filteredLocations = locations.filter(loc =>
        loc.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination Logic
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredLocations.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="container" style={{ padding: '2rem 1.5rem', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="btn"
                onClick={() => navigate(-1)}
                style={{ alignSelf: 'flex-start', marginBottom: '2rem', paddingLeft: 0, color: 'var(--text-muted)' }}
            >
                <ArrowLeft size={20} />
                Back to Dashboard
            </motion.button>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{ flex: 1 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 className="page-title">Village Health Status</h1>
                        <p className="page-subtitle">Detailed report breakdown by location</p>
                    </div>

                    <div style={{ position: 'relative', minWidth: '300px' }}>
                        <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Search village..."
                            className="form-input"
                            style={{ paddingLeft: '3rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="loading">Loading village data...</div>
                ) : (
                    <>
                        <div className="glass-panel" style={{ overflow: 'hidden', borderRadius: '1rem', marginBottom: '1rem' }}>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(0,0,0,0.05)', borderBottom: '1px solid var(--border-color)' }}>
                                            <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Village / Location</th>
                                            <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Reported Cases</th>
                                            <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Registered Cases</th>
                                            <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status</th>
                                            {user?.role === 'national_admin' && (
                                                <th style={{ padding: '1.25rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'center' }}>Action</th>
                                            )}
                                        </tr>
                                    </thead>
                                    <motion.tbody
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="visible"
                                        key={currentPage} // Re-animate on page change
                                    >
                                        {currentItems.length > 0 ? (
                                            currentItems.map((loc, index) => (
                                                <motion.tr
                                                    key={loc.name}
                                                    variants={itemVariants}
                                                    style={{ borderBottom: '1px solid var(--border-color)' }}
                                                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                                                >
                                                    <td style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                        <div style={{ padding: '0.5rem', background: 'var(--bg-glass)', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                                                            <MapPin size={18} color="var(--primary)" />
                                                        </div>
                                                        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{loc.name}</span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <FileText size={16} className="text-muted" />
                                                            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>{loc.totalCases}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1.25rem' }}>
                                                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '1rem', background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9', fontWeight: 500, fontSize: '0.9rem' }}>
                                                            {loc.registeredCases} verified
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1.25rem' }}>
                                                        {loc.totalCases > 10 ? (
                                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontWeight: 600, fontSize: '0.9rem' }}>
                                                                <AlertTriangle size={16} /> Critical
                                                            </span>
                                                        ) : loc.totalCases > 5 ? (
                                                            <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem' }}>Moderate</span>
                                                        ) : (
                                                            <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>Stable</span>
                                                        )}
                                                    </td>
                                                    {user?.role === 'national_admin' && (
                                                        <td style={{ padding: '1.25rem', textAlign: 'center' }}>
                                                            <button
                                                                onClick={() => handleDelete(loc.name)}
                                                                className="btn-icon"
                                                                style={{
                                                                    color: '#ef4444',
                                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                                    padding: '0.5rem',
                                                                    borderRadius: '0.5rem',
                                                                    transition: 'all 0.2s',
                                                                    border: 'none',
                                                                    cursor: 'pointer'
                                                                }}
                                                                title="Remove Village"
                                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    )}
                                                </motion.tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={user?.role === 'national_admin' ? 5 : 4} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                    No villages found matching your search.
                                                </td>
                                            </tr>
                                        )}
                                    </motion.tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        {filteredLocations.length > itemsPerPage && (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="btn"
                                    style={{
                                        padding: '0.5rem 1rem',
                                        opacity: currentPage === 1 ? 0.5 : 1,
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Previous
                                </button>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="btn"
                                    style={{
                                        padding: '0.5rem 1rem',
                                        opacity: currentPage === totalPages ? 0.5 : 1,
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default VillageReports;
