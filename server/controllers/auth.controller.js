const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const axios = require('axios');

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
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
    
    // Redirect to the client app with success
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
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
    
    if (!token) {
      return res.status(400).json({ message: 'SSO token is required' });
    }
    
    let userData;
    
    // Verify the SSO token with the identity provider
    try {
      // This is where you would make a request to your SSO provider to verify the token
      // The exact implementation depends on your SSO provider's API
      const response = await axios.post(
        `${process.env.SSO_PROVIDER_URL}/verify-token`,
        { token },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(
              `${process.env.SSO_CLIENT_ID}:${process.env.SSO_CLIENT_SECRET}`
            ).toString('base64')}`
          }
        }
      );
      
      // If the verification is successful, the response should contain user data
      userData = response.data;
      
      // If verification fails, the request will throw an error, which is caught below
    } catch (verificationError) {
      console.error('SSO token verification failed:', verificationError);
      
      // For development/testing purposes, we'll fallback to mock data
      // REMOVE THIS IN PRODUCTION
      if (process.env.NODE_ENV !== 'production') {
        console.log('Using mock SSO data for development');
        userData = {
          name: 'SSO Test User',
          email: 'sso-user@example.com',
          organization: 'Test Organization'
        };
      } else {
        return res.status(401).json({ 
          message: 'SSO token verification failed', 
          error: verificationError.message 
        });
      }
    }
    
    if (!userData || !userData.email) {
      return res.status(400).json({ message: 'Invalid SSO data: email is required' });
    }

    // Find or create user based on SSO data
    let user = await User.findOne({ email: userData.email });
    
    if (!user) {
      // Create new user
      user = new User({
        name: userData.name || 'SSO User',
        email: userData.email,
        avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'SSO User')}&background=random`,
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
