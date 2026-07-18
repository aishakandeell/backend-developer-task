import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  // Mock the whole service: the controller's only job is to delegate to it.
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const productId = '11111111-1111-1111-1111-111111111111';
  const product = { id: productId, name: 'Apple Juice' };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: service }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('create delegates to the service with the DTO', async () => {
    const dto = { shopId: 's1', name: 'X', description: 'd', price: 1, stockCount: 1 };
    service.create.mockResolvedValue(product);

    const result = await controller.create(dto as any);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toBe(product);
  });

  it('findAll passes the search query through to the service', async () => {
    service.findAll.mockResolvedValue([product]);

    const result = await controller.findAll({ search: 'app' });

    expect(service.findAll).toHaveBeenCalledWith('app');
    expect(result).toEqual([product]);
  });

  it('findAll works when no search term is provided', async () => {
    service.findAll.mockResolvedValue([product]);

    await controller.findAll({});

    expect(service.findAll).toHaveBeenCalledWith(undefined);
  });

  it('findOne forwards the id to the service', async () => {
    service.findOne.mockResolvedValue(product);

    const result = await controller.findOne(productId);

    expect(service.findOne).toHaveBeenCalledWith(productId);
    expect(result).toBe(product);
  });

  it('update forwards the id and body to the service', async () => {
    const dto = { price: 30 };
    service.update.mockResolvedValue(product);

    const result = await controller.update(productId, dto);

    expect(service.update).toHaveBeenCalledWith(productId, dto);
    expect(result).toBe(product);
  });

  it('delete forwards the id to the service', async () => {
    service.delete.mockResolvedValue(undefined);

    await controller.delete(productId);

    expect(service.delete).toHaveBeenCalledWith(productId);
  });
});
