import { Controller, Get, Patch, Post, Param, Body } from '@nestjs/common';
import { MaterasService } from './materas.service.js';

@Controller('materas')
export class MaterasController {
  constructor(private materasService: MaterasService) {}

  @Get('usuario/:usuarioId')
  async obtenerPorUsuario(@Param('usuarioId') usuarioId: string) {
    return this.materasService.obtenerPorUsuario(usuarioId);
  }

  @Get(':id')
  async obtenerPorId(@Param('id') id: string) {
    return this.materasService.obtenerPorId(id);
  }

  @Patch(':id/config')
  async actualizarConfig(
    @Param('id') id: string,
    @Body() body: { umbralHumedad?: number; riegoAutomatico?: boolean; segundosRiego?: number },
  ) {
    return this.materasService.actualizarConfig(id, body);
  }

  @Post('alertas/:alertaId/resolver')
  async resolverAlerta(@Param('alertaId') alertaId: string) {
    return this.materasService.resolverAlerta(alertaId);
  }
}
