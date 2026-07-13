import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

/**
 * Optional query parameters for listing products.
 * `search` performs a case-insensitive match against the product name.
 */
export class FindProductsQueryDTO {
  @JoiSchema(Joi.string().trim().allow('').optional())
  search?: string;
}
