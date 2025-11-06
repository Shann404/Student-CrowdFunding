// scripts/createVerifiedUser.js
const mongoose = require('mongoose');
const User = require('../models/User');

const createVerifiedUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-crowdfunding');
    
    // Delete existing user
    await User.deleteOne({ email: 'test@test.com' });
    
    // Create new user - let Mongoose handle the password hashing
    const user = new User({
      name: 'Test User',
      email: 'test@test.com',
      password: 'test123', // Plain text - will be hashed by pre-save hook
      role: 'admin',
      isVerified: true
    });

    await user.save();
    
    console.log('Fresh test user created!');
    console.log('Email: test@test.com');
    console.log(' Password: test123');
    console.log('Role: admin');
    
    // Test login immediately
    const testUser = await User.findOne({ email: 'test@test.com' });
    const isMatch = await testUser.comparePassword('test123');
    console.log('Password verification test:', isMatch);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

createVerifiedUser();