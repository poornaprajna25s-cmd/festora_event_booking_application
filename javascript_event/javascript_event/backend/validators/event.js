const { body, query, param } = require('express-validator');

const createEventValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('shortDescription')
    .notEmpty()
    .withMessage('Short description is required')
    .isLength({ max: 250 })
    .withMessage('Short description cannot exceed 250 characters'),
  body('longDescription')
    .notEmpty()
    .withMessage('Long description is required'),
  body('location')
    .notEmpty()
    .withMessage('Location is required'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Technical', 'Cultural', 'Literary', 'Sports', 'Entrepreneurial', 'Social Service', 'Informal'])
    .withMessage('Invalid category'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid ISO date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date()) {
        throw new Error('Start date must be in the future');
      }
      return true;
    }),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid ISO date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('registrationDeadline')
    .notEmpty()
    .withMessage('Registration deadline is required')
    .isISO8601()
    .withMessage('Registration deadline must be a valid ISO date')
    .custom((value, { req }) => {
      if (new Date(value) >= new Date(req.body.startDate)) {
        throw new Error('Registration deadline must be before start date');
      }
      return true;
    }),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be a positive integer'),
  body('assignedAdmin')
    .custom((value, { req }) => {
      // If submitting for approval, assignedAdmin is required
      if (req.body.submitForApproval) {
        if (!value) {
          throw new Error('Assigned admin is required when submitting for approval');
        }
        return true;
      }
      // If not submitting for approval, assignedAdmin is optional
      return true;
    })
    .if(body('assignedAdmin').exists())
    .isMongoId()
    .withMessage('Assigned admin must be a valid MongoDB ID')
];

const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  query('category')
    .optional()
    .isIn(['Technical', 'Cultural', 'Literary', 'Sports', 'Entrepreneurial', 'Social Service', 'Informal'])
    .withMessage('Invalid category')
];

const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

module.exports = {
  createEventValidation,
  paginationValidation,
  idValidation
};