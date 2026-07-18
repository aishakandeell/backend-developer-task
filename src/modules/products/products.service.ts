import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ProductsRepository } from 'src/modules/products/products.repository';
import { ShopsRepository } from 'src/modules/shops/shops.repository';
import { ProductDTO } from 'src/modules/products/dto/product.dto';
import { CreateProductDTO } from 'src/modules/products/dto/create-product.dto';
import { UpdateProductDTO } from 'src/modules/products/dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly repository: ProductsRepository,
    private readonly shopsRepository: ShopsRepository,
  ) {}

  /**
   * Ensures the given shop exists before linking a product to it.
   * @param shopId - The shop ID to check.
   * @throws {BadRequestException} If no shop exists with the given ID.
   */
  private async assertShopExists(shopId: string): Promise<void> {
    const shop = await this.shopsRepository.findOne(shopId);

    if (!shop) {
      throw new BadRequestException(`Shop with id "${shopId}" not found`);
    }
  }

  /**
   * Creates a new product.
   * @param product - The product to create.
   * @returns The created product.
   */
  async create(product: CreateProductDTO): Promise<ProductDTO> {
    await this.assertShopExists(product.shopId);

    return this.repository.create(product);
  }

  /**
   * Lists all products in the club, optionally filtered by a case-insensitive
   * search against the product name.
   * @param search - Optional product-name substring to search for.
   * @returns The matching products.
   */
  async findAll(search?: string): Promise<ProductDTO[]> {
    return this.repository.findAll(search);
  }

  /**
   * Fetches a single product by ID.
   * @param id - The product ID.
   * @returns The product.
   * @throws {NotFoundException} If no product exists with the given ID.
   */
  async findOne(id: string): Promise<ProductDTO> {
    const product = await this.repository.findOne(id);

    if (!product) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return product;
  }

  /**
   * Updates an existing product.
   * @param id - The product ID.
   * @param product - The fields to update.
   * @returns The updated product.
   * @throws {NotFoundException} If no product exists with the given ID.
   */
  async update(id: string, product: UpdateProductDTO): Promise<ProductDTO> {
    if (product.shopId) {
      await this.assertShopExists(product.shopId);
    }

    const updated = await this.repository.update(id, product);

    if (!updated) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }

    return updated;
  }

  /**
   * Deletes a product by ID.
   * @param id - The product ID.
   * @throws {NotFoundException} If no product exists with the given ID.
   */
  async delete(id: string): Promise<void> {
    const deletedCount = await this.repository.delete(id);

    if (deletedCount === 0) {
      throw new NotFoundException(`Product with id "${id}" not found`);
    }
  }
}
