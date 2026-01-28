import Joi from 'joi';

export const createGuestSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  age: Joi.number().required().min(1).max(120),
  phone: Joi.string().required().pattern(/^\(\d{2}\)\d{8,9}$/).messages({
    'string.pattern.base': 'Telefone deve estar no formato (XX)XXXXX-XXXX com 8 ou 9 dígitos'
  }),
  hasChildren: Joi.boolean().required(),
  children: Joi.array().items(
    Joi.object({
      name: Joi.string().required().min(2).max(100),
      age: Joi.number().required().min(1).max(18),
    })
  ).when('hasChildren', {
    is: true,
    then: Joi.array().min(1).required(),
    otherwise: Joi.array().length(0),
  }),
  willStay: Joi.boolean().required(),
  arrivalDay: Joi.when('willStay', {
    is: true,
    then: Joi.string().valid('friday', 'saturday').required(),
    otherwise: Joi.string().optional(),
  }),
});
