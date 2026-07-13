import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';
import { Member } from 'src/modules/members/members.model';

/** Optional filters for listing members. */
export interface MemberFilters {
  /** Case-insensitive substring matched against first name OR last name. */
  search?: string;
  /** Exact-match gender filter. */
  gender?: string;
}

@Injectable()
export class MembersRepository {
  constructor(
    @InjectModel(Member) private readonly memberModel: typeof Member,
  ) {}

  /**
   * Creates a member row in the database.
   *
   * @param {Partial<Member>} member - Member fields to save.
   * @returns {Promise<Member>} The created member row.
   * @throws {Error} If the database insert fails (for example: DB is down, invalid column value).
   */
  async create(member: Partial<Member>): Promise<Member> {
    return this.memberModel.create(member);
  }

  /**
   * Fetches a page of members matching the given filters, together with the
   * total count for pagination.
   *
   * @param {MemberFilters} filters - Optional filters: a case-insensitive name
   *   search (first name OR last name) and an exact-match gender. When both are
   *   given they are combined with AND.
   * @param {number} limit - Maximum number of members to return.
   * @param {number} offset - Number of members to skip before the page.
   * @returns {Promise<{ rows: Member[]; count: number }>} The page of members
   *   plus the total number of members matching the filters.
   * @throws {Error} If the database query fails.
   */
  async findAll(
    filters: MemberFilters,
    limit: number,
    offset: number,
  ): Promise<{ rows: Member[]; count: number }> {
    const where: WhereOptions<Member> = {};

    if (filters.gender) {
      where.gender = filters.gender;
    }

    if (filters.search) {
      where[Op.or as any] = [
        { firstName: { [Op.iLike]: `%${filters.search}%` } },
        { lastName: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    return this.memberModel.findAndCountAll({
      where,
      limit,
      offset,
      // Stable ordering so pages don't overlap or skip rows between requests.
      order: [
        ['lastName', 'ASC'],
        ['firstName', 'ASC'],
        ['id', 'ASC'],
      ],
    });
  }

  /**
   * Fetches a single member by ID.
   *
   * @param {string} id - Member ID to look up.
   * @returns {Promise<Member>} The member row (can be `null` at runtime if not found).
   * @throws {Error} If the database query fails.
   */
  async findOne(id: string): Promise<Member> {
    return this.memberModel.findByPk(id);
  }

  /**
   * Updates a member by ID and returns the updated row.
   *
   * @param {string} id - Member ID to update.
   * @param {Partial<Member>} member - Fields to update.
   * @returns {Promise<Member>} The updated member row (can be `undefined` at runtime if not found).
   * @throws {Error} If the database update fails.
   */
  async update(id: string, member: Partial<Member>): Promise<Member> {
    const result = await this.memberModel.update(member, {
      where: { id },
      returning: true,
    });

    return result[1][0];
  }

  /**
   * Deletes a member by ID.
   *
   * @param {string} id - Member ID to delete.
   * @returns {Promise<void>} Resolves when the delete query finishes.
   * @throws {Error} If the database delete fails.
   */
  async delete(id: string): Promise<void> {
    await this.memberModel.destroy({ where: { id } });
  }
}
