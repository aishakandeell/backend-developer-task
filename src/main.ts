import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Validation is handled globally and consistently by nestjs-joi's JoiPipe
  // (registered in AppModule). We intentionally do NOT register the
  // class-validator ValidationPipe here: our DTOs use Joi (@JoiSchema), not
  // class-validator decorators, so a whitelisting ValidationPipe would strip
  // the Joi-decorated fields. Joi's `allowUnknown: false` already rejects
  // unknown fields.
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}
bootstrap();
