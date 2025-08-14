const { dynamoDB } = require('../services/aws');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create({ username, password, interests, profilePicUrl }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();
    
    const params = {
      TableName: process.env.DYNAMODB_USERS_TABLE || 'QuizUsers',
      Item: {
        userId, // Make sure this matches your partition key in DynamoDB
        username,
        password: hashedPassword,
        interests,
        profilePicUrl,
        createdAt: new Date().toISOString()
      }
    };

    await dynamoDB.put(params).promise();
    return userId;
  }

  static async findByUsername(username) {
    const params = {
      TableName: process.env.DYNAMODB_USERS_TABLE || 'QuizUsers',
      IndexName: 'username-index', // You must create this index in DynamoDB
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username
      }
    };

    const result = await dynamoDB.query(params).promise();
    return result.Items[0];
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
}

module.exports = User;