import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Shop } from 'src/modules/shops/shops.model';
import { Product } from 'src/modules/products/products.model';

@Injectable()
export class ShopsRepository {
  constructor(@InjectModel(Shop) private readonly shopModel: typeof Shop) {}

  /**
   * Creates a shop row in the database.
   *
   * @param {Partial<Shop>} shop - Shop fields to save.
   * @returns {Promise<Shop>} The created shop row.
   * @throws {Error} If the database insert fails.
   */
  async create(shop: Partial<Shop>): Promise<Shop> {
    return this.shopModel.create(shop);
  }

  /**
   * Fetches all shops from the database.
   *
   * @returns {Promise<Shop[]>} All shop rows.
   * @throws {Error} If the database query fails.
   */
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

  /**
   * Fetches a single shop by ID.
   *
   * @param {string} id - Shop ID to look up.
   * @returns {Promise<Shop | null>} The shop row, or `null` if not found.
   * @throws {Error} If the database query fails.
   */
  async findOne(id: string): Promise<Shop | null> {
    return this.shopModel.findByPk(id);
  }

  /**
   * Updates a shop by ID and returns the updated row.
   *
   * @param {string} id - Shop ID to update.
   * @param {Partial<Shop>} shop - Fields to update.
   * @returns {Promise<Shop | null>} The updated shop row, or `null` if no row matched.
   * @throws {Error} If the database update fails.
   */
  async update(id: string, shop: Partial<Shop>): Promise<Shop | null> {
    const [, updatedRows] = await this.shopModel.update(shop, {
      where: { id },
      returning: true,
    });

    return updatedRows[0] ?? null;
  }

  /**
   * Deletes a shop by ID.
   *
   * @param {string} id - Shop ID to delete.
   * @returns {Promise<number>} The number of rows deleted (0 if none matched).
   * @throws {Error} If the database delete fails.
   */
  async delete(id: string): Promise<number> {
    return this.shopModel.destroy({ where: { id } });
  }
}
