import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Product } from 'src/modules/products/products.model';

@Injectable()
export class ProductsRepository {
  constructor(
    @InjectModel(Product) private readonly productModel: typeof Product,
  ) {}

  /**
   * Creates a product row in the database.
   *
   * @param {Partial<Product>} product - Product fields to save.
   * @returns {Promise<Product>} The created product row.
   * @throws {Error} If the database insert fails.
   */
  async create(product: Partial<Product>): Promise<Product> {
    return this.productModel.create(product);
  }

  /**
   * Fetches all products, optionally filtered by a case-insensitive name search.
   *
   * @param {string} [search] - Optional substring to match against the product
   *   name, case-insensitively (e.g. "app" matches "Apple Juice" and "Pineapple").
   * @returns {Promise<Product[]>} The matching product rows.
   * @throws {Error} If the database query fails.
   */
  async findAll(search?: string): Promise<Product[]> {
    const where = search
      ? { name: { [Op.iLike]: `%${search}%` } }
      : undefined;

    return this.productModel.findAll({ where });
  }

  /**
   * Fetches a single product by ID.
   *
   * @param {string} id - Product ID to look up.
   * @returns {Promise<Product | null>} The product row, or `null` if not found.
   * @throws {Error} If the database query fails.
   */
  async findOne(id: string): Promise<Product | null> {
    return this.productModel.findByPk(id);
  }

  /**
   * Updates a product by ID and returns the updated row.
   *
   * @param {string} id - Product ID to update.
   * @param {Partial<Product>} product - Fields to update.
   * @returns {Promise<Product | null>} The updated product row, or `null` if no
   *   row matched the given ID.
   * @throws {Error} If the database update fails.
   */
  async update(id: string, product: Partial<Product>): Promise<Product | null> {
    const [, updatedRows] = await this.productModel.update(product, {
      where: { id },
      returning: true,
    });

    return updatedRows[0] ?? null;
  }

  /**
   * Deletes a product by ID.
   *
   * @param {string} id - Product ID to delete.
   * @returns {Promise<number>} The number of rows deleted (0 if none matched).
   * @throws {Error} If the database delete fails.
   */
  async delete(id: string): Promise<number> {
    return this.productModel.destroy({ where: { id } });
  }
}
