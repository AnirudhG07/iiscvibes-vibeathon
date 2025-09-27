const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
    track: Joi.string().required(),
    sessionCategory: Joi.string().required(),
    tshirtSize: Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL').required(),
    speaker2Name: Joi.string().allow('').optional(),
    speaker2Email: Joi.string().email().allow('').optional(),
    speaker2TshirtSize: Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL').allow('').optional(),
    foodChoice: Joi.string().valid('veg', 'non-veg').required(),
    bloodGroup: Joi.string().allow('').optional(),
    emergencyContactName: Joi.string().allow('').optional(),
    emergencyContactNumber: Joi.string().allow('').optional(),
    linkedinProfile: Joi.string().uri().allow('').optional(),
    sapCommunityUrl: Joi.string().uri().allow('').optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  sessionSubmission: Joi.object({
    title: Joi.string().min(5).max(200).required(),
    abstract: Joi.string().min(50).max(2000).required(),
    category: Joi.string().required(),
    track: Joi.string().required(),
    duration: Joi.number().min(15).max(180).required(),
    coSpeaker: Joi.string().allow('').optional(),
    requirements: Joi.string().allow('').optional(),
    targetAudience: Joi.string().allow('').optional()
  }),

  changeRequest: Joi.object({
    sessionId: Joi.string().required(),
    type: Joi.string().valid('title', 'abstract', 'speaker', 'other').required(),
    newValue: Joi.string().required(),
    reason: Joi.string().min(10).max(500).required()
  }),

  sessionReview: Joi.object({
    status: Joi.string().valid('approved', 'rejected', 'on_hold').required(),
    feedback: Joi.string().allow('').optional(),
    assignedTrack: Joi.string().when('status', {
      is: 'approved',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    timeSlot: Joi.string().when('status', {
      is: 'approved',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  })
};

module.exports = {
  validateRequest,
  schemas
};