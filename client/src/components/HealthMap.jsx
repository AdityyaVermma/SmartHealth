import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, CircleMarker } from 'react-leaflet';
import { API_URL } from '../config';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';

// Fix for default Leaflet icon issues in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Cache for geocoded coordinates to avoid repeated API calls
const coordinateCache = {};

// State centers for better fallback positioning
// Predefined coordinates for major NE cities and states to avoid API failures
const PREDEFINED_COORDINATES = {
    // Assam
    'Guwahati': [26.1158, 91.7086],
    'Dispur': [26.1408, 91.7907],
    'Silchar': [24.8173, 92.7791],
    'Dibrugarh': [27.4728, 94.9120],
    'Jorhat': [26.7509, 94.2037],
    'Tezpur': [26.6528, 92.7926],
    'Nagaon': [26.3452, 92.6835],
    'Tinsukia': [27.4922, 95.3567],
    'Bongaigaon': [26.5028, 90.5516],
    // Meghalaya
    'Shillong': [25.5788, 91.8933],
    'Tura': [25.5133, 90.2032],
    'Cherrapunji': [25.2713, 91.7333],
    // Manipur
    'Imphal': [24.8170, 93.9368],
    'Churachandpur': [24.3333, 93.6833],
    // Mizoram
    'Aizawl': [23.7271, 92.7176],
    'Lunglei': [22.8833, 92.7333],
    // Nagaland
    'Kohima': [25.6701, 94.1077],
    'Dimapur': [25.9068, 93.7272],
    // Tripura
    'Agartala': [23.8315, 91.2868],
    'Udaipur': [23.5333, 91.4833],
    // Arunachal Pradesh
    'Itanagar': [27.0844, 93.6053],
    'Tawang': [27.5861, 91.8594],
    'Pasighat': [28.0667, 95.3333],
    // Sikkim
    'Gangtok': [27.3314, 88.6138],
    'Namchi': [27.1667, 88.3500],

    // State Centers (Fallback)
    'Assam': [26.2006, 92.9376],
    'Meghalaya': [25.4670, 91.3662],
    'Arunachal Pradesh': [28.2180, 94.7278],
    'Nagaland': [26.1584, 94.5624],
    'Manipur': [24.6637, 93.9063],
    'Mizoram': [23.1645, 92.9376],
    'Tripura': [23.9408, 91.9882],
    'Sikkim': [27.5330, 88.5122]
};

// Geocode a location name to coordinates using Nominatim API or Predefined Data
const geocodeLocation = async (locationName, stateName = null) => {
    // Check predefined list first (Case insensitive matching)
    const normalizedLoc = Object.keys(PREDEFINED_COORDINATES).find(key =>
        key.toLowerCase() === locationName.toLowerCase()
    );

    if (normalizedLoc) {
        console.log(`Using predefined coordinates for ${locationName}`);
        return PREDEFINED_COORDINATES[normalizedLoc];
    }

    // Check cache
    const cacheKey = stateName ? `${locationName}, ${stateName}` : locationName;
    if (coordinateCache[cacheKey]) {
        return coordinateCache[cacheKey];
    }

    try {
        // Build search query with state if available
        let searchQuery;
        if (stateName && PREDEFINED_COORDINATES[stateName]) {
            searchQuery = encodeURIComponent(`${locationName}, ${stateName}, India`);
        } else {
            searchQuery = encodeURIComponent(`${locationName}, Northeast India`);
        }

        console.log(`Geocoding: ${searchQuery}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1000);

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=1`,
            {
                signal: controller.signal,
                headers: {
                    'User-Agent': 'SmartHealthNE/1.0'
                }
            }
        );
        clearTimeout(timeoutId);

        const data = await response.json();

        if (data && data.length > 0) {
            const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            console.log(`Found coordinates for ${locationName}:`, coords);
            coordinateCache[cacheKey] = coords;
            return coords;
        }
    } catch (error) {
        console.error(`Error geocoding ${locationName}:`, error);
    }

    // Fallback: Use state center from predefined list with small randomization if state is known
    if (stateName && PREDEFINED_COORDINATES[stateName]) {
        const stateCenter = PREDEFINED_COORDINATES[stateName];
        const fallback = [
            stateCenter[0] + (Math.random() - 0.5) * 0.1, // Reduced randomization for better accuracy near state center
            stateCenter[1] + (Math.random() - 0.5) * 0.1
        ];
        console.log(`Using state fallback for ${locationName} in ${stateName}:`, fallback);
        coordinateCache[cacheKey] = fallback;
        return fallback;
    }

    // Final fallback to Northeast India center
    const fallback = [26.1445 + (Math.random() - 0.5) * 0.5, 91.7362 + (Math.random() - 0.5) * 0.5];
    console.log(`Using general fallback for ${locationName}:`, fallback);
    coordinateCache[cacheKey] = fallback;
    return fallback;
};

const HealthMap = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [groupedReports, setGroupedReports] = useState({});

    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchAndProcessReports = async () => {
            try {
                const res = await fetch(`${API_URL}/api/map-data`);
                const data = await res.json();
                setReports(data);

                // Group reports and geocode locations
                const grouped = {};

                for (const report of data) {
                    const loc = report.location || 'Unknown';

                    if (!grouped[loc]) {
                        // Geocode the location with state context if available
                        const coordinates = await geocodeLocation(loc, report.state);

                        grouped[loc] = {
                            reports: [],
                            coordinates: coordinates,
                            severityScore: 0
                        };

                        // Add small delay to respect API rate limits
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }

                    grouped[loc].reports.push(report);

                    // Calculate severity score for color coding the aggregate marker
                    const score = report.severity === 'High' ? 3 : report.severity === 'Medium' ? 2 : 1;
                    grouped[loc].severityScore = Math.max(grouped[loc].severityScore, score);
                }

                setGroupedReports(grouped);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching reports for map:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAndProcessReports();

        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            console.log('Auto-refreshing map data...');
            fetchAndProcessReports();
        }, 30000);

        return () => clearInterval(interval);
    }, [refreshKey]);

    const handleManualRefresh = () => {
        setLoading(true);
        setRefreshKey(prev => prev + 1);
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'high': return '#ef4444'; // Red
            case 'medium': return '#f59e0b'; // Amber
            case 'low': return '#10b981'; // Emerald
            default: return '#3b82f6'; // Blue
        }
    };

    if (loading) return <div className="glass-panel card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Map Data...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel card"
            style={{ padding: 0, overflow: 'hidden', height: '500px', position: 'relative' }}
        >
            <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                zIndex: 1000,
                background: 'var(--bg-glass)',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border-color)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <div style={{ padding: '0.4rem', background: 'var(--primary-gradient)', borderRadius: '0.4rem' }}>
                    <Navigation size={18} color="white" />
                </div>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Live Sensor Map</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Real-time outbreak monitoring</p>
                </div>
            </div>

            <MapContainer
                center={[26.1445, 91.7362]}
                zoom={7}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    className="map-tiles"
                />

                {Object.entries(groupedReports).map(([location, data]) => {
                    const maxSeverity = data.severityScore === 3 ? 'High' : data.severityScore === 2 ? 'Medium' : 'Low';
                    const color = getSeverityColor(maxSeverity);

                    if (!data.coordinates || data.coordinates.length !== 2 || isNaN(data.coordinates[0]) || isNaN(data.coordinates[1])) {
                        console.warn(`Invalid coordinates for ${location}:`, data.coordinates);
                        return null;
                    }

                    return (
                        <CircleMarker
                            key={location}
                            center={data.coordinates}
                            pathOptions={{
                                color: color,
                                fillColor: color,
                                fillOpacity: 0.6,
                                weight: 2
                            }}
                            radius={10 + (data.reports.length * 2)}
                        >
                            <Popup className="glass-popup">
                                <div style={{ minWidth: '200px' }}>
                                    <h4 style={{ margin: '0 0 0.5rem 0', borderBottom: '1px solid #eee', paddingBottom: '0.3rem' }}>{location}</h4>
                                    <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                                        <strong>Status: </strong>
                                        <span style={{ color: color, fontWeight: 'bold' }}>{maxSeverity} Risk</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                        {data.reports.length} Active Reports
                                    </div>
                                    <div style={{ marginTop: '0.5rem', maxHeight: '100px', overflowY: 'auto' }}>
                                        {data.reports.slice(0, 3).map((r, i) => (
                                            <div key={i} style={{ fontSize: '0.75rem', marginBottom: '0.25rem', padding: '0.25rem', background: '#f8fafc', borderRadius: '4px' }}>
                                                {(Array.isArray(r.symptoms) ? r.symptoms.join(', ') : r.symptoms)} ({r.waterSource})
                                            </div>
                                        ))}
                                        {data.reports.length > 3 && <div style={{ fontSize: '0.7rem', color: '#999', fontStyle: 'italic' }}>+ {data.reports.length - 3} more</div>}
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>

            {/* Legend */}
            <div style={{
                position: 'absolute',
                bottom: '1.5rem',
                right: '1.5rem',
                zIndex: 1000,
                background: 'var(--bg-glass)',
                padding: '1rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--border-color)',
                backdropFilter: 'blur(10px)'
            }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Risk Levels</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }}></div>
                        <span>High (Critical)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></div>
                        <span>Medium (Warning)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></div>
                        <span>Low (Safe)</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default HealthMap;
