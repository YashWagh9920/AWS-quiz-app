const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');
const quizController = require('../controller/quizController');

function requireAuth(req, res, next) {
    if (!req.session.user) {
      return res.redirect('/login');
    }
    next();
  }

// Auth routes
router.get('/', (req, res) => res.redirect('/login'));
router.get('/signup', authController.getSignup);
router.post('/signup', authController.postSignup);
router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/logout', authController.logout);

// Quiz routes
router.get('/dashboard',requireAuth, authController.getDashboard);
router.get('/quiz/:category',requireAuth, quizController.getQuiz);
router.post('/quiz', requireAuth,quizController.postQuiz);

module.exports = router;