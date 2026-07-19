import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
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

  // This endpoint is expensive (loads shops with all their products) but its
  // data changes rarely, so we cache each page for 60s. The cache key includes
  // the query string, so different page/limit combinations are cached
  // separately.
  @Get('with-products')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000)
  async findAllWithProducts(
    @Query() query: ShopsWithProductsQueryDTO,
  ): Promise<PaginatedDTO<ShopWithProductsDTO>> {
    return this.shopsService.findAllWithProducts(query);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ShopDTO> {
    return this.shopsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateShopDto: UpdateShopDTO,
  ): Promise<ShopDTO> {
    return this.shopsService.update(id, updateShopDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.shopsService.delete(id);
  }
}
