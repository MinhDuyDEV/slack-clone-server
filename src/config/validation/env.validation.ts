import * as Joi from 'joi';

export const validationSchema = Joi.object({
  // Port
  PORT: Joi.number().default(8000),

  // Database
  DB_TYPE: Joi.string().required(),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // JWT
  JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.number().required(),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
  JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.number().required(),

  // Redis
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),

  // AWS
  // AWS_S3_BUCKET: Joi.string().required(),
  // AWS_S3_REGION: Joi.string().required(),
  // AWS_S3_ACCESS_KEY_ID: Joi.string().required(),
  // AWS_S3_SECRET_ACCESS_KEY: Joi.string().required(),
});
