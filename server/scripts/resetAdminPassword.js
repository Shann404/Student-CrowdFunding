// scripts/resetAdminPassword.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const resetAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-crowdfunding');
    
    const user = await User.findOne({ email: 'bahatishann@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('🔑 Resetting password...');
    
    // Reset password using the same method as your User model
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash('admin123', salt);
    await user.save();
    
    console.log('✅ Password reset successfully!');
    console.log('📧 Email: bahatishann@gmail.com');
    console.log('🔑 Password: admin123');
    console.log('👑 Role: admin');
    
    // Verify the new password works
    const isMatch = await bcrypt.compare('admin123', user.password);
    console.log('✅ Password verification test:', isMatch);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

resetAdminPassword();