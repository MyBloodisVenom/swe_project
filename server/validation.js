const { z } = require("zod");

const emailSchema = z.string().trim().toLowerCase().email();
const passwordSchema = z.string().min(8).max(200);

const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
});

const blockTypeSchema = z.enum(["flexible", "locked"]);

const blockUpsertSchema = z.object({
  title: z.string().trim().min(1).max(120),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  importance: z.coerce.number().int().min(1).max(5).default(3),
  location: z.string().trim().max(120).optional().nullable(),
  type: blockTypeSchema,
});

module.exports = {
  registerSchema,
  loginSchema,
  blockUpsertSchema,
};

