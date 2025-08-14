const { dynamoDB } = require('../services/aws');
const { v4: uuidv4 } = require('uuid');

class QuizResult {
  static async create({ userId, category, score, totalQuestions }) {
    const resultId = uuidv4();
    
    const params = {
      TableName: process.env.DYNAMODB_RESULTS_TABLE || 'QuizResults',
      Item: {
        resultId, // Changed from resultid to resulted
        userid: userId,
        category,
        score,
        totalQuestions,
        createdAt: new Date().toISOString()
      }
    };
  
    await dynamoDB.put(params).promise();
    return resultId;
  }

  static async findByUserId(userId) {
    const params = {
      TableName: process.env.DYNAMODB_RESULTS_TABLE,
      FilterExpression: 'userid = :userid',
      ExpressionAttributeValues: {
        ':userid': userId
      }
    };

    const result = await dynamoDB.scan(params).promise();
    return result.Items || [];
  }
}

module.exports = QuizResult;