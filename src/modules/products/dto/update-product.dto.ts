import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

/**
 * All fields are optional for a partial update, but when a field is
 * provided it must satisfy the same rules as on creation. StockCount
 * still can not be less than 1.
 */
export class UpdateProductDTO {
  @JoiSchema(Joi.string().uuid().optional())
  shopId?: string;

  @JoiSchema(Joi.string().trim().min(1).optional())
  name?: string;

  @JoiSchema(Joi.string().trim().min(1).optional())
  description?: string;

  @JoiSchema(Joi.number().integer().positive().optional())
  price?: number;

  @JoiSchema(Joi.number().integer().min(1).optional())
  stockCount?: number;
}
