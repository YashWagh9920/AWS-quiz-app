require('dotenv').config();
const axios = require('axios');

class GeminiService {
  static async generateQuizQuestions(topic) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      
      const prompt = `Generate a quiz about ${topic} with the following requirements:
      - Create exactly 10 multiple-choice questions
      - Each question should have 4 options (A, B, C, D)
      - Include the correct answer for each question
      - Return the response in the following JSON format:
      {
        "questions": [
          {
            "question": "Question text here",
            "options": {
              "A": "Option A text",
              "B": "Option B text",
              "C": "Option C text",
              "D": "Option D text"
            },
            "correctAnswer": "A"
          },
          ... (and so on for all 10 questions)
        ]
      }`;

      const response = await axios.post(url, {
        contents: [{
          parts: [{ text: prompt }]
        }]
      });

      // Extract the JSON from the response
      const text = response.data.candidates[0].content.parts[0].text;
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('Failed to extract JSON from Gemini response');
      }
      
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      throw error;
    }
  }
}

module.exports = GeminiService;