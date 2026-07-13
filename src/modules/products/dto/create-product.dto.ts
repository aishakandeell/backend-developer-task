import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

export class CreateProductDTO {
  /** The shop this product belongs to. A product must belong to exactly one shop. */
  @JoiSchema(Joi.string().uuid().required())
  shopId: string;

  @JoiSchema(Joi.string().trim().min(1).required())
  name: string;

  @JoiSchema(Joi.string().trim().min(1).required())
  description: string;

  /** Price in the smallest currency unit. Stored as an integer, so must be a whole positive number. */
  @JoiSchema(Joi.number().integer().positive().required())
  price: number;

  /** Business rule: stock count can not be less than 1 for a product. */
  @JoiSchema(Joi.number().integer().min(1).required())
  stockCount: number;
}
