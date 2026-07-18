import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { ShopsRepository } from './shops.repository';

describe('ShopsService', () => {
  let service: ShopsService;
  let repository: {
    create: jest.Mock;
    findAll: jest.Mock;
    findAllWithProducts: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };

  const shopId = '00e82da7-311c-4fa0-8ae6-6be313f00ac5';
  const shop = {
    id: shopId,
    name: 'Shop 1',
    openingHour: new Date('2026-01-01T09:00:00.000Z'),
    closingHour: new Date('2026-01-01T17:00:00.000Z'),
    availability: 'open',
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllWithProducts: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopsService,
        { provide: ShopsRepository, useValue: repository },
      ],
    }).compile();

    service = module.get<ShopsService>(ShopsService);
  });

  describe('create', () => {
    it('creates and returns the shop', async () => {
      repository.create.mockResolvedValue(shop);

      const result = await service.create(shop as any);

      expect(repository.create).toHaveBeenCalledWith(shop);
      expect(result).toEqual(shop);
    });
  });

  describe('findAll', () => {
    it('returns all shops from the repository', async () => {
      repository.findAll.mockResolvedValue([shop]);

      await expect(service.findAll()).resolves.toEqual([shop]);
    });
  });

  describe('findAllWithProducts', () => {
    it('paginates and maps each shop through toJSON', async () => {
      const plainShop = { ...shop, products: [{ id: 'p1', name: 'Milk' }] };
      // Rows are Sequelize-like instances: the service calls .toJSON() on each.
      const rows = [{ toJSON: () => plainShop }];
      repository.findAllWithProducts.mockResolvedValue({ rows, count: 5 });

      const result = await service.findAllWithProducts({
        page: 1,
        limit: 20,
      } as any);

      expect(repository.findAllWithProducts).toHaveBeenCalledWith(20, 0);
      expect(result).toEqual({
        data: [plainShop], // proves the toJSON mapping was applied
        page: 1,
        limit: 20,
        total: 5,
        totalPages: 1, // ceil(5 / 20)
      });
    });

    it('computes the offset from page and limit', async () => {
      repository.findAllWithProducts.mockResolvedValue({ rows: [], count: 0 });

      await service.findAllWithProducts({ page: 3, limit: 10 } as any);

      // page 3, limit 10 → offset 20
      expect(repository.findAllWithProducts).toHaveBeenCalledWith(10, 20);
    });
  });

  describe('findOne', () => {
    it('returns the shop when it exists', async () => {
      repository.findOne.mockResolvedValue(shop);

      await expect(service.findOne(shopId)).resolves.toEqual(shop);
    });

    it('throws NotFoundException when the shop does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(shopId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('updates and returns the shop', async () => {
      repository.update.mockResolvedValue({ ...shop, availability: 'closed' });

      const result = await service.update(shopId, { availability: 'closed' });

      expect(repository.update).toHaveBeenCalledWith(shopId, {
        availability: 'closed',
      });
      expect(result).toMatchObject({ availability: 'closed' });
    });

    it('throws NotFoundException when the shop does not exist', async () => {
      repository.update.mockResolvedValue(null);

      await expect(
        service.update(shopId, { availability: 'closed' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('deletes the shop when a row is removed', async () => {
      repository.delete.mockResolvedValue(1);

      await expect(service.delete(shopId)).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith(shopId);
    });

    it('throws NotFoundException when no row is removed', async () => {
      repository.delete.mockResolvedValue(0);

      await expect(service.delete(shopId)).rejects.toThrow(NotFoundException);
    });
  });
});
