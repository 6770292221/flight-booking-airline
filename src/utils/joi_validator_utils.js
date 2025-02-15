import Joi from "joi";

// Define the schema
export const bookingSchema = Joi.object({
  shopId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/) // Validate MongoDB ObjectId (24 hex characters)
    .required(),
  date: Joi.string()
    .pattern(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/) // Validate "dd-MM-yyyy HH:mm"
    .required()
    .messages({
      "string.pattern.base": `"date" must be in the format "dd-MM-yyyy HH:mm"`,
      "string.empty": `"date" cannot be an empty field`,
      "any.required": `"date" is a required field`,
    }),
});

export const bodyPutSchema = Joi.object({
  shopId: Joi.string().regex(/^[0-9a-fA-F]{24}$/), // Validate MongoDB ObjectId (24 hex characters)
  date: Joi.string()
    .pattern(/^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})$/) // Validate "dd-MM-yyyy HH:mm"
    .messages({
      "string.pattern.base": `"date" must be in the format "dd-MM-yyyy HH:mm"`,
      "string.empty": `"date" cannot be an empty field`,
      "any.required": `"date" is a required field`,
    }),
    // status: Joi.string().valid("Pending", "Completed", "Cancelled"),
});

export const bodyPatchSchema = Joi.object({
  status: Joi.string().valid("Pending", "Completed", "Cancelled"),
});

export const bookingRunningSchema = Joi.object({
  bookingId: Joi.string()
    .regex(/^BKD-[0-9]{8}$/)
    .required(),
});
