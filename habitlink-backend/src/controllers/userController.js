const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const user = await User.findOne({
      where: { user_id: userId },
      attributes: { exclude: ['password_hash'] } // Don't return password hash
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { first_name, last_name, display_name, timezone, profile_picture_url } = req.body;

    const user = await User.findOne({ where: { user_id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      first_name,
      last_name,
      display_name,
      timezone,
      profile_picture_url
    });

    // Return updated user without password hash
    const updatedUser = await User.findOne({
      where: { user_id: userId },
      attributes: { exclude: ['password_hash'] }
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
