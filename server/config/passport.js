
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/user.model');

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    scope: ['profile', 'email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ 
        $or: [
          { socialId: profile.id, socialProvider: 'Google' },
          { email: profile.emails[0].value }
        ]
      });
      
      // If user exists, update social info if needed
      if (user) {
        // Update social provider info if not already set
        if (!user.socialProvider || !user.socialId) {
          user.socialProvider = 'Google';
          user.socialId = profile.id;
          await user.save();
        }
      } else {
        // Create new user
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          avatar: profile.photos[0].value,
          socialProvider: 'Google',
          socialId: profile.id
        });
        await user.save();
      }
      
      // Update last login
      user.lastLogin = Date.now();
      await user.save();
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

// GitHub strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.SERVER_URL || 'http://localhost:5000'}/api/auth/github/callback`,
    scope: ['user:email']
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Get primary email from GitHub profile
      const primaryEmail = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
      
      if (!primaryEmail) {
        return done(new Error('Email not available from GitHub profile'), null);
      }
      
      // Check if user already exists
      let user = await User.findOne({ 
        $or: [
          { socialId: profile.id, socialProvider: 'GitHub' },
          { email: primaryEmail }
        ]
      });
      
      // If user exists, update social info if needed
      if (user) {
        // Update social provider info if not already set
        if (!user.socialProvider || !user.socialId) {
          user.socialProvider = 'GitHub';
          user.socialId = profile.id;
          await user.save();
        }
      } else {
        // Create new user
        user = new User({
          name: profile.displayName || profile.username,
          email: primaryEmail,
          avatar: profile.photos[0].value,
          socialProvider: 'GitHub',
          socialId: profile.id
        });
        await user.save();
      }
      
      // Update last login
      user.lastLogin = Date.now();
      await user.save();
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }
));

module.exports = passport;
