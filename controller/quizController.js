const QuizResult = require('../models/QuizResult');
const GeminiService = require('../services/gemini');

exports.getQuiz = async (req, res) => {
  try {
    const { category } = req.params;
    const questions = await GeminiService.generateQuizQuestions(category);
    
    // Store quiz data in session
    req.session.quiz = {
      category,
      questions: questions.questions,
      answers: questions.questions.map(q => q.correctAnswer),
      currentQuestion: 0,
      userAnswers: []
    };

    // Render the quiz page with all required variables
    res.render('pages/quiz', {
      user: req.session.user, // Make sure to pass the user object
      question: questions.questions[0],
      current: 1,
      total: questions.questions.length,
      category
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.redirect('/dashboard?error=' + encodeURIComponent(error.message));
  }
};

exports.postQuiz = async (req, res) => {
  try {
    const { answer } = req.body;
    const quiz = req.session.quiz;
    
    // Store user's answer
    quiz.userAnswers.push(answer);
    quiz.currentQuestion++;

    // If more questions, show next
    if (quiz.currentQuestion < quiz.questions.length) {
      return res.render('pages/quiz', {
        user: req.session.user, // Pass user here too
        question: quiz.questions[quiz.currentQuestion],
        current: quiz.currentQuestion + 1,
        total: quiz.questions.length,
        category: quiz.category
      });
    }

    // Calculate score if all questions answered
    let score = 0;
    for (let i = 0; i < quiz.answers.length; i++) {
      if (quiz.userAnswers[i] === quiz.answers[i]) score++;
    }

    // Save result
    await QuizResult.create({
      userId: req.session.user.id,
      category: quiz.category,
      score,
      totalQuestions: quiz.questions.length
    });

    // Show results
    res.render('pages/result', {
      user: req.session.user,
      score,
      total: quiz.questions.length,
      category: quiz.category
    });
  } catch (error) {
    console.error('Error processing quiz:', error);
    res.redirect('/dashboard?error=' + encodeURIComponent(error.message));
  }
};