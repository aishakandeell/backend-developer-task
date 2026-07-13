import { Injectable } from '@nestjs/common';
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
   * This method creates a new member
   * @param member - The member to create
   * @returns The created member
   */
  async create(member: CreateMemberDTO): Promise<MemberDTO> {
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

  async findOne(id: string): Promise<MemberDTO> {
    return this.repository.findOne(id);
  }

  async update(id: string, member: UpdateMemberDTO): Promise<MemberDTO> {
    return this.repository.update(id, member);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
