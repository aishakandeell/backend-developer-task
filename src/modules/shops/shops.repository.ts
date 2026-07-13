import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Shop } from 'src/modules/shops/shops.model';
import { Product } from 'src/modules/products/products.model';

@Injectable()
export class ShopsRepository {
  constructor(@InjectModel(Shop) private readonly shopModel: typeof Shop) {}

  async create(shop: Partial<Shop>): Promise<Shop> {
    return this.shopModel.create(shop);
  }

  async findAll(): Promise<Shop[]> {
    return this.shopModel.findAll();
  }

  /**
   * Fetches a page of shops, each with its products eagerly loaded.
   *
   * Uses `separate: true` so Sequelize runs two queries instead of a JOIN:
   * one for the page of shops and one batched `WHERE shopId IN (...)` for their
   * products. This avoids the N+1 problem and the row duplication a JOIN would
   * cause. `findAndCountAll` also returns the total shop count for pagination.
   *
   * @param {number} limit - Maximum number of shops to return.
   * @param {number} offset - Number of shops to skip before the page.
   * @returns {Promise<{ rows: Shop[]; count: number }>} The page of shops with
   *   their `products` populated, plus the total number of shops.
   * @throws {Error} If the database query fails.
   */
  async findAllWithProducts(
    limit: number,
    offset: number,
  ): Promise<{ rows: Shop[]; count: number }> {
    return this.shopModel.findAndCountAll({
      include: [{ model: Product, separate: true }],
      limit,
      offset,
      // Stable ordering so pages don't overlap or skip rows between requests.
      order: [
        ['createdAt', 'ASC'],
        ['id', 'ASC'],
      ],
    });
  }

  async findOne(id: string): Promise<Shop> {
    return this.shopModel.findByPk(id);
  }

  async update(id: string, shop: Partial<Shop>): Promise<Shop> {
    const result = await this.shopModel.update(shop, {
      where: { id },
      returning: true,
    });

    return result[1][0];
  }

  async delete(id: string): Promise<void> {
    await this.shopModel.destroy({ where: { id } });
  }
}
