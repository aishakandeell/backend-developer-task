import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PaginatedDTO } from 'src/common/dto/paginated.dto';
import { CreateMemberDTO } from 'src/modules/members/dto/create-member.dto';
import { FindMembersQueryDTO } from 'src/modules/members/dto/find-members-query.dto';
import { MemberDTO } from 'src/modules/members/dto/member.dto';
import { UpdateMemberDTO } from 'src/modules/members/dto/update-member.dto';
import { MembersRepository } from 'src/modules/members/members.repository';

@Injectable()
export class MembersService {
  constructor(private readonly repository: MembersRepository) {}

  /**
   * Validates a central-member assignment against the family-link business rules.
   *
   * @param memberId - The member being linked (undefined when creating a new
   *   member, whose id does not exist yet).
   * @param centralMemberId - The central member to link to.
   * @throws {BadRequestException} If any family-link rule is violated.
   */
  private async assertValidCentralMember(
    memberId: string | undefined,
    centralMemberId: string,
  ): Promise<void> {
    // Rule: a member cannot be their own central member.
    if (memberId && memberId === centralMemberId) {
      throw new BadRequestException(
        'A member cannot be their own central member',
      );
    }

    // Rule: the selected central member must exist.
    const centralMember = await this.repository.findOne(centralMemberId);
    if (!centralMember) {
      throw new BadRequestException(
        `Central member with id "${centralMemberId}" not found`,
      );
    }

    // Rule: a family member cannot also be a central member. A member is a
    // family member when it already has a central member of its own.
    if (centralMember.centralMemberId) {
      throw new BadRequestException(
        'The selected central member is itself a family member and cannot be a central member',
      );
    }

    // Rule: a member who already has family members cannot become another
    // member's family member. (Only relevant for an existing member.)
    if (memberId) {
      const familyMemberCount =
        await this.repository.countFamilyMembers(memberId);
      if (familyMemberCount > 0) {
        throw new BadRequestException(
          'A member who already has family members cannot be linked to a central member',
        );
      }
    }
  }

  /**
   * Creates a new member, enforcing the family-link rules when a central member
   * is provided.
   * @param member - The member to create.
   * @returns The created member.
   */
  async create(member: CreateMemberDTO): Promise<MemberDTO> {
    if (member.centralMemberId) {
      await this.assertValidCentralMember(undefined, member.centralMemberId);
    }

    return this.repository.create(member);
  }

  /**
   * Finds a page of members, optionally filtered by a case-insensitive name
   * search. Paginating avoids returning the entire (70k+) member base in a
   * single response, which would overload the client.
   *
   * @param query - Search term and pagination options (page, limit).
   * @returns A page of members plus pagination metadata.
   */
  async findAll(
    query: FindMembersQueryDTO,
  ): Promise<PaginatedDTO<MemberDTO>> {
    const { search, gender, page, limit } = query;
    const offset = (page - 1) * limit;

    const { rows, count } = await this.repository.findAll(
      { search, gender },
      limit,
      offset,
    );

    return {
      data: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Fetches a single member by ID.
   * @param id - The member ID.
   * @returns The member.
   * @throws {NotFoundException} If no member exists with the given ID.
   */
  async findOne(id: string): Promise<MemberDTO> {
    const member = await this.repository.findOne(id);

    if (!member) {
      throw new NotFoundException(`Member with id "${id}" not found`);
    }

    return member;
  }

  /**
   * Updates an existing member, enforcing the family-link rules when the
   * central member is being (re)assigned.
   * @param id - The member ID.
   * @param member - The fields to update.
   * @returns The updated member.
   * @throws {NotFoundException} If no member exists with the given ID.
   */
  async update(id: string, member: UpdateMemberDTO): Promise<MemberDTO> {
    const existing = await this.repository.findOne(id);
    if (!existing) {
      throw new NotFoundException(`Member with id "${id}" not found`);
    }

    // Only validate when a (non-null) central member is being assigned. A null
    // value unlinks the member, which needs no family-link checks.
    if (member.centralMemberId) {
      await this.assertValidCentralMember(id, member.centralMemberId);
    }

    const updated = await this.repository.update(id, member);
    if (!updated) {
      throw new NotFoundException(`Member with id "${id}" not found`);
    }

    return updated;
  }

  /**
   * Deletes a member by ID.
   * @param id - The member ID.
   * @throws {NotFoundException} If no member exists with the given ID.
   */
  async delete(id: string): Promise<void> {
    const deletedCount = await this.repository.delete(id);

    if (deletedCount === 0) {
      throw new NotFoundException(`Member with id "${id}" not found`);
    }
  }
}
