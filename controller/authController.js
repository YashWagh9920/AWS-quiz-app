const User = require('../models/User');
const { upload, uploadToS3 } = require('../services/fileUpload');
const  QuizResult  = require('../models/QuizResult');

const authController = {
  getSignup: (req, res) => {
    res.render('pages/signup', { error: null });
  },

  postSignup: async (req, res) => {
    try {
      upload(req, res, async (err) => {
        if (err) {
          return res.render('pages/signup', { error: err.message });
        }

        const { username, password, confirmPassword, interests } = req.body;
        
        if (password !== confirmPassword) {
          return res.render('pages/signup', { error: 'Passwords do not match' });
        }

        const existingUser = await User.findByUsername(username);
        if (existingUser) {
          return res.render('pages/signup', { error: 'Username already exists' });
        }

        let profilePicUrl = '';
        if (req.file) {
          profilePicUrl = await uploadToS3(req.file, username);
        }

        const userId = await User.create({ username, password, interests, profilePicUrl });
        res.redirect('/login');
      });
    } catch (error) {
      res.render('pages/signup', { error: error.message });
    }
  },

  getLogin: (req, res) => {
    res.render('pages/login', { error: null });
  },

  postLogin: async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await User.findByUsername(username);

      if (!user) {
        return res.render('pages/login', { error: 'Invalid username or password' });
      }

      const isMatch = await User.comparePassword(password, user.password);
      if (!isMatch) {
        return res.render('pages/login', { error: 'Invalid username or password' });
      }

      req.session.user = {
        id: user.userId,
        username: user.username,
        profilePicUrl: user.profilePicUrl,
        interests: user.interests
      };
      

      res.redirect('/dashboard');
    } catch (error) {
      res.render('pages/login', { error: error.message });
    }
  },

  logout: (req, res) => {
    req.session.destroy();
    res.redirect('/login');
  },

  getDashboard: async (req, res) => {
    try {
      if (!req.session.user) {
        return res.redirect('/login');
      }
  
      let results = [];
      let error = null;
      
      try {
        results = await QuizResult.findByUserId(req.session.user.id) || [];
      } catch (err) {
        console.error('Error fetching results:', err);
        error = err.message;
      }
  
      res.render('pages/dashboard', { 
        user: req.session.user,
        results: results,
        categories: ['Science', 'Technology', 'History', 'Geography', 'Literature'],
        error: error // Make sure error is always defined
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.render('pages/dashboard', {
        user: req.session.user || null,
        results: [],
        categories: ['Science', 'Technology', 'History', 'Geography', 'Literature'],
        error: error.message
      });
    }
  }
};

module.exports = authController;