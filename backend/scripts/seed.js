require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding');

        const adminEmail = 'super-user@uno.com';
        let adminUser = await User.findOne({ email: adminEmail });

        if (!adminUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('Wazowski@#123', salt);

            adminUser = new User({
                name: 'Super User',
                email: adminEmail,
                password: hashedPassword,
                role: 'Admin',
                totalPoints: 0
            });

            await adminUser.save();
            console.log('Admin user Admin007 seeded successfully');
        } else {
            console.log('Admin user already exists');
        }

        mongoose.disconnect();
    } catch (err) {
        console.error(err);
        mongoose.disconnect();
        process.exit(1);
    }
};

seedAdmin();
