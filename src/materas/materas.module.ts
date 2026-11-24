import { Module } from '@nestjs/common';
import { MaterasService } from './materas.service.js';
import { MaterasController } from './materas.controller.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [MaterasController],
  providers: [MaterasService, PrismaService],
  exports: [MaterasService],
})
export class MaterasModule {}
