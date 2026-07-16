import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { AVAILABILITY } from 'src/modules/shops/shops.constants';

/**
 * All fields are optional for a partial update, but when a field is provided it
 * must satisfy the same rules as on creation.
 */
export class UpdateShopDTO {
  @JoiSchema(Joi.string().trim().min(1).optional())
  name?: string;

  @JoiSchema(Joi.date().iso().optional())
  openingHour?: Date;

  @JoiSchema(Joi.date().iso().optional())
  closingHour?: Date;

  @JoiSchema(
    Joi.string()
      .valid(...AVAILABILITY)
      .optional(),
  )
  availability?: string;
}
