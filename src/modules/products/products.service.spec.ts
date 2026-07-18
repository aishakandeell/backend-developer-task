import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsRepository } from './products.repository';
import { ShopsRepository } from 'src/modules/shops/shops.repository';

describe('ProductsService', () => {
  let service: ProductsService;
  // Typed mocks: only the methods the service actually calls.
  let productsRepository: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let shopsRepository: { findOne: jest.Mock };

  const shopId = '00e82da7-311c-4fa0-8ae6-6be313f00ac5';
  const productId = '11111111-1111-1111-1111-111111111111';
  const product = {
    id: productId,
    shopId,
    name: 'Apple Juice',
    description: 'Fresh apple juice',
    price: 25,
    stockCount: 10,
  };

  beforeEach(async () => {
    // Fresh mocks for every test so state never leaks between cases.
    productsRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    shopsRepository = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: ProductsRepository, useValue: productsRepository },
        { provide: ShopsRepository, useValue: shopsRepository },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  describe('create', () => {
    it('creates a product when the referenced shop exists', async () => {
      shopsRepository.findOne.mockResolvedValue({ id: shopId });
      productsRepository.create.mockResolvedValue(product);

      const result = await service.create(product as any);

      expect(shopsRepository.findOne).toHaveBeenCalledWith(shopId);
      expect(productsRepository.create).toHaveBeenCalledWith(product);
      expect(result).toEqual(product);
    });

    it('throws BadRequestException when the shop does not exist', async () => {
      shopsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(product as any)).rejects.toThrow(
        BadRequestException,
      );
      // The product must NOT be created if its shop is invalid.
      expect(productsRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('returns all products when no search term is given', async () => {
      productsRepository.findAll.mockResolvedValue([product]);

      const result = await service.findAll();

      expect(productsRepository.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toEqual([product]);
    });

    it('passes the search term through to the repository', async () => {
      productsRepository.findAll.mockResolvedValue([product]);

      await service.findAll('app');

      expect(productsRepository.findAll).toHaveBeenCalledWith('app');
    });
  });

  describe('findOne', () => {
    it('returns the product when it exists', async () => {
      productsRepository.findOne.mockResolvedValue(product);

      await expect(service.findOne(productId)).resolves.toEqual(product);
    });

    it('throws NotFoundException when the product does not exist', async () => {
      productsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(productId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('updates and returns the product', async () => {
      productsRepository.update.mockResolvedValue({ ...product, price: 30 });

      const result = await service.update(productId, { price: 30 });

      expect(productsRepository.update).toHaveBeenCalledWith(productId, {
        price: 30,
      });
      expect(result).toMatchObject({ price: 30 });
    });

    it('validates the new shop when shopId is being changed', async () => {
      shopsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(productId, { shopId: 'new-shop-id' }),
      ).rejects.toThrow(BadRequestException);
      expect(productsRepository.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the product does not exist', async () => {
      productsRepository.update.mockResolvedValue(null);

      await expect(service.update(productId, { price: 30 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('deletes the product when a row is removed', async () => {
      productsRepository.delete.mockResolvedValue(1);

      await expect(service.delete(productId)).resolves.toBeUndefined();
      expect(productsRepository.delete).toHaveBeenCalledWith(productId);
    });

    it('throws NotFoundException when no row is removed', async () => {
      productsRepository.delete.mockResolvedValue(0);

      await expect(service.delete(productId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
