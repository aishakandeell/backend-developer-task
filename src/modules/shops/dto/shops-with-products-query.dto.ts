import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';

/**
 * Query parameters for paginating the shops-with-products listing.
 * Defaults keep responses small so the endpoint scales on large datasets.
 */
export class ShopsWithProductsQueryDTO {
  /** 1-based page number. */
  @JoiSchema(Joi.number().integer().min(1).default(1))
  page: number;

  /** Number of shops to return per page (capped to protect the server). */
  @JoiSchema(Joi.number().integer().min(1).max(100).default(20))
  limit: number;
}
