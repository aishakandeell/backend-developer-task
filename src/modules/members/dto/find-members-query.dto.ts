import * as Joi from 'joi';
import { JoiSchema } from 'nestjs-joi';
import { GENDERS } from 'src/modules/members/members.constants';

/**
 * Query parameters for listing members: optional filters (case-insensitive
 * name search, gender) plus pagination. Defaults keep responses small so the
 * endpoint does not return the entire (70k+) member base at once.
 */
export class FindMembersQueryDTO {
  /** Case-insensitive substring matched against first name OR last name. */
  @JoiSchema(Joi.string().trim().allow('').optional())
  search?: string;

  /** Optional exact-match filter on gender. */
  @JoiSchema(
    Joi.string()
      .valid(...GENDERS)
      .optional(),
  )
  gender?: string;

  /** 1-based page number. */
  @JoiSchema(Joi.number().integer().min(1).default(1))
  page: number;

  /** Number of members to return per page (capped to protect the server). */
  @JoiSchema(Joi.number().integer().min(1).max(100).default(20))
  limit: number;
}
