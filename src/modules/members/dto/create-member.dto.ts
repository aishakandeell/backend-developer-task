import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { GENDERS } from 'src/modules/members/members.constants';

export class CreateMemberDTO {
  @JoiSchema(Joi.string().trim().min(1).required())
  firstName: string;

  @JoiSchema(Joi.string().trim().min(1).required())
  lastName: string;

  @JoiSchema(
    Joi.string()
      .valid(...GENDERS)
      .required(),
  )
  gender: string;

  @JoiSchema(Joi.string().isoDate().required())
  dateOfBirth: string;

  @JoiSchema(Joi.string().isoDate().required())
  subscriptionDate: string;

  @JoiSchema(Joi.string().trim().optional())
  phone?: string;

  /** Optional link to a central member. When provided it must be a valid UUID. */
  @JoiSchema(Joi.string().uuid().optional())
  centralMemberId?: string;
}
