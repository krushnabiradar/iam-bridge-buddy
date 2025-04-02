
const User = require('../models/user.model');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');

// Helper to generate JWT
const generateToken = (user) => {
  const roleIds = user.roles.map(role => 
    typeof role === 'object' ? role._id : role
  );
  
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      roles: roleIds,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Setup MFA for a user
exports.setupMfa = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Generate a secret
    const secret = speakeasy.generateSecret({
      name: `IAM App (${req.user.email})`,
      issuer: 'IAM Application'
    });
    
    // Store temporary secret for the user
    await User.findByIdAndUpdate(userId, { 
      'mfaTemp.secret': secret.base32,
      'mfaTemp.createdAt': new Date()
    });
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);
    
    res.status(200).json({
      message: 'MFA setup initialized',
      qrCodeUrl,
      secretKey: secret.base32
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({ message: 'Failed to setup MFA', error: error.message });
  }
};

// Enable MFA after verification
exports.enableMfa = async (req, res) => {
  try {
    const { verificationCode } = req.body;
    const userId = req.user._id;
    
    // Get the user with temp secret
    const user = await User.findById(userId);
    
    if (!user.mfaTemp || !user.mfaTemp.secret) {
      return res.status(400).json({ message: 'MFA setup not initialized' });
    }
    
    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.mfaTemp.secret,
      encoding: 'base32',
      token: verificationCode
    });
    
    if (!verified) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }
    
    // Enable MFA and save the secret
    await User.findByIdAndUpdate(userId, {
      mfaEnabled: true,
      mfaSecret: user.mfaTemp.secret,
      mfaTemp: null
    });
    
    res.status(200).json({
      message: 'MFA enabled successfully',
      success: true
    });
  } catch (error) {
    console.error('MFA enable error:', error);
    res.status(500).json({ message: 'Failed to enable MFA', error: error.message });
  }
};

// Disable MFA for a user
exports.disableMfa = async (req, res) => {
  try {
    const userId = req.user._id;
    
    await User.findByIdAndUpdate(userId, {
      mfaEnabled: false,
      mfaSecret: null,
      mfaTemp: null
    });
    
    res.status(200).json({
      message: 'MFA disabled successfully',
      success: true
    });
  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(500).json({ message: 'Failed to disable MFA', error: error.message });
  }
};

// Verify MFA code during login
exports.verifyMfa = async (req, res) => {
  try {
    const { email, password, verificationCode, remember } = req.body;
    
    // Find user
    const user = await User.findOne({ email }).populate('roles');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is active
    if (user.isActive === false) {
      return res.status(403).json({ message: 'Your account has been deactivated' });
    }
    
    // Check password
    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify MFA code
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token: verificationCode
    });
    
    if (!verified) {
      return res.status(401).json({ message: 'Invalid verification code' });
    }
    
    // Update last login
    user.lastLogin = Date.now();
    await user.save();
    
    // Generate JWT
    const token = generateToken(user);
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Return user data (excluding password)
    const userData = user.toObject();
    delete userData.password;
    delete userData.mfaSecret;
    
    res.status(200).json({
      message: 'Login successful',
      user: userData,
      token
    });
    
  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({ message: 'MFA verification failed', error: error.message });
  }
};
