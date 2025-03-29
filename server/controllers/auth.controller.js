const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const crypto = require('crypto');

// Store OTPs temporarily (in a real app, use Redis or similar)
const otpStore = new Map();

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    });

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

    res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.isValidPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
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

    res.status(200).json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

// Social authentication callback handler (for Passport.js OAuth flow)
exports.socialAuthCallback = (req, res) => {
  try {
    // User is already authenticated and added to req by Passport
    const user = req.user;
    
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/auth?error=Authentication failed`);
    }
    
    // Generate JWT
    const token = generateToken(user);
    
    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Prepare user data (excluding sensitive fields)
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      lastLogin: user.lastLogin // Include lastLogin
    };
    
    // Include token and user data in the URL for the frontend to process
    const encodedUserData = encodeURIComponent(JSON.stringify(userData));
    
    // Redirect to the client app with success
    res.redirect(`${process.env.CLIENT_URL}?token=${token}&userData=${encodedUserData}`);
  } catch (error) {
    console.error('Social auth callback error:', error);
    res.redirect(`${process.env.CLIENT_URL}/auth?error=${encodeURIComponent(error.message)}`);
  }
};

// Social login (for direct API calls from frontend)
exports.socialLogin = async (req, res) => {
  try {
    const { provider, token, userData } = req.body;
    
    // In a real implementation, you would verify the token with the provider
    // For now, we'll assume the token is valid and the user data is correct
    
    if (!userData || !userData.email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find or create user
    let user = await User.findOne({ email: userData.email });
    
    if (!user) {
      // Create new user
      user = new User({
        name: userData.name || `${provider} User`,
        email: userData.email,
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || provider + ' User')}&background=random`,
        socialProvider: provider,
        socialId: userData.id
      });
      
      await user.save();
    } else {
      // Update social provider info if not already set
      if (!user.socialProvider) {
        user.socialProvider = provider;
        user.socialId = userData.id;
        await user.save();
      }
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate JWT
    const jwtToken = generateToken(user);

    // Set cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return user data
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: `${provider} login successful`,
      user: userObj,
      token: jwtToken
    });
  } catch (error) {
    console.error('Social login error:', error);
    res.status(500).json({ message: 'Social login failed', error: error.message });
  }
};

// SSO login
exports.ssoLogin = async (req, res) => {
  try {
    const { token } = req.body;
    
    // In a real implementation, you would verify the SSO token with the identity provider
    // For now, we'll simulate a successful verification
    
    // Find or create user based on SSO data
    // This is a simplified implementation
    const ssoData = {
      name: 'SSO User',
      email: 'user@organization.com'
    };
    
    let user = await User.findOne({ email: ssoData.email });
    
    if (!user) {
      // Create new user
      user = new User({
        name: ssoData.name,
        email: ssoData.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(ssoData.name)}&background=random`,
        socialProvider: 'SSO'
      });
      
      await user.save();
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate JWT
    const jwtToken = generateToken(user);

    // Set cookie
    res.cookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Return user data
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: 'SSO login successful',
      user: userObj,
      token: jwtToken
    });
  } catch (error) {
    console.error('SSO login error:', error);
    res.status(500).json({ message: 'SSO login failed', error: error.message });
  }
};

// Logout user
exports.logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

// Verify token endpoint
exports.verifyToken = (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    // Return user data including lastLogin
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      lastLogin: user.lastLogin
    };
    
    res.status(200).json({
      message: 'Token verified',
      user: userData,
      token: req.headers.authorization?.split(' ')[1] || ''
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Token verification failed', error: error.message });
  }
};

// Forgot password - send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiry (15 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 15 * 60 * 1000 // 15 minutes in milliseconds
    });
    
    // In a real app, send the OTP via email
    console.log(`OTP for ${email}: ${otp}`); // For testing only
    
    res.status(200).json({ 
      message: 'OTP has been sent to your email',
      // Include OTP in response for testing only (would not do this in production)
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to process request', error: error.message });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Check if OTP exists and is valid
    const storedOtpData = otpStore.get(email);
    
    if (!storedOtpData) {
      return res.status(400).json({ message: 'OTP not found or expired' });
    }
    
    if (Date.now() > storedOtpData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired' });
    }
    
    if (storedOtpData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // OTP is valid - don't delete it yet as we'll need to verify the email during password reset
    
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Ensure OTP was verified
    const storedOtpData = otpStore.get(email);
    if (!storedOtpData) {
      return res.status(400).json({ message: 'Please verify your email with OTP first' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    user.password = password; // Password will be hashed by the pre-save hook
    await user.save();
    
    // Remove OTP from store
    otpStore.delete(email);
    
    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
};
