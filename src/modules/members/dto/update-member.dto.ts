import { JoiSchema } from 'nestjs-joi';
import * as Joi from 'joi';
import { GENDERS } from 'src/modules/members/members.constants';

/**
 * All fields are optional for a partial update, but when a field is provided it
 * must satisfy the same rules as on creation.
 */
export class UpdateMemberDTO {
  @JoiSchema(Joi.string().trim().min(1).optional())
  firstName?: string;

  @JoiSchema(Joi.string().trim().min(1).optional())
  lastName?: string;

  @JoiSchema(
    Joi.string()
      .valid(...GENDERS)
      .optional(),
  )
  gender?: string;

  @JoiSchema(Joi.string().isoDate().optional())
  dateOfBirth?: string;

  @JoiSchema(Joi.string().isoDate().optional())
  subscriptionDate?: string;

  @JoiSchema(Joi.string().trim().optional())
  phone?: string;

  /**
   * Link to a central member. When provided it must be a valid UUID; `null`
   * unlinks the member from its current central member.
   */
  @JoiSchema(Joi.string().uuid().allow(null).optional())
  centralMemberId?: string | null;
}
