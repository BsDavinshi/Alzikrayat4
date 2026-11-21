const Joi = require('joi');

const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(1).max(50).required(),
  lastName: Joi.string().trim().min(1).max(50).required(),
  email: Joi.string().trim().email().max(100).required(),
  password: Joi.string().min(8).max(72).pattern(/(?=.*[A-Za-z])(?=.*\d)/).required().messages({
    'string.pattern.base': 'Password must include at least one letter and one number'
  }),
  location: Joi.string().trim().max(100).allow('').optional(),
  description: Joi.string().trim().max(1000).allow('').optional(),
  occupation: Joi.string().trim().max(100).allow('').optional()
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required()
});

const profileUpdateSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
  firstName: Joi.string().trim().min(1).max(50).required(),
  lastName: Joi.string().trim().min(1).max(50).required(),
  occupation: Joi.string().trim().max(100).allow('').optional(),
  location: Joi.string().trim().max(100).allow('').optional(),
  description: Joi.string().trim().max(1000).allow('').optional()
});

const photoSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
  title: Joi.string().trim().min(1).max(200).required(),
  description: Joi.string().trim().max(2000).allow('').optional(),
  albumId: Joi.string().allow('', '0', null).optional(),
  filterName: Joi.string().trim().max(30).allow('').optional(),
  taggedUsers: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string().allow('')).optional()
});

const albumSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
  title: Joi.string().trim().min(1).max(150).required(),
  description: Joi.string().trim().max(1000).allow('').optional()
});

const commentSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
  comment: Joi.string().trim().min(1).max(1000).required()
});

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const messages = error.details.map((d) => d.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  req.body = value;
  next();
};

module.exports = {
  validateRegister: validate(registerSchema),
  validateLogin: validate(loginSchema),
  validateProfileUpdate: validate(profileUpdateSchema),
  validatePhoto: validate(photoSchema),
  validateAlbum: validate(albumSchema),
  validateComment: validate(commentSchema)
};
