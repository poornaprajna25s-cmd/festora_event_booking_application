const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
router.put('/profile', 
  auth,
  [
    body('firstName', 'First name is required').notEmpty(),
    body('lastName', 'Last name is required').notEmpty(),
    body('department', 'Department is required').notEmpty()
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array()); // For debugging
        return res.status(400).json({ 
          message: 'Validation failed', 
          errors: errors.array() 
        });
      }

      const { firstName, lastName, department, year, club } = req.body;
      console.log('Received data:', req.body); // For debugging

      // Build user object
      const userFields = {
        firstName,
        lastName,
        department
      };

      // Only add year if it's provided
      if (year) {
        userFields.year = year;
      }

      // Only add club for organisers if it's provided
      if (req.user.role === 'organiser' && club) {
        userFields.club = club;
      }

      // Update the user's name by combining first and last name
      userFields.name = `${firstName} ${lastName}`;

      let user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('Updating user with fields:', userFields); // For debugging

      // Update user
      user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: userFields },
        { new: true, runValidators: true }
      ).select('-passwordHash');

      console.log('Updated user:', user); // For debugging
      res.json(user);
    } catch (error) {
      console.error('Server error:', error); // For debugging
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
);

module.exports = router;