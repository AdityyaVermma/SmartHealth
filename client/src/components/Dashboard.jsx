import React, { useEffect, useState, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Legend, Cell, LineChart, Line } from 'recharts';
import { Activity, AlertTriangle, MapPin, Clock, ArrowRight, Droplets, Mountain, TrendingUp, Users, FileText, Plus, X, FilePlus } from 'lucide-react';
import { motion, animate, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import neHeroImage from '../assets/ne_hero.png';
import HealthMap from './HealthMap';
import { useAuth } from '../context/AuthContext';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-panel card" style={{ height: '100%', minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ef4444', gap: '1rem' }}>
          <AlertTriangle size={48} />
          <p>Something went wrong with this component.</p>
          <button onClick={() => this.setState({ hasError: false })} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const Counter = ({ from, to }) => {
  const nodeRef = useRef();

  useEffect(() => {
    const node = nodeRef.current;
    const controls = animate(from, to, {
      duration: 1.5,
      onUpdate(value) {
        node.textContent = value.toFixed(0);
      }
    });
    return () => controls.stop();
  }, [from, to]);

  return <span ref={nodeRef} />;
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [showQuickReport, setShowQuickReport] = useState(false);
  const [quickReportForm, setQuickReportForm] = useState({ location: '', cases: 1, registered: 0, severity: 'Low' });
  const [submitting, setSubmitting] = useState(false);
  const { isAuthenticated, token, logout, user } = useAuth();
  const navigate = useNavigate();

  const fetchStats = () => {
    fetch('http://localhost:5000/api/stats')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching stats:', err);
        setLoading(false);
        setStats({ totalReports: 0, highSeverity: 0, locations: {} });
      });
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  // Prepare chart data using useMemo to avoid recalculation
  const chartData = useMemo(() => {
    if (!stats || !stats.locations || typeof stats.locations !== 'object') {
      return [];
    }

    try {
      return Object.entries(stats.locations)
        .map(([name, data]) => {
          const totalCases = typeof data === 'number' ? data : (data.totalCases || data.cases || 0);
          const registeredCases = typeof data === 'object' ? (data.registeredCases || 0) : 0;

          return {
            name: String(name || 'Unknown').trim(),
            cases: Math.max(0, Number(totalCases) || 0),
            registered: Math.max(0, Number(registeredCases) || 0)
          };
        })
        .filter(item => item.cases > 0)
        .sort((a, b) => b.cases - a.cases)
        .slice(0, 10);
    } catch (error) {
      console.error('Error preparing chart data:', error);
      return [];
    }
  }, [stats]);

  // Prepare severity data
  const severityData = useMemo(() => {
    if (!stats) return [];

    try {
      const high = Math.max(0, Number(stats.highSeverity) || 0);
      const total = Math.max(0, Number(stats.totalReports) || 0);
      const remaining = Math.max(0, total - high);
      const medium = Math.floor(remaining / 2);
      const low = Math.ceil(remaining / 2);

      return [
        { name: 'High', value: high, color: '#ef4444' },
        { name: 'Medium', value: medium, color: '#f59e0b' },
        { name: 'Low', value: low, color: '#10b981' },
      ].filter(item => item.value > 0);
    } catch (error) {
      console.error('Error preparing severity data:', error);
      return [];
    }
  }, [stats]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '4px solid var(--bg-glass)', borderTop: '4px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading dashboard...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <AlertTriangle size={64} color="var(--primary)" />
        <p style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 600 }}>Error loading data</p>
        <button onClick={fetchStats} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          Retry
        </button>
      </div>
    );
  }

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

  const cardHover = {
    y: -5,
    transition: { type: 'spring', stiffness: 300 }
  };

  const handleQuickReport = async (e) => {
    e.preventDefault();
    if (!isAuthenticated()) {
      alert('Please login to add reports');
      navigate('/login');
      return;
    }

    if (!quickReportForm.location.trim()) {
      alert('Please enter a location');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Submitting report with token:', token ? 'Token exists' : 'No token');
      const res = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          location: quickReportForm.location,
          severity: quickReportForm.severity,
          waterSource: 'River',
          symptoms: ['Fever'],
          count: quickReportForm.cases,
          registeredCases: quickReportForm.registered,
          state: 'Assam'
        })
      });

      const data = await res.json();
      console.log('Server response:', res.status, data);

      if (res.ok) {
        setShowQuickReport(false);
        setQuickReportForm({ location: '', cases: 1, registered: 0, severity: 'Low' });
        fetchStats(); // Refresh data
        alert('Report added successfully!');
      } else if (res.status === 401) {
        // Token is invalid or expired - logout and redirect
        setShowQuickReport(false);
        console.error('Authentication failed:', data.error);
        logout();
        alert('Your session has expired. Please login again to continue.');
        navigate('/login');
      } else {
        const errorMsg = data.error || 'Failed to add report';
        console.error('Failed to add report:', errorMsg);
        alert(`Failed to add report: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Error adding report:', err);
      alert(`Error adding report: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };


  const MapToggle = () => {
    if (!showMap) {
      return (
        <div className="glass-panel card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(14, 165, 233, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MapPin size={24} color="var(--primary)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>Interactive Health Map</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>View real-time disease distribution across regions</div>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowMap(true)}>Load Map</button>
        </div>
      );
    }
    return <HealthMap />;
  };

  return (
    <ErrorBoundary>
      <div className="container">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Hero Section with Video Background */}
          <motion.div
            variants={itemVariants}
            className="hero-section"
            style={{
              position: 'relative',
              padding: '3.5rem 2.5rem',
              borderRadius: '1.5rem',
              marginBottom: '2.5rem',
              textAlign: 'center',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.3)',
              overflow: 'hidden',
              minHeight: '400px'
            }}
          >
            {/* Video Background */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 0,
              overflow: 'hidden'
            }}>
              <video
                autoPlay
                muted
                playsInline
                ref={(el) => {
                  if (el) {
                    el.playbackRate = 0.9; // Slightly slower for more majestic feel
                    // When video metadata loads, set the loop point
                    el.ontimeupdate = () => {
                      if (el.duration && el.currentTime > el.duration - 3) {
                        el.currentTime = 3; // Loop back to 3 seconds (skipping first 3s)
                      }
                    };
                  }
                }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  minWidth: '100%',
                  minHeight: '100%',
                  width: 'auto',
                  height: 'auto',
                  transform: 'translate(-50%, -50%)',
                  objectFit: 'cover',
                  opacity: 0.85
                }}
              >
                <source src="/videos/ne-nature.mp4#t=3" type="video/mp4" />
                {/* Fallback to image if video doesn't load */}
              </video>

            </div>

            {/* Gradient Overlays for better text readability */}
            <div style={{
              position: 'absolute',
            }} />

            {/* Light Gradient Overlay for Text Readability */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to bottom, rgba(6, 78, 59, 0.3), rgba(6, 78, 59, 0.5))',
              zIndex: 1,
              pointerEvents: 'none'
            }} />

            {/* Content - positioned above video */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(4px)',
                  borderRadius: '2rem',
                  marginBottom: '1.5rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <Mountain size={16} color="#34d399" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ecfdf5' }}>
                  Northeast India Health Initiative
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: '3.5rem',
                  fontWeight: 800,
                  marginBottom: '1rem',
                  background: 'linear-gradient(to right, #ffffff, #a7f3d0)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
              >
                Smart Health Dashboard
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                  maxWidth: '650px',
                  margin: '0 auto',
                  fontSize: '1.05rem',
                  lineHeight: '1.6',
                  color: '#d1fae5',
                  fontWeight: 500,
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}
              >
                Real-time monitoring and early warning system for water-borne diseases across rural communities
              </motion.p>
            </div>
          </motion.div>

          {/* Stats Grid - Enhanced */}
          <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
            <motion.div variants={itemVariants} whileHover={cardHover} className="glass-panel card stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <Activity size={32} />
              </div>
              <div>
                <div className="stat-value"><Counter from={0} to={stats.totalReports} /></div>
                <div className="stat-label">Total Reports</div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={cardHover} className="glass-panel card stat-card">
              <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                <AlertTriangle size={32} />
              </div>
              <div>
                <div className="stat-value"><Counter from={0} to={stats.highSeverity} /></div>
                <div className="stat-label">Critical Cases</div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={cardHover} className="glass-panel card stat-card">
              <div className="stat-icon" style={{ background: 'rgba(14, 165, 233, 0.1)', color: '#0ea5e9' }}>
                <Droplets size={32} />
              </div>
              <div>
                <div className="stat-value"><Counter from={0} to={Object.keys(stats.locations || {}).length} /></div>
                <div className="stat-label">Monitored Villages</div>
              </div>
            </motion.div>
          </div>

          {/* Charts Section - Side by Side */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
            {/* Bar Chart */}
            <motion.div variants={itemVariants} className="glass-panel card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                    <BarChart size={20} color="#10b981" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Village Health Status</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Top 10 affected locations</p>
                  </div>
                </div>
                {isAuthenticated() && (['health_worker', 'admin', 'national_admin'].includes(user?.role)) && (
                  <motion.button
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowQuickReport(true)}
                  >
                    <Plus size={16} />
                    Add Case
                  </motion.button>
                )}
              </div>

              <div style={{ height: '300px' }}>
                {chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 70 }}>
                      <defs>
                        <linearGradient id="casesGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                        </linearGradient>
                        <linearGradient id="registeredGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.9} />
                          <stop offset="100%" stopColor="#0284c7" stopOpacity={0.7} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" strokeOpacity={0.2} />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                        tick={{ fill: 'var(--text-main)', fontSize: 11, fontWeight: 500 }}
                        stroke="var(--border-color)"
                      />
                      <YAxis
                        tick={{ fill: 'var(--text-main)', fontSize: 12 }}
                        stroke="var(--border-color)"
                        allowDecimals={false}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(16, 185, 129, 0.05)' }}
                        contentStyle={{
                          backgroundColor: 'var(--bg-card)',
                          border: '2px solid var(--primary)',
                          borderRadius: '12px',
                          padding: '12px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
                        }}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: '15px', fontSize: '13px', fontWeight: 600 }}
                        iconType="circle"
                      />
                      <Bar dataKey="cases" fill="url(#casesGradient)" radius={[8, 8, 0, 0]} name="Total Cases" />
                      <Bar dataKey="registered" fill="url(#registeredGradient)" radius={[8, 8, 0, 0]} name="Registered" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <FileText size={56} opacity={0.3} />
                    <p style={{ marginTop: '1rem', fontWeight: 600 }}>No data available</p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Submit reports to see statistics</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Pie Chart */}
            <motion.div variants={itemVariants} className="glass-panel card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
                    <AlertTriangle size={20} color="#ef4444" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.25rem' }}>Severity Distribution</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Case priority breakdown</p>
                  </div>
                </div>
              </div>

              <div style={{ height: '300px' }}>
                {severityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={severityData}
                        cx="50%"
                        cy="45%"
                        labelLine={{ stroke: 'var(--text-muted)', strokeWidth: 1 }}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={85}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {severityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--bg-card)" strokeWidth={3} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-card)',
                          border: '2px solid var(--primary)',
                          borderRadius: '12px',
                          padding: '12px'
                        }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={40}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '13px', fontWeight: 600 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <AlertTriangle size={56} opacity={0.3} />
                    <p style={{ marginTop: '1rem', fontWeight: 600 }}>No severity data</p>
                    <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Data will appear once reports are submitted</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Map Section */}
          <motion.div variants={itemVariants} style={{ marginBottom: '2.5rem' }}>
            <ErrorBoundary>
              <MapToggle />
            </ErrorBoundary>
          </motion.div>

          {/* Quick Actions & Updates */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <motion.div variants={itemVariants} className="glass-panel card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Users size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Quick Actions</h3>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Report Issue - All Authenticated Users */}
                {isAuthenticated() && (['community', 'health_worker', 'admin', 'national_admin'].includes(user?.role)) && (
                  <Link to="/report">
                    <motion.button
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'space-between', padding: '1rem 1.5rem' }}
                      whileHover={{ scale: 1.02, boxShadow: '0 12px 24px rgba(16, 185, 129, 0.3)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <FilePlus size={20} />
                        Report Health Issue
                      </span>
                      <ArrowRight size={18} />
                    </motion.button>
                  </Link>
                )}



                {/* Active Alerts - Visible to All */}
                <Link to="/alerts">
                  <motion.button
                    className="btn"
                    style={{ width: '100%', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', justifyContent: 'space-between', padding: '1rem 1.5rem' }}
                    whileHover={{ scale: 1.02, borderColor: 'var(--primary)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>View Active Alerts</span>
                    <ArrowRight size={18} />
                  </motion.button>
                </Link>

                {/* Pending Requests - Admin Only */}
                {isAuthenticated() && (['admin', 'national_admin'].includes(user?.role)) && (
                  <Link to="/alerts">
                    <motion.button
                      className="btn"
                      style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', justifyContent: 'space-between', padding: '1rem 1.5rem', marginTop: '0.5rem' }}
                      whileHover={{ scale: 1.02, background: 'rgba(239, 68, 68, 0.2)' }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Activity size={20} />
                        Pending Approvals
                      </span>
                      <ArrowRight size={18} />
                    </motion.button>
                  </Link>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="glass-panel card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Clock size={24} color="var(--primary)" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Recent Updates</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Droplets size={20} color="#10b981" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>Water Quality Improved</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>5 villages received new filtration systems</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>2h ago</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'var(--bg-glass)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(14, 165, 233, 0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertTriangle size={20} color="#0ea5e9" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>Monsoon Alert Issued</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Precautions for low-lying areas</div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0 }}>5h ago</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Report Modal */}
          <AnimatePresence>
            {showQuickReport && (
              <motion.div
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowQuickReport(false)}
              >
                <motion.div
                  className="modal-content"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Quick Add Case</h3>
                    <button onClick={() => setShowQuickReport(false)} className="btn-icon-only">
                      <X size={20} />
                    </button>
                  </div>

                  <form onSubmit={handleQuickReport}>
                    <div className="form-group">
                      <label className="form-label">Village/Location</label>
                      <input
                        type="text"
                        className="form-input"
                        required
                        value={quickReportForm.location}
                        onChange={(e) => setQuickReportForm({ ...quickReportForm, location: e.target.value })}
                        placeholder="e.g., Guwahati"
                        autoFocus
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Total Cases</label>
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        value={quickReportForm.cases}
                        onChange={(e) => setQuickReportForm({ ...quickReportForm, cases: parseInt(e.target.value) || 1 })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Registered Cases</label>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        value={quickReportForm.registered}
                        onChange={(e) => setQuickReportForm({ ...quickReportForm, registered: parseInt(e.target.value) || 0 })}
                      />
                      <small style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                        Officially registered with health authorities
                      </small>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Severity</label>
                      <select
                        className="form-select"
                        value={quickReportForm.severity}
                        onChange={(e) => setQuickReportForm({ ...quickReportForm, severity: e.target.value })}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: '100%' }}
                      disabled={submitting}
                    >
                      {submitting ? 'Adding...' : 'Add Case'}
                    </button>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

        </motion.div>
      </div >
    </ErrorBoundary >
  );
};

export default Dashboard;
