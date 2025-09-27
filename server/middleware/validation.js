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
    requestedRole: Joi.string().valid('speaker', 'organizer').required(),
    // Speaker-specific fields
    track: Joi.string().when('requestedRole', {
      is: 'speaker',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    sessionCategory: Joi.string().when('requestedRole', {
      is: 'speaker',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    speaker2Name: Joi.string().allow('').optional(),
    speaker2Email: Joi.string().email().allow('').optional(),
    speaker2TshirtSize: Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL').allow('').optional(),
    sapCommunityUrl: Joi.string().uri().allow('').optional(),
    // Organizer-specific fields
    organization: Joi.string().when('requestedRole', {
      is: 'organizer',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    position: Joi.string().when('requestedRole', {
      is: 'organizer',
      then: Joi.required(),
      otherwise: Joi.optional()
    }),
    experience: Joi.string().allow('').optional(),
    // Common fields
    tshirtSize: Joi.string().valid('XS', 'S', 'M', 'L', 'XL', 'XXL').required(),
    foodChoice: Joi.string().valid('veg', 'non-veg').required(),
    bloodGroup: Joi.string().allow('').optional(),
    emergencyContactName: Joi.string().allow('').optional(),
    emergencyContactNumber: Joi.string().allow('').optional(),
    linkedinProfile: Joi.string().uri().allow('').optional()
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
    }),
    room: Joi.string().allow('').optional()
  })
};

module.exports = {
  validateRequest,
  schemas
};