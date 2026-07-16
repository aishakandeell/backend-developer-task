import {
  Table,
  Column,
  DataType,
  PrimaryKey,
  Model,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Shop } from 'src/modules/shops/shops.model';

@Table({ tableName: 'products' })
export class Product extends Model<Product> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ForeignKey(() => Shop)
  @Column({ type: DataType.UUID, allowNull: false })
  shopId: string;

  @BelongsTo(() => Shop)
  shop?: Shop;

  @Column({ type: DataType.STRING(255), allowNull: false })
  name: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  description: string;

  // Business rule: price must be positive (never zero or negative).
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  })
  price: number;

  // Business rule: stock count can not be less than 1 for a product.
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: { min: 1 },
  })
  stockCount: number;
}
