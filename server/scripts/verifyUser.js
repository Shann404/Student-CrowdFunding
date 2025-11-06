// scripts/verifyUser.js
const mongoose = require('mongoose');
const User = require('../models/User');

const verifyUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-crowdfunding');
    
    const user = await User.findOne({ email: 'bahatishann@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found in database:');
    console.log('Name:', user.name);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('isVerified:', user.isVerified);
    console.log('Created:', user.createdAt);
    console.log('Password hash length:', user.password.length);
    
    // Test the password
    const bcrypt = require('bcryptjs');
    const testPassword = await bcrypt.compare('admin123', user.password);
    console.log('Password "admin123" matches:', testPassword);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

verifyUser();