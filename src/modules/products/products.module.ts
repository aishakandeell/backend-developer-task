import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Product } from 'src/modules/products/products.model';
import { ProductsController } from 'src/modules/products/products.controller';
import { ProductsService } from 'src/modules/products/products.service';
import { ProductsRepository } from 'src/modules/products/products.repository';
import { ShopsModule } from 'src/modules/shops/shops.module';

@Module({
  imports: [SequelizeModule.forFeature([Product]), forwardRef(() => ShopsModule)],
  controllers: [ProductsController],
  providers: [ProductsService, ProductsRepository],
  exports: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
