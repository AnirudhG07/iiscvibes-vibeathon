const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateRequest, schemas } = require('../middleware/validation');
const { addToJsonFile, findInJsonFile } = require('../utils/fileUtils');
const emailService = require('../utils/emailService');

const router = express.Router();

// Register new speaker
router.post('/register', validateRequest(schemas.register), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      mobile,
      track,
      sessionCategory,
      tshirtSize,
      speaker2Name,
      speaker2Email,
      speaker2TshirtSize,
      foodChoice,
      bloodGroup,
      emergencyContactName,
      emergencyContactNumber,
      linkedinProfile,
      sapCommunityUrl
    } = req.body;

    // Check if user already exists
    const existingUser = await findInJsonFile('users.json', user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user object
    const userData = {
      name,
      email,
      password: hashedPassword,
      role: 'speaker',
      mobile,
      track,
      sessionCategory,
      tshirtSize,
      speaker2Name: speaker2Name || null,
      speaker2Email: speaker2Email || null,
      speaker2TshirtSize: speaker2TshirtSize || null,
      foodChoice,
      bloodGroup: bloodGroup || null,
      emergencyContactName: emergencyContactName || null,
      emergencyContactNumber: emergencyContactNumber || null,
      linkedinProfile: linkedinProfile || null,
      sapCommunityUrl: sapCommunityUrl || null,
      isActive: true,
      registrationCompleted: true,
      qrCodeGenerated: false,
      tshirtCollected: false,
      checkedIn: false
    };

    // Save user
    const newUser = await addToJsonFile('users.json', userData);

    // Send welcome email
    await emailService.sendEmail(
      email,
      `Welcome to ${process.env.EVENT_NAME}!`,
      emailService.getRegistrationConfirmationTemplate(name, process.env.EVENT_NAME)
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// Login
router.post('/login', validateRequest(schemas.login), async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await findInJsonFile('users.json', u => u.email === email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
});

// Create default admin user (for demo purposes)
router.post('/create-admin', async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Check if admin already exists
    const existingAdmin = await findInJsonFile('users.json', user => user.email === adminEmail);
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin user already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create admin user
    const adminData = {
      name: 'Event Manager',
      email: adminEmail,
      password: hashedPassword,
      role: 'event_manager',
      mobile: '9999999999',
      isActive: true,
      registrationCompleted: true
    };

    const newAdmin = await addToJsonFile('users.json', adminData);

    res.status(201).json({
      message: 'Admin user created successfully',
      admin: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ message: 'Admin creation failed', error: error.message });
  }
});

module.exports = router;