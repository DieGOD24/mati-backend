import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module.js';
import { MaterasModule } from './materas/materas.module.js';
import { TelemetriaModule } from './telemetria/telemetria.module.js';
import { PrismaService } from './prisma.service.js';

@Module({
  imports: [
    AuthModule,
    MaterasModule,
    TelemetriaModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
