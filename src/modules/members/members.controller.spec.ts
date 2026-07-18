import { Test, TestingModule } from '@nestjs/testing';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';

describe('MembersController', () => {
  let controller: MembersController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const memberId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const member = { id: memberId, firstName: 'Alice' };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MembersController],
      providers: [{ provide: MembersService, useValue: service }],
    }).compile();

    controller = module.get<MembersController>(MembersController);
  });

  it('create delegates to the service with the DTO', async () => {
    const dto = { firstName: 'Alice', lastName: 'A' };
    service.create.mockResolvedValue(member);

    const result = await controller.create(dto as any);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(member);
  });

  it('findAll passes the query (search, gender, pagination) through to the service', async () => {
    const query = { search: 'ali', gender: 'male', page: 1, limit: 20 };
    const paged = { data: [member], page: 1, limit: 20, total: 1, totalPages: 1 };
    service.findAll.mockResolvedValue(paged);

    const result = await controller.findAll(query as any);

    expect(service.findAll).toHaveBeenCalledWith(query);
    expect(result).toBe(paged);
  });

  it('findOne forwards the id to the service', async () => {
    service.findOne.mockResolvedValue(member);

    const result = await controller.findOne(memberId);

    expect(service.findOne).toHaveBeenCalledWith(memberId);
    expect(result).toBe(member);
  });

  it('update forwards the id and body to the service', async () => {
    const dto = { firstName: 'Alicia' };
    service.update.mockResolvedValue(member);

    const result = await controller.update(memberId, dto);

    expect(service.update).toHaveBeenCalledWith(memberId, dto);
    expect(result).toBe(member);
  });

  it('delete forwards the id to the service', async () => {
    service.delete.mockResolvedValue(undefined);

    await controller.delete(memberId);

    expect(service.delete).toHaveBeenCalledWith(memberId);
  });
});
