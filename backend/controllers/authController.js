const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../emailService');

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    console.log('📝 Register attempt for:', email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already used' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    console.log('🔑 Generated token:', verificationToken);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
      verificationToken,
      isVerified: false
    });

    await newUser.save();
    console.log('✅ User saved with token:', newUser.verificationToken);

    try {
      await sendVerificationEmail(newUser.email, newUser.name, verificationToken);
      console.log(`✅ Verification email sent to ${newUser.email}`);
    } catch (emailError) {
      console.log('Verification email failed (continuing):', emailError.message);
    }

    res.status(201).json({
      message: 'Account created! Please check your email to verify your account.',
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in. Check your inbox.',
        notVerified: true
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// VERIFY email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    console.log('🔍 Verifying token:', token);

    const user = await User.findOne({ verificationToken: token });
    console.log('👤 Found user:', user ? user.email : 'NOT FOUND');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account already verified' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully! You can now log in.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE current user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword, skills } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already used by another account' });
      }
      user.email = email;
    }

    if (skills && Array.isArray(skills)) {
      user.skills = skills;
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};