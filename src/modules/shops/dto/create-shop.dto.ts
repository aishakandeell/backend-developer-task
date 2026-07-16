import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { AVAILABILITY } from 'src/modules/shops/shops.constants';

export class CreateShopDTO {
  @JoiSchema(Joi.string().trim().min(1).required())
  name: string;

  @JoiSchema(Joi.date().iso().required())
  openingHour: Date;

  @JoiSchema(Joi.date().iso().required())
  closingHour: Date;

  @JoiSchema(
    Joi.string()
      .valid(...AVAILABILITY)
      .required(),
  )
  availability: string;
}
