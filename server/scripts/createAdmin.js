// scripts/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust path as needed

const createAdminUser = async () => {
  try {
    // Connect to your database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-crowdfunding');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@edufund.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'System Administrator',
      email: 'bahatishann@gmail.com',
      password: await bcrypt.hash('SNB23022005', 12), // Change this password!
      role: 'admin',
      isVerified: true,
      profilePicture: '',
      phone: '+254715766376'
    });

    await adminUser.save();
    console.log('Admin user created successfully!');
    console.log('Email: bahatishann@gmail.com');
    console.log('Password: SNB23022005'); // Remember to change this!
    console.log('IMPORTANT: Change the default password immediately!');
    
  } catch (error) {
    console.error(' Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
  }
};

createAdminUser();