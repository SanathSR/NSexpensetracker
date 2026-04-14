const Joi = require('joi');

// Transaction validation
const transactionSchema = Joi.object({
  dateon: Joi.date().required(),
  amount: Joi.number().positive().required(),
  mode: Joi.string().valid('UPI', 'cash', 'transfer').required(),
  purpose: Joi.string().allow('', null),
  to_whom: Joi.string().allow('', null),
  type: Joi.string().valid('personal','home','food','shopping','travel','other').required(),
  comments: Joi.string().allow('', null)
});

// Lending validation
const lendingSchema = Joi.object({
  dateon: Joi.date().required(),
  to_whom: Joi.string().required(),
  amount: Joi.number().positive().required(),
  mode: Joi.string().valid('UPI','cash','transfer').required(),
  comments: Joi.string().allow('', null),
  direction: Joi.string().valid('sent','received').required()
});

module.exports = {
  validateTransaction: (data) => transactionSchema.validate(data),
  validateLending: (data) => lendingSchema.validate(data)
};