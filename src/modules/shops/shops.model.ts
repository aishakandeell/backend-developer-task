import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  Model,
  HasMany,
} from 'sequelize-typescript';
import { Product } from 'src/modules/products/products.model';
import { AVAILABILITY } from 'src/modules/shops/shops.constants';

@Table({ tableName: 'shops' })
export class Shop extends Model<Shop> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @Column({ type: DataType.STRING(255), allowNull: false })
  name: string;

  @Column({ type: DataType.DATE, allowNull: false })
  openingHour: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  closingHour: Date;

  // Business rule: availability is one of busy, open, or closed. Enforced at
  // the model layer (runs on create/update) in addition to the DTO validation.
  @Column({
    type: DataType.STRING(32),
    allowNull: false,
    validate: { isIn: [[...AVAILABILITY]] },
  })
  availability: string;

  @HasMany(() => Product)
  products?: Product[];
}
