import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { TelemetriaService } from './telemetria.service.js';

@Controller('telemetria')
export class TelemetriaController {
  constructor(private telemetriaService: TelemetriaService) {}

  @Post('lectura')
  async registrarLectura(
    @Body()
    body: {
      materaId: string;
      humedad: number;
      ph: number;
      lux: number;
      tanque: number;
      cara?: string;
      fueRiego?: boolean;
    },
  ) {
    return this.telemetriaService.registrarLectura(body);
  }

  @Get(':materaId/historial')
  async obtenerHistorial(@Param('materaId') materaId: string, @Query('limite') limite?: string) {
    return this.telemetriaService.obtenerHistorial(materaId, limite ? parseInt(limite, 10) : 48);
  }

  @Post(':materaId/regar')
  async regar(
    @Param('materaId') materaId: string,
    @Body() body: { segundos?: number; origen?: 'manual' | 'auto' },
  ) {
    return this.telemetriaService.registrarRiego(materaId, body.segundos || 5, body.origen || 'manual');
  }
}
