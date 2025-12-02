const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/authModel');
require('dotenv').config();

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Centralized cookie options to behave correctly in production and cross-site scenarios
const isProd = process.env.NODE_ENV === 'production';
// If your frontend runs on a different site (different eTLD+1) than the API,
// set CROSS_SITE_COOKIES=true to force SameSite=None; Secure
const crossSite = String(process.env.CROSS_SITE_COOKIES || '').toLowerCase() === 'true';
const cookieSameSite = process.env.COOKIE_SAMESITE || (crossSite ? 'none' : 'lax');
// Optionally scope cookies to a parent domain (e.g., .uandinaturals.com) when API is on a subdomain
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

const buildCookieOpts = (overrides = {}) => ({
  httpOnly: true,
  // Secure must be true when SameSite=None (browser requirement)
  secure: isProd || cookieSameSite === 'none',
  sameSite: cookieSameSite,
  ...(cookieDomain ? { domain: cookieDomain } : {}),
  ...overrides,
});

const validatePassword = (password) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)/;
  return passwordRegex.test(password);
};

exports.googleLogin = (req, res, next) => {
  const { redirect } = req.query || {};
  let state;
  try {
    if (redirect) {
      state = Buffer.from(JSON.stringify({ redirect })).toString('base64');
    }
  } catch (e) {
    // ignore state build errors
  }
  return passport.authenticate('google', {
    scope: ['profile', 'email'],
    state,
  })(req, res, next);
};

exports.googleCallback = async (req, res, next) => {
  passport.authenticate('google', { session: false }, async (err, user) => {
    if (err) {
      console.error('Google auth error:', err);
      return res.redirect(`${FRONTEND_URL}/login?error=auth_failed`);
    }
    if (!user) {
      console.error('No user found in Google callback');
      return res.redirect(`${FRONTEND_URL}/login?error=no_user`);
    }

    try {
      const accessToken = jwt.sign(
        { user_id: user.user_id, role_id: user.role_id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      );
      const refreshToken = jwt.sign(
        { user_id: user.user_id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      await User.updateRefreshToken(user.user_id, refreshToken);

      res.cookie('accessToken', accessToken, buildCookieOpts({ maxAge: 15 * 60 * 1000 }));
      res.cookie('refreshToken', refreshToken, buildCookieOpts({ maxAge: 7 * 24 * 60 * 60 * 1000 }));

      // Pull redirect hint from OAuth state if present
      let redirectHint = null;
      try {
        if (req.query && req.query.state) {
          const decoded = JSON.parse(Buffer.from(req.query.state, 'base64').toString('utf8'));
          if (decoded && typeof decoded.redirect === 'string') redirectHint = decoded.redirect;
        }
      } catch (e) {
        // ignore malformed state
      }

      console.log('Cookies set for Google callback');
      const callbackUrl = redirectHint
        ? `${FRONTEND_URL}/auth/google/callback?redirect=${encodeURIComponent(redirectHint)}`
        : `${FRONTEND_URL}/auth/google/callback`;
      res.redirect(callbackUrl);
    } catch (error) {
      console.error('Error in Google callback:', error);
      res.redirect(`${FRONTEND_URL}/login?error=server_error`);
    }
  })(req, res, next);
};

exports.signup = async (req, res, next) => {
  const { email, phoneNumber, password, confirmPassword, firstName, lastName } = req.body;
  if (!email && !phoneNumber) return res.status(400).json({ error: 'Email or phone number required' });
  if (!password || !confirmPassword) return res.status(400).json({ error: 'Password and confirm password required' });
  if (password !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });
  if (!validatePassword(password)) return res.status(400).json({ error: 'Password must contain at least one capital letter and one number' });

  try {
    const existingUser = await User.findByGoogleIdOrIdentifier(email || phoneNumber);
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const user = await User.createManualUser(email, phoneNumber, password, firstName, lastName);
    const accessToken = jwt.sign(
      { user_id: user.user_id, role_id: user.role_id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await User.updateRefreshToken(user.user_id, refreshToken);

    res.cookie('accessToken', accessToken, buildCookieOpts({ maxAge: 15 * 60 * 1000 }));
    res.cookie('refreshToken', refreshToken, buildCookieOpts({ maxAge: 7 * 24 * 60 * 60 * 1000 }));

    res.status(201).json({ user: { user_id: user.user_id, email: user.email, phone_number: user.phone_number, first_name: user.first_name, last_name: user.last_name  } });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) return res.status(400).json({ error: 'Identifier and password required' });

  try {
    const user = await User.findByGoogleIdOrIdentifier(identifier);
    if (!user || !user.password_hash) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const accessToken = jwt.sign(
      { user_id: user.user_id, role_id: user.role_id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    await User.createSession(user.user_id, refreshToken);

    res.cookie('accessToken', accessToken, buildCookieOpts({ maxAge: 15 * 60 * 1000 }));
    res.cookie('refreshToken', refreshToken, buildCookieOpts({ maxAge: 7 * 24 * 60 * 60 * 1000 }));

    res.json({ user: { user_id: user.user_id, email: user.email, phone_number: user.phone_number, first_name: user.first_name, last_name: user.last_name,  profile_picture_url: user.profile_picture_url, role: user.role_name,} });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ error: 'Email or phone number required' });

  try {
    const user = await User.findByGoogleIdOrIdentifier(identifier);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const token = Math.random().toString(36).slice(2);
    const expiry = new Date(Date.now() + 3600000); // 1 hour expiry
    await User.updateResetToken(user.user_id, token, expiry);

    const resetLink = `${FRONTEND_URL}/reset-password?token=${token}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: `Click <a href="${resetLink}">here</a> to reset your password.`,
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { token, newPassword, confirmPassword } = req.body;
  if (!token || !newPassword || !confirmPassword) return res.status(400).json({ error: 'Token, new password, and confirm password required' });
  if (newPassword !== confirmPassword) return res.status(400).json({ error: 'Passwords do not match' });
  if (!validatePassword(newPassword)) return res.status(400).json({ error: 'Password must contain at least one capital letter and one number' });

  try {
    const user = await User.findByResetToken(token);
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    await User.updatePassword(user.user_id, newPassword);
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token provided' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByRefreshToken(refreshToken);
    if (!user || user.user_id !== decoded.user_id) return res.status(401).json({ error: 'Invalid refresh token' });

    const accessToken = jwt.sign(
      { user_id: user.user_id, role_id: user.role_id },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    res.cookie('accessToken', accessToken, buildCookieOpts({ maxAge: 15 * 60 * 1000 }));

    res.json({ message: 'Access token refreshed' });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    // Find user by refresh token
    const user = await User.findByRefreshToken(refreshToken);

    if (user) {
       await User.clearSession(user.user_id);
    }
  }

  // Clear with matching attributes to ensure deletion across domains/samesite
  const clearOpts = buildCookieOpts({ maxAge: 0 });
  res.clearCookie('accessToken', clearOpts);
  res.clearCookie('refreshToken', clearOpts);

  res.json({ message: 'Logged out successfully' });
};


exports.verify = async (req, res, next) => {
  let accessToken = req.cookies.accessToken;

  // console.log('Verify request cookies:', req.cookies); // Debug log

  if (!accessToken) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      console.error('No access or refresh token provided');
      return res.status(401).json({ error: 'No access or refresh token provided' });
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
       // Debug log
      const user = await User.findByRefreshToken(refreshToken);
      console.log('User from refresh token:', user);
      if (!user || user.user_id !== decoded.user_id) {
        console.error('Invalid refresh token');
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      accessToken = jwt.sign(
        { user_id: user.user_id, role_id: user.role_id },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '15m' }
      );

      res.cookie('accessToken', accessToken, buildCookieOpts({ maxAge: 15 * 60 * 1000 }));

      console.log('New access token set:', accessToken); // Debug log
    } catch (error) {
      console.error('Refresh token error:', error);
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    console.log('Refresh token decoded:', decoded);
    // const user = await User.findByGoogleIdOrIdentifier(decoded.user_id);
    const user = await User.findByUserId(decoded.user_id);
    if (!user) {
      console.error('User not found for ID:', decoded.user_id);
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        user_id: user.user_id,
        email: user.email,
        phone_number: user.phone_number,
        first_name: user.first_name,
        last_name: user.last_name,
        profile_picture_url: user.profile_picture_url,
        role: user.role_name,
      },
    });
  } catch (error) {
    console.error('Access token error:', error);
    res.status(401).json({ error: 'Invalid access token' });
  }
};