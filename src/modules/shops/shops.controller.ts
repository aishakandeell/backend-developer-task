import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDTO } from './dto/create-shop.dto';
import { UpdateShopDTO } from './dto/update-shop.dto';
import { ShopDTO } from './dto/shop.dto';
import { ShopWithProductsDTO } from 'src/modules/shops/dto/shop-with-products.dto';
import { ShopsWithProductsQueryDTO } from 'src/modules/shops/dto/shops-with-products-query.dto';
import { PaginatedDTO } from 'src/common/dto/paginated.dto';

@Controller('shops')
export class ShopsController {
  constructor(private readonly shopsService: ShopsService) {}

  @Post()
  async create(@Body() createShopDto: CreateShopDTO): Promise<ShopDTO> {
    return this.shopsService.create(createShopDto);
  }

  @Get()
  async findAll(): Promise<ShopDTO[]> {
    return this.shopsService.findAll();
  }

  @Get('with-products')
  async findAllWithProducts(
    @Query() query: ShopsWithProductsQueryDTO,
  ): Promise<PaginatedDTO<ShopWithProductsDTO>> {
    return this.shopsService.findAllWithProducts(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ShopDTO> {
    return this.shopsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateShopDto: UpdateShopDTO,
  ): Promise<ShopDTO> {
    return this.shopsService.update(id, updateShopDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return this.shopsService.delete(id);
  }
}
