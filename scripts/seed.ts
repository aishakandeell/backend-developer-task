import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import * as dotenv from 'dotenv';

import { Member } from '../src/modules/members/members.model';
import { Shop } from '../src/modules/shops/shops.model';
import { Product } from '../src/modules/products/products.model';

dotenv.config();

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL in environment');
  }

  const sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    models: [Member, Shop, Product],
    logging: false,
  });

  await sequelize.authenticate();

  await sequelize.sync({ alter: false });

  await Product.destroy({ where: {}, truncate: true, cascade: true });
  await Shop.destroy({ where: {}, truncate: true, cascade: true });
  await Member.destroy({ where: {}, truncate: true, cascade: true });

  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  // Shops: 1..100
  const shopsPayload: Partial<Shop>[] = [];
  const availabilityCycle = ['open', 'busy', 'closed'] as const;
  for (let i = 1; i <= 100; i++) {
    shopsPayload.push({
      name: `Shop ${i}`,
      openingHour: now,
      closingHour: twoHoursLater,
      availability: availabilityCycle[i % availabilityCycle.length],
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seeding shops...');
  const shops = await Shop.bulkCreate(shopsPayload as any, { validate: false });

  // Products: 70 per shop
  // eslint-disable-next-line no-console
  console.log('Seeding products...');
  const productsPayload: Partial<Product>[] = [];
  for (let shopIndex = 0; shopIndex < shops.length; shopIndex++) {
    const shop = shops[shopIndex];
    for (let j = 1; j <= 70; j++) {
      const n = shopIndex * 70 + j;
      productsPayload.push({
        shopId: shop.id,
        name: `Product ${j} (Shop ${shopIndex + 1})`,
        description: `Seeded product ${n}`,
        price: (n % 300) + 5,
        stockCount: (n % 200) + 1,
      });
    }
  }

  for (const batch of chunk(productsPayload, 2000)) {
    await Product.bulkCreate(batch as any, { validate: false });
  }

  // Members: 1..50k
  // eslint-disable-next-line no-console
  console.log('Seeding members...');
  const membersPayload: Partial<Member>[] = [];
  for (let i = 1; i <= 50_000; i++) {
    membersPayload.push({
      firstName: `Member${i}`,
      lastName: 'BlueRibbon',
      gender: i % 2 === 0 ? 'female' : 'male',
      dateOfBirth: '1995-01-01',
      subscriptionDate: '2020-01-01',
      phone: `010${String(i).padStart(8, '0')}`,
    });
  }

  for (const batch of chunk(membersPayload, 5000)) {
    await Member.bulkCreate(batch as any, { validate: false });
    // eslint-disable-next-line no-console
    console.log(`Seeded members: +${batch.length}`);
  }

  await sequelize.close();
}

seed()
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Seed completed');
    process.exit(0);
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed', err);
    process.exit(1);
  });
