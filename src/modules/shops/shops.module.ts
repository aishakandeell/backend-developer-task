import { Module, forwardRef } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Shop } from 'src/modules/shops/shops.model';
import { ShopsController } from 'src/modules/shops/shops.controller';
import { ShopsService } from 'src/modules/shops/shops.service';
import { ShopsRepository } from 'src/modules/shops/shops.repository';
import { ProductsModule } from 'src/modules/products/products.module';

@Module({
  imports: [SequelizeModule.forFeature([Shop]), forwardRef(() => ProductsModule)],
  controllers: [ShopsController],
  providers: [ShopsService, ShopsRepository],
  exports: [ShopsService, ShopsRepository],
})
export class ShopsModule {}
