// Generated by Copilot
const User = require('../models/User');
const redisClient = require('../config/redis');

exports.storeSms = async (req, res) => {
  const { phonenumber } = req.params;
  const messageData = { ...req.body };
  console.log('Received message data:', messageData);
  console.log('Received phone number:', phonenumber);
  try {

    // Verify if phone number exists in database
    const user = await User.findOne({ phoneNumber: phonenumber });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'Phone number not registered'
      });
    }

    // Store only the content
    const result = await redisClient.set(
      phonenumber,
      messageData.content, // Only store the content
      'EX',
      600 // 10 minutes expiration
    );

    if (!result) {
      throw new Error('Failed to store message in Redis');
    }

    return res.status(200).json({
      success: true,
      data: { content: messageData.content }
    });
  } catch (error) {
    console.error('SMS storage error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getSms = async (req, res) => {
  const { phonenumber } = req.params;

  try {
    const content = await redisClient.get(phonenumber);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'No SMS found'
      });
    }

    return res.status(200).json({
      success: true,
      data: { content }
    });
  } catch (error) {
    console.error('SMS retrieval error:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};