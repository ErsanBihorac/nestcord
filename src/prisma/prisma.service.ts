import 'dotenv/config';
import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

// PrismaService welcher von PrismaClient erbt um datenbankzugriffe zu ermöglichen
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
      }),
    });
  }
}
