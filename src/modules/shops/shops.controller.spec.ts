import { Test, TestingModule } from '@nestjs/testing';
import { ShopsController } from './shops.controller';
import { ShopsService } from './shops.service';

describe('ShopsController', () => {
  let controller: ShopsController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findAllWithProducts: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const shopId = '00e82da7-311c-4fa0-8ae6-6be313f00ac5';
  const shop = { id: shopId, name: 'Shop 1' };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllWithProducts: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShopsController],
      providers: [{ provide: ShopsService, useValue: service }],
    }).compile();

    controller = module.get<ShopsController>(ShopsController);
  });

  it('create delegates to the service with the DTO', async () => {
    const dto = { name: 'Shop 1', availability: 'open' };
    service.create.mockResolvedValue(shop);

    const result = await controller.create(dto as any);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(shop);
  });

  it('findAll delegates to the service', async () => {
    service.findAll.mockResolvedValue([shop]);

    const result = await controller.findAll();

    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([shop]);
  });

  it('findAllWithProducts passes the pagination query through to the service', async () => {
    const query = { page: 2, limit: 5 };
    const paged = { data: [shop], page: 2, limit: 5, total: 1, totalPages: 1 };
    service.findAllWithProducts.mockResolvedValue(paged);

    const result = await controller.findAllWithProducts(query as any);

    expect(service.findAllWithProducts).toHaveBeenCalledWith(query);
    expect(result).toBe(paged);
  });

  it('findOne forwards the id to the service', async () => {
    service.findOne.mockResolvedValue(shop);

    const result = await controller.findOne(shopId);

    expect(service.findOne).toHaveBeenCalledWith(shopId);
    expect(result).toBe(shop);
  });

  it('update forwards the id and body to the service', async () => {
    const dto = { availability: 'closed' };
    service.update.mockResolvedValue(shop);

    const result = await controller.update(shopId, dto);

    expect(service.update).toHaveBeenCalledWith(shopId, dto);
    expect(result).toBe(shop);
  });

  it('delete forwards the id to the service', async () => {
    service.delete.mockResolvedValue(undefined);

    await controller.delete(shopId);

    expect(service.delete).toHaveBeenCalledWith(shopId);
  });
});
