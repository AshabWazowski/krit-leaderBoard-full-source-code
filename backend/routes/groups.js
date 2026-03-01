const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Middleware to check for Admin role
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin only.' });
    }
};

// @route   GET /api/groups
// @desc    Get all groups
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('adminId', 'name')
            .select('-pointsMap') // Keep members and joinRequests
            .lean();
        res.json(groups);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/groups/:id
// @desc    Get group details (members & points & requests)
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('members', 'name email totalPoints')
            .populate('joinRequests', 'name email');

        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is a member or admin
        if (!group.members.some(member => member._id.toString() === req.user.id) && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not a member of this group' });
        }

        // Format the response to include the rank and points easily consumable by frontend
        const leaderboard = [];
        for (const member of group.members) {
            const points = group.pointsMap.get(member._id.toString()) || 0;
            leaderboard.push({
                _id: member._id,
                name: member.name,
                email: member.email,
                totalPoints: member.totalPoints,
                groupPoints: points
            });
        }

        // Sort leaderboard by groupPoints descending
        leaderboard.sort((a, b) => b.groupPoints - a.groupPoints);

        res.json({
            ...group._doc,
            leaderboard
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/groups/:id/messages
// @desc    Get all messages for a specific group
// @access  Private
router.get('/:id/messages', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        // Check if user is a member or admin
        if (!group.members.some(member => member.toString() === req.user.id) && req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Not a member of this group' });
        }

        const Message = require('../models/Message');
        const messages = await Message.find({ group: req.params.id })
            .populate('sender', 'name avatar')
            .sort({ createdAt: 1 }) // Oldest first for chat history
            .lean();

        res.json(messages);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/groups/:id/request-join
// @desc    Request to join a group
// @access  Private
router.post('/:id/request-join', auth, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (group.members.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        if (group.joinRequests.includes(req.user.id)) {
            return res.status(400).json({ message: 'Join request already sent' });
        }

        group.joinRequests.push(req.user.id);
        await group.save();

        res.json({ message: 'Join request sent successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// --- ADMIN ROUTES ---

// @route   POST /api/groups/:id/add-user
// @desc    Add a specific user to the group
// @access  Private Admin
router.post('/:id/add-user', auth, adminOnly, async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (group.members.includes(userId)) {
            return res.status(400).json({ message: 'User is already a member of this group' });
        }

        group.members.push(userId);
        if (!group.pointsMap.has(userId)) {
            group.pointsMap.set(userId, 0); // Initialize points to 0
        }

        // Remove from joinRequests if present
        group.joinRequests = group.joinRequests.filter(reqId => reqId.toString() !== userId.toString());

        await group.save();

        res.json({ message: 'User added to group successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/groups/:id/remove-user
// @desc    Remove a specific user from the group
// @access  Private Admin
router.post('/:id/remove-user', auth, adminOnly, async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const group = await Group.findById(req.params.id);
        if (!group) {
            return res.status(404).json({ message: 'Group not found' });
        }

        if (!group.members.includes(userId)) {
            return res.status(400).json({ message: 'User is not a member of this group' });
        }

        group.members = group.members.filter(memberId => memberId.toString() !== userId.toString());
        group.pointsMap.delete(userId); // Use map delete for Maps

        await group.save();

        res.json({ message: 'User removed from group successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/groups/:id/approve-request
// @desc    Approve a join request
// @access  Private Admin
router.post('/:id/approve-request', auth, adminOnly, async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (!group.joinRequests.includes(userId)) {
            return res.status(400).json({ message: 'No pending request for this user' });
        }

        // Move from requests to members
        group.joinRequests = group.joinRequests.filter(reqId => reqId.toString() !== userId.toString());
        if (!group.members.includes(userId)) {
            group.members.push(userId);
            if (!group.pointsMap.has(userId)) {
                group.pointsMap.set(userId, 0);
            }
        }
        await group.save();

        res.json({ message: 'Join request approved' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/groups/:id/reject-request
// @desc    Reject a join request
// @access  Private Admin
router.post('/:id/reject-request', auth, adminOnly, async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        // Remove from requests
        group.joinRequests = group.joinRequests.filter(reqId => reqId.toString() !== userId.toString());
        await group.save();

        res.json({ message: 'Join request rejected' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/groups
// @desc    Create a group
// @access  Private Admin
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { name, description } = req.body;
        let group = await Group.findOne({ name });

        if (group) {
            return res.status(400).json({ message: 'Group with this name already exists' });
        }

        group = new Group({
            name,
            description,
            adminId: req.user.id,
            pointsMap: {} // Initialize empty map
        });

        await group.save();
        res.json(group);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   DELETE /api/groups/:id
// @desc    Delete a group
// @access  Private Admin
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        await Group.findByIdAndDelete(req.params.id);
        res.json({ message: 'Group removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   POST /api/groups/:id/points
// @desc    Adjust points for a player in a group
// @access  Private Admin
router.post('/:id/points', auth, adminOnly, async (req, res) => {
    try {
        const { userId, pointsChange } = req.body; // pointsChange can be positive or negative

        if (!userId || pointsChange === undefined) {
            return res.status(400).json({ message: 'userId and pointsChange required' });
        }

        const group = await Group.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (!group.members.includes(userId)) {
            return res.status(400).json({ message: 'User is not a member of this group' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update group specific points
        const currentGroupPoints = group.pointsMap.get(userId) || 0;
        const newGroupPoints = currentGroupPoints + pointsChange;
        group.pointsMap.set(userId, newGroupPoints);
        await group.save();

        // Update global user points
        user.totalPoints += pointsChange;

        // Create a notification
        const changeWord = pointsChange >= 0 ? 'added' : 'deducted';
        const amountStr = Math.abs(pointsChange);
        const message = `Admin ${changeWord} ${amountStr} point(s) for your rank in group: ${group.name}`;

        // Format Date: DD/MM/YYYY - hh:mm am/pm
        const now = new Date();
        const pad = (n) => n.toString().padStart(2, '0');
        let hours = now.getHours();
        const ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} - ${pad(hours)}:${pad(now.getMinutes())} ${ampm}`;

        const notification = {
            message,
            date: dateStr
        };

        user.notifications.unshift(notification); // Add to the beginning

        // Keep only last 20 notifications to save space (optional but good practice)
        if (user.notifications.length > 20) {
            user.notifications = user.notifications.slice(0, 20);
        }

        await user.save();

        res.json({
            message: 'Points updated successfully',
            groupPoints: newGroupPoints,
            totalPoints: user.totalPoints
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
