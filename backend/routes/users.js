const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Group = require('../models/Group');
const auth = require('../middleware/auth');

// Middleware to check for Admin role
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

// --- ADMIN ROUTES ---

// Get all users (Admin only)
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const users = await User.find()
            .select('-password -notifications')
            .sort({ createdAt: -1 })
            .lean();
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Create a new user (Admin only)
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'Player'
        });

        await user.save();

        res.status(201).json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// --- PUBLIC/PLAYER ROUTES ---

// Get master leaderboard (top 100 globally)
router.get('/leaderboard', async (req, res) => {
    try {
        const users = await User.find({ role: 'Player' })
            .select('-password -notifications')
            .sort({ totalPoints: -1 })
            .limit(100)
            .lean();
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get current user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Find all groups this user is a member of
        const joinedGroups = await Group.find({ members: req.user.id })
            .select('name description pointsMap')
            .lean();

        // Calculate group-specific data
        const groupStats = joinedGroups.map(group => {
            let membersPoints = [];
            // group.pointsMap is a plain object because of .lean()
            if (group.pointsMap) {
                for (const [userId, points] of Object.entries(group.pointsMap)) {
                    membersPoints.push({ userId, points });
                }
            }
            membersPoints.sort((a, b) => b.points - a.points);

            const userEntryIndex = membersPoints.findIndex(m => m.userId.toString() === req.user.id);
            const rank = userEntryIndex !== -1 ? userEntryIndex + 1 : null;
            const pointsInGroup = group.pointsMap ? (group.pointsMap[req.user.id] || 0) : 0;

            return {
                groupId: group._id,
                name: group.name,
                points: pointsInGroup,
                rank
            };
        });

        res.json({
            user,
            groups: groupStats
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update current user profile (Name, Avatar)
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, avatar } = req.body;

        // Build user object to update
        const profileFields = {};
        if (name) profileFields.name = name;
        if (avatar !== undefined) profileFields.avatar = avatar; // Allow null to reset

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update password
router.put('/password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Please provide both passwords' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
