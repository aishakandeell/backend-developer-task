import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { MembersService } from './members.service';
import { MembersRepository } from './members.repository';

describe('MembersService', () => {
  let service: MembersService;
  let repository: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    countFamilyMembers: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const memberId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const centralId = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const member = {
    id: memberId,
    firstName: 'Alice',
    lastName: 'A',
    gender: 'female',
    dateOfBirth: '1990-01-01',
    subscriptionDate: '2020-01-01',
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      countFamilyMembers: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        { provide: MembersRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
  });

  describe('create', () => {
    it('creates a member with no central member', async () => {
      repository.create.mockResolvedValue(member);

      const result = await service.create(member as any);

      expect(repository.create).toHaveBeenCalledWith(member);
      // No central member provided → no central-member lookup should happen.
      expect(repository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(member);
    });

    it('creates a member with a valid central member', async () => {
      // Central member exists and is not itself a family member.
      repository.findOne.mockResolvedValue({ id: centralId, centralMemberId: null });
      repository.create.mockResolvedValue(member);

      await service.create({ ...member, centralMemberId: centralId } as any);

      expect(repository.findOne).toHaveBeenCalledWith(centralId);
      expect(repository.create).toHaveBeenCalled();
    });

    it('throws BadRequestException when the central member does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.create({ ...member, centralMemberId: centralId } as any),
      ).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the central member is itself a family member', async () => {
      // The chosen central member already has a central member of its own.
      repository.findOne.mockResolvedValue({
        id: centralId,
        centralMemberId: 'someone-else',
      });

      await expect(
        service.create({ ...member, centralMemberId: centralId } as any),
      ).rejects.toThrow(BadRequestException);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns a paginated result with correct metadata', async () => {
      repository.findAll.mockResolvedValue({ rows: [member], count: 42 });

      const result = await service.findAll({
        search: undefined,
        gender: undefined,
        page: 2,
        limit: 20,
      } as any);

      // page 2, limit 20 → offset 20
      expect(repository.findAll).toHaveBeenCalledWith(
        { search: undefined, gender: undefined },
        20,
        20,
      );
      expect(result).toEqual({
        data: [member],
        page: 2,
        limit: 20,
        total: 42,
        totalPages: 3, // ceil(42 / 20)
      });
    });

    it('passes the search and gender filters through to the repository', async () => {
      repository.findAll.mockResolvedValue({ rows: [], count: 0 });

      await service.findAll({
        search: 'ali',
        gender: 'male',
        page: 1,
        limit: 10,
      } as any);

      expect(repository.findAll).toHaveBeenCalledWith(
        { search: 'ali', gender: 'male' },
        10,
        0,
      );
    });
  });

  describe('findOne', () => {
    it('returns the member when it exists', async () => {
      repository.findOne.mockResolvedValue(member);

      await expect(service.findOne(memberId)).resolves.toEqual(member);
    });

    it('throws NotFoundException when the member does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(memberId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates and returns the member', async () => {
      repository.findOne.mockResolvedValue(member); // existing member
      repository.update.mockResolvedValue({ ...member, firstName: 'Alicia' });

      const result = await service.update(memberId, { firstName: 'Alicia' });

      expect(repository.update).toHaveBeenCalledWith(memberId, {
        firstName: 'Alicia',
      });
      expect(result).toMatchObject({ firstName: 'Alicia' });
    });

    it('throws NotFoundException when the member does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update(memberId, { firstName: 'X' }),
      ).rejects.toThrow(NotFoundException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when a member is set as their own central member', async () => {
      repository.findOne.mockResolvedValue(member); // existing member

      await expect(
        service.update(memberId, { centralMemberId: memberId }),
      ).rejects.toThrow(BadRequestException);
      expect(repository.update).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when the member already has family members', async () => {
      repository.findOne
        .mockResolvedValueOnce(member) // existing member
        .mockResolvedValueOnce({ id: centralId, centralMemberId: null }); // valid central
      repository.countFamilyMembers.mockResolvedValue(2); // has family members

      await expect(
        service.update(memberId, { centralMemberId: centralId }),
      ).rejects.toThrow(BadRequestException);
      expect(repository.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes the member when a row is removed', async () => {
      repository.delete.mockResolvedValue(1);

      await expect(service.delete(memberId)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(memberId);
    });

    it('throws NotFoundException when no row is removed', async () => {
      repository.delete.mockResolvedValue(0);

      await expect(service.delete(memberId)).rejects.toThrow(NotFoundException);
    });
  });
});
