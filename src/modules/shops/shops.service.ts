import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedDTO } from 'src/common/dto/paginated.dto';
import { CreateShopDTO } from 'src/modules/shops/dto/create-shop.dto';
import { ShopWithProductsDTO } from 'src/modules/shops/dto/shop-with-products.dto';
import { ShopsWithProductsQueryDTO } from 'src/modules/shops/dto/shops-with-products-query.dto';
import { ShopDTO } from 'src/modules/shops/dto/shop.dto';
import { UpdateShopDTO } from 'src/modules/shops/dto/update-shop.dto';
import { ShopsRepository } from 'src/modules/shops/shops.repository';

@Injectable()
export class ShopsService {
  constructor(private readonly repository: ShopsRepository) {}

  async create(shop: CreateShopDTO): Promise<ShopDTO> {
    return this.repository.create(shop);
  }

  async findAll(): Promise<ShopDTO[]> {
    return this.repository.findAll();
  }

  /**
   * Finds a page of shops, each with its products.
   *
   * Delegates to a single repository call that eagerly loads products in a
   * batched way (two queries total) instead of querying products per shop, and
   * paginates the shops so responses stay small on large datasets.
   *
   * @param query - Pagination options (page, limit).
   * @returns A page of shops with their products plus pagination metadata.
   */
  async findAllWithProducts(
    query: ShopsWithProductsQueryDTO,
  ): Promise<PaginatedDTO<ShopWithProductsDTO>> {
    const { page, limit } = query;
    const offset = (page - 1) * limit;

    const { rows, count } = await this.repository.findAllWithProducts(
      limit,
      offset,
    );

    return {
      // Return plain objects so the response is a clean DTO shape rather than
      // Sequelize model instances (which don't serialize predictably).
      data: rows.map((shop) => shop.toJSON() as ShopWithProductsDTO),
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    };
  }

  /**
   * Fetches a single shop by ID.
   * @param id - The shop ID.
   * @returns The shop.
   * @throws {NotFoundException} If no shop exists with the given ID.
   */
  async findOne(id: string): Promise<ShopDTO> {
    const shop = await this.repository.findOne(id);

    if (!shop) {
      throw new NotFoundException(`Shop with id "${id}" not found`);
    }

    return shop;
  }

  /**
   * Updates an existing shop.
   * @param id - The shop ID.
   * @param shop - The fields to update.
   * @returns The updated shop.
   * @throws {NotFoundException} If no shop exists with the given ID.
   */
  async update(id: string, shop: UpdateShopDTO): Promise<ShopDTO> {
    const updated = await this.repository.update(id, shop);

    if (!updated) {
      throw new NotFoundException(`Shop with id "${id}" not found`);
    }

    return updated;
  }

  /**
   * Deletes a shop by ID.
   * @param id - The shop ID.
   * @throws {NotFoundException} If no shop exists with the given ID.
   */
  async delete(id: string): Promise<void> {
    const deletedCount = await this.repository.delete(id);

    if (deletedCount === 0) {
      throw new NotFoundException(`Shop with id "${id}" not found`);
    }
  }
}
