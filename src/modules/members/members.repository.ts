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
   * @returns {Promise<Member | null>} The member row, or `null` if not found.
   * @throws {Error} If the database query fails.
   */
  async findOne(id: string): Promise<Member | null> {
    return this.memberModel.findByPk(id);
  }

  /**
   * Counts how many members are linked to the given member as their central
   * member (i.e. that member's family members).
   *
   * @param {string} centralMemberId - The central member's ID.
   * @returns {Promise<number>} The number of family members.
   * @throws {Error} If the database query fails.
   */
  async countFamilyMembers(centralMemberId: string): Promise<number> {
    return this.memberModel.count({ where: { centralMemberId } });
  }

  /**
   * Updates a member by ID and returns the updated row.
   *
   * @param {string} id - Member ID to update.
   * @param {Partial<Member>} member - Fields to update.
   * @returns {Promise<Member | null>} The updated member row, or `null` if no
   *   row matched the given ID.
   * @throws {Error} If the database update fails.
   */
  async update(id: string, member: Partial<Member>): Promise<Member | null> {
    const [, updatedRows] = await this.memberModel.update(member, {
      where: { id },
      returning: true,
    });

    return updatedRows[0] ?? null;
  }

  /**
   * Deletes a member by ID.
   *
   * @param {string} id - Member ID to delete.
   * @returns {Promise<number>} The number of rows deleted (0 if none matched).
   * @throws {Error} If the database delete fails.
   */
  async delete(id: string): Promise<number> {
    return this.memberModel.destroy({ where: { id } });
  }
}
