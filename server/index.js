require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'purnavidyadharg@gmail.com',
        pass: 'ivgw udsg aoic bxxg'
    }
});
const cors = require('cors');
const connectDB = require('./config/db');
const {
    ROLES,
    generateToken,
    hashPassword,
    comparePassword,
    authenticate,
    authorize
} = require('./auth');

// Import Models
const User = require('./models/User');
const Report = require('./models/Report');
const Alert = require('./models/Alert');
const ContactGroup = require('./models/ContactGroup');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// ============ AUTH ROUTES ============

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role, location, phoneNumber } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }

        // Validate role
        const validRoles = [ROLES.COMMUNITY, ROLES.HEALTH_WORKER, ROLES.NATIONAL_ADMIN];
        const userRole = validRoles.includes(role) ? role : ROLES.COMMUNITY;

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: userRole,
            location: location || 'Assam', // Default if missing
            phoneNumber: phoneNumber || ''
        });

        // Generate token
        const token = generateToken(newUser._id, newUser.role);

        // Return user without password
        const userResponse = {
            id: newUser._id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt
        };

        res.status(201).json({
            user: userResponse,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = generateToken(user._id, user.role);

        // Return user without password
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        res.json({
            user: userResponse,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Get current user profile
app.get('/api/auth/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        res.json(userResponse);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all users (Admin only)
app.get('/api/users', authenticate, authorize(ROLES.ADMIN, ROLES.NATIONAL_ADMIN), async (req, res) => {
    try {
        const users = await User.find().select('-password');

        const usersResponse = users.map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        }));

        res.json(usersResponse);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ REPORT ROUTES ============

// Get all reports (Protected: Health Workers & Admins only)
app.get('/api/reports', authenticate, authorize(ROLES.HEALTH_WORKER, ROLES.ADMIN, ROLES.NATIONAL_ADMIN), async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('userId', 'name email')
            .sort({ timestamp: -1 });

        res.json(reports);
    } catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new report (Protected: Community, Health Workers & Admins)
app.post('/api/reports', authenticate, authorize(ROLES.COMMUNITY, ROLES.HEALTH_WORKER, ROLES.ADMIN, ROLES.NATIONAL_ADMIN), async (req, res) => {
    try {
        console.log('POST /api/reports - User:', req.user);
        console.log('Request body:', req.body);

        const { state, location, symptoms, waterSource, severity, notes, count = 1, registeredCases = 0 } = req.body;

        if (!location || !symptoms || !waterSource) {
            console.log('Validation failed - Missing fields:', { location, symptoms, waterSource });
            return res.status(400).json({ error: 'Missing required fields: location, symptoms, and waterSource are required' });
        }

        const numCases = parseInt(count) || 1;
        const registeredCasesNum = parseInt(registeredCases) || 0;
        const newReports = [];

        for (let i = 0; i < numCases; i++) {
            const newReport = await Report.create({
                userId: req.user.userId,
                state: state || 'Assam',
                location,
                symptoms: Array.isArray(symptoms) ? symptoms : [symptoms],
                waterSource,
                severity: severity || 'Low',
                notes: notes || '',
                registeredCases: registeredCasesNum
            });

            newReports.push(newReport);
        }

        console.log(`Successfully added ${numCases} report(s) for location: ${location}`);

        // Populate user data before sending response
        const populatedReports = await Report.find({
            _id: { $in: newReports.map(r => r._id) }
        }).populate('userId', 'name email');

        res.status(201).json(
            numCases === 1
                ? populatedReports[0]
                : { message: `Added ${numCases} cases successfully`, reports: populatedReports }
        );
    } catch (error) {
        console.error('Create report error:', error);
        res.status(500).json({ error: 'Server error creating report' });
    }
});

// Get public map data (anonymized)
app.get('/api/map-data', async (req, res) => {
    try {
        const reports = await Report.find()
            .select('location state symptoms waterSource severity timestamp registeredCases -_id')
            .sort({ timestamp: -1 });

        res.json(reports);
    } catch (error) {
        console.error('Get map data error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ CONTACT GROUP ROUTES ============

// Get contact groups (mine + shared?)
// For now, let's say admins see all, workers see their own.
app.get('/api/contacts', authenticate, authorize(ROLES.HEALTH_WORKER, ROLES.ADMIN, ROLES.NATIONAL_ADMIN), async (req, res) => {
    try {
        const query = {};
        // If high level admin, maybe see all? For now simplify: see your own created groups.
        // Or if we want shared groups, we might need a 'isPublic' flag.
        // Let's allow Admins to see ALL groups, Workers see their own.
        if (req.user.role !== ROLES.ADMIN && req.user.role !== ROLES.NATIONAL_ADMIN) {
            query.createdBy = req.user.userId;
        }

        const groups = await ContactGroup.find(query).sort({ createdAt: -1 });
        res.json(groups);
    } catch (error) {
        console.error('Get contact groups error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create contact group
app.post('/api/contacts', authenticate, authorize(ROLES.HEALTH_WORKER, ROLES.ADMIN, ROLES.NATIONAL_ADMIN), async (req, res) => {
    try {
        const { name, type, contacts, description } = req.body;

        if (!name || !contacts || !Array.isArray(contacts) || contacts.length === 0) {
            return res.status(400).json({ error: 'Name and a list of contacts are required' });
        }

        const newGroup = await ContactGroup.create({
            name,
            type: type || 'mixed',
            contacts: contacts.map(c => c.trim()).filter(Boolean),
            description,
            createdBy: req.user.userId
        });

        res.status(201).json(newGroup);
    } catch (error) {
        console.error('Create contact group error:', error);
        res.status(500).json({ error: 'Server error creating group' });
    }
});

// Delete contact group
app.delete('/api/contacts/:id', authenticate, authorize(ROLES.HEALTH_WORKER, ROLES.ADMIN, ROLES.NATIONAL_ADMIN), async (req, res) => {
    try {
        const group = await ContactGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ error: 'Group not found' });

        // Authorization: Admin can delete all, Worker only own
        const isAdmin = req.user.role === ROLES.ADMIN || req.user.role === ROLES.NATIONAL_ADMIN;
        if (!isAdmin && group.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Not authorized to delete this group' });
        }

        await ContactGroup.findByIdAndDelete(req.params.id);
        res.json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Delete contact group error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


// ============ STATS ROUTES ============

app.get('/api/stats', async (req, res) => {
    try {
        const totalReports = await Report.countDocuments();
        const highSeverity = await Report.countDocuments({ severity: 'High' });

        // Aggregate reports by location
        const locationStats = await Report.aggregate([
            {
                $group: {
                    _id: '$location',
                    totalCases: { $sum: 1 },
                    registeredCases: { $sum: '$registeredCases' }
                }
            }
        ]);

        // Convert to object format
        const locations = {};
        locationStats.forEach(stat => {
            locations[stat._id] = {
                totalCases: stat.totalCases,
                registeredCases: stat.registeredCases
            };
        });

        res.json({
            totalReports,
            highSeverity,
            locations
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============ ALERTS ROUTES ============

// Get all alerts (Protected: Requires Health Worker or Admin role)
// Get all alerts (Protected: Authenticated users)
app.get('/api/alerts', authenticate, authorize(ROLES.COMMUNITY, ROLES.HEALTH_WORKER, ROLES.ADMIN, ROLES.NATIONAL_ADMIN), async (req, res) => {
    try {
        // Get active alerts from database
        let query = { isActive: true };

        // If Citizen, only show approved alerts
        if (req.user.role === ROLES.COMMUNITY) {
            query.status = 'approved';
        }

        const dbAlerts = await Alert.find(query)
            .sort({ createdAt: -1 })
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name');

        // Also generate automatic alerts based on report counts (only for workers/admins)
        let autoAlerts = [];
        if (req.user.role !== ROLES.COMMUNITY) {
            const locationCounts = await Report.aggregate([
                {
                    $group: {
                        _id: '$location',
                        count: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        count: { $gte: 3 }
                    }
                }
            ]);

            autoAlerts = locationCounts.map(loc => ({
                id: `auto-alert-${loc._id}`,
                location: loc._id,
                level: loc.count >= 10 ? 'Red' : loc.count >= 5 ? 'Orange' : 'Yellow',
                message: `High number of reports (${loc.count}) in ${loc._id}. Potential outbreak detected.`,
                reportCount: loc.count,
                isActive: true,
                status: 'pending', // Auto-alerts start as pending for review? or active? Let's say active/pending.
                // Actually, if we want them to show up in "active alerts" for officials, let's keep them as 'approved' (system approved) or 'pending' if we want manual review.
                // For simplicity, let's make them 'approved' system alerts for now, or just 'active'.
                // Frontend defaults status to 'approved' if undefined.
                createdAt: new Date()
            }));
        }

        // Combine database alerts and auto-generated alerts
        const allAlerts = [...dbAlerts, ...autoAlerts];

        res.json(allAlerts);
    } catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create new alert (Protected: Health Worker or Admin)
// Mock Broadcast Service
// Mock Broadcast Service
const mockBroadcast = async (alert, channels, audience) => {
    console.log(`\n[BROADCAST SYSTEM] Processing Alert Broadcast for: ${alert.location}`);
    console.log(`[BROADCAST SYSTEM] Target Audience: ${audience}`);

    const summary = {
        totalSent: 0,
        recipientTypeCount: { community: 0, health_worker: 0, admin: 0 },
        sentAt: new Date(),
        manualRecipients: { phones: 0, emails: 0 },
        groupRecipients: 0
    };

    try {
        let query = {};
        if (audience === 'affected_area') {
            query = { location: { $regex: new RegExp(alert.location, 'i') } };
        } else if (audience === 'district') {
            query = { location: { $regex: new RegExp(alert.location, 'i') } };
        } else {
            query = {};
        }

        // 1. Gather Users from DB
        const users = await User.find(query).select('email role');
        const emailRecipients = new Set();

        users.forEach(u => {
            if (u.email && u.email.includes('@')) emailRecipients.add(u.email);

            // Stats
            if (summary.recipientTypeCount[u.role] !== undefined) {
                summary.recipientTypeCount[u.role]++;
            } else if (u.role === ROLES.NATIONAL_ADMIN) {
                summary.recipientTypeCount['admin'] = (summary.recipientTypeCount['admin'] || 0) + 1;
            }
        });

        summary.totalSent = users.length;

        // 2. Manual Emails
        if (alert.manualEmails && alert.manualEmails.length > 0) {
            summary.manualRecipients.emails = alert.manualEmails.length;
            alert.manualEmails.forEach(e => {
                const clean = e.trim();
                if (clean && clean.includes('@')) emailRecipients.add(clean);
            });
            summary.totalSent += alert.manualEmails.length;
        }

        // 3. Contact Groups
        if (alert.targetGroups && alert.targetGroups.length > 0) {
            const groups = await ContactGroup.find({ _id: { $in: alert.targetGroups } });
            groups.forEach(group => {
                summary.groupRecipients += group.contacts.length;
                group.contacts.forEach(c => {
                    const clean = c.trim();
                    if (clean && clean.includes('@')) emailRecipients.add(clean);
                });
            });
            summary.totalSent += summary.groupRecipients;
        }

        console.log(`[Email Service] Collected ${emailRecipients.size} unique recipients.`);

        // SEND REAL EMAILS
        if (emailRecipients.size > 0 && channels && channels.includes('email')) {
            const emailList = Array.from(emailRecipients);
            console.log('[Email Service] Starting transmission...');

            // Send emails in parallel
            await Promise.all(emailList.map(async (toEmail) => {
                try {
                    await transporter.sendMail({
                        from: '"Smart Health Alert" <purnavidyadharg@gmail.com>',
                        to: toEmail,
                        subject: `🚨 ${alert.level.toUpperCase()} ALERT: ${alert.location}`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                                <div style="background: ${alert.level === 'critical' || alert.level === 'Red' ? '#ef4444' : alert.level === 'high' || alert.level === 'Orange' ? '#f97316' : '#f59e0b'}; padding: 25px; text-align: center;">
                                    <h1 style="color: white; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">${alert.level} Health Alert</h1>
                                </div>
                                <div style="padding: 30px; background: #ffffff;">
                                    <h2 style="margin-top: 0; color: #1e293b; font-size: 20px;">Alert for ${alert.location}</h2>
                                    <p style="font-size: 16px; color: #475569; line-height: 1.6; background: #f8fafc; padding: 15px; border-radius: 8px; border-left: 4px solid #cbd5e1;">
                                        ${alert.message}
                                    </p>
                                    
                                    <div style="margin-top: 30px; padding: 15px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b; display: flex; justify-content: space-between;">
                                        <span><strong>Date:</strong> ${new Date().toLocaleDateString()}</span>
                                        <span><strong>Source:</strong> Health Department</span>
                                    </div>
                                </div>
                                <div style="background: #f1f5f9; padding: 12px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
                                    Sent via Smart Health System
                                </div>
                            </div>
                        `
                    });
                    console.log(`[Email Service] Sent to ${toEmail}`);
                } catch (err) {
                    console.error(`[Email Service] Failed to send to ${toEmail}:`, err.message);
                }
            }));
            console.log('[Email Service] All emails sent.');
        }

    } catch (error) {
        console.error('[BROADCAST SYSTEM] Error:', error);
    }

    return summary;
};

// Create new alert (Protected: Health Worker or Admin)
app.post('/api/alerts', authenticate, authorize(ROLES.HEALTH_WORKER, ROLES.ADMIN, ROLES.NATIONAL_ADMIN), async (req, res) => {
    try {
        const { location, level, message, channels, targetAudience, manualPhoneNumbers, manualEmails, targetGroups } = req.body;

        if (!location || !level || !message) {
            return res.status(400).json({ error: 'Location, level, and message are required' });
        }

        // Determine initial status based on role
        const isAdmin = req.user.role === ROLES.ADMIN || req.user.role === ROLES.NATIONAL_ADMIN;
        const status = isAdmin ? 'approved' : 'pending';
        const approvalData = isAdmin ? {
            approvedBy: req.user.userId,
            approvedAt: new Date()
        } : {};

        const newAlert = await Alert.create({
            location,
            level,
            message,
            createdBy: req.user.userId,
            status,
            channels: isAdmin ? channels : [],
            targetAudience: targetAudience || 'affected_area',
            manualPhoneNumbers: manualPhoneNumbers || [],
            manualEmails: manualEmails || [],
            targetGroups: targetGroups || [],
            ...approvalData
        });

        const populatedAlert = await Alert.findById(newAlert._id)
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name');


        // If admin created it (auto-approved), broadcast immediately
        let summary;
        if (isAdmin && channels && channels.length > 0) {
            summary = await mockBroadcast(populatedAlert, channels, targetAudience);
            populatedAlert.broadcastSummary = summary;
            await populatedAlert.save();
        }

        res.status(201).json(populatedAlert);
    } catch (error) {
        console.error('Create alert error:', error);
        res.status(500).json({ error: 'Server error creating alert' });
    }
});

// Approve alert (Protected: Admin Only)
app.patch('/api/alerts/:id/approve', authenticate, authorize(ROLES.ADMIN, ROLES.NATIONAL_ADMIN), async (req, res) => {
    try {
        const { channels, targetAudience, manualPhoneNumbers, manualEmails, targetGroups } = req.body;

        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            {
                status: 'approved',
                approvedBy: req.user.userId,
                approvedAt: new Date(),
                channels: channels || [],
                targetAudience: targetAudience || 'affected_area',
                manualPhoneNumbers: manualPhoneNumbers || [],
                manualEmails: manualEmails || [],
                targetGroups: targetGroups || []
            },
            { new: true }
        )
            .populate('createdBy', 'name email')
            .populate('approvedBy', 'name');

        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        // Broadcast
        let summary;
        if (channels && channels.length > 0) {
            summary = await mockBroadcast(alert, channels, targetAudience);
            alert.broadcastSummary = summary;
            await alert.save();
        }

        res.json(alert);
    } catch (error) {
        console.error('Approve alert error:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid Alert ID format' });
        }
        res.status(500).json({ error: 'Server error approving alert' });
    }
});

// Delete alert (Protected)
app.delete('/api/alerts/:id', authenticate, authorize(ROLES.HEALTH_WORKER, ROLES.ADMIN, ROLES.NATIONAL_ADMIN), async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        // Authorization check logic
        const isAdmin = req.user.role === ROLES.ADMIN || req.user.role === ROLES.NATIONAL_ADMIN;
        const isCreator = alert.createdBy && alert.createdBy.toString() === req.user.userId;

        // Admins can delete anything. Workers can only delete their own PENDING alerts.
        if (!isAdmin) {
            if (!isCreator) {
                return res.status(403).json({ error: 'Not authorized to delete this alert' });
            }
            if (alert.status !== 'pending') {
                return res.status(403).json({ error: 'Cannot cancel an alert that is already approved or active' });
            }
        }

        await Alert.findByIdAndDelete(req.params.id);
        res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
        console.error('Delete alert error:', error);
        res.status(500).json({ error: 'Server error deleting alert' });
    }
});

// Update alert status (Protected: Health Worker or Admin)
app.patch('/api/alerts/:id', authenticate, authorize(ROLES.HEALTH_WORKER, ROLES.ADMIN, ROLES.NATIONAL_ADMIN), async (req, res) => {
    try {
        const { isActive } = req.body;

        const alert = await Alert.findByIdAndUpdate(
            req.params.id,
            {
                isActive,
                resolvedAt: isActive ? null : new Date()
            },
            { new: true }
        ).populate('createdBy', 'name email');

        if (!alert) {
            return res.status(404).json({ error: 'Alert not found' });
        }

        res.json(alert);
    } catch (error) {
        console.error('Update alert error:', error);
        res.status(500).json({ error: 'Server error updating alert' });
    }
});

// ============ START SERVER ============

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
