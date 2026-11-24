import { Module } from '@nestjs/common';
import { TelemetriaService } from './telemetria.service.js';
import { TelemetriaController } from './telemetria.controller.js';
import { PrismaService } from '../prisma.service.js';

@Module({
  controllers: [TelemetriaController],
  providers: [TelemetriaService, PrismaService],
  exports: [TelemetriaService],
})
export class TelemetriaModule {}
