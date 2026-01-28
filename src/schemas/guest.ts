import Joi from 'joi';

export const createGuestSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  age: Joi.number().required().min(1).max(120),
  hasChildren: Joi.boolean().required(),
  children: Joi.array().items(
    Joi.object({
      name: Joi.string().required().min(2).max(100),
      age: Joi.number().required().min(1).max(18),
      willStay: Joi.boolean().required(),
      arrivalDay: Joi.when('willStay', {
        is: true,
        then: Joi.string().valid('friday', 'saturday').required(),
        otherwise: Joi.string().optional(),
      }),
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
