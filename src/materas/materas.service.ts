import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class MaterasService {
  constructor(private prisma: PrismaService) {}

  async obtenerPorUsuario(usuarioId: string) {
    return this.prisma.matera.findMany({
      where: { usuarioId },
      include: {
        alertas: { where: { activa: true }, orderBy: { creadoEn: 'desc' } },
        mediciones: { orderBy: { creadoEn: 'desc' }, take: 24 },
      },
    });
  }

  async obtenerPorId(id: string) {
    const mat = await this.prisma.matera.findUnique({
      where: { id },
      include: {
        alertas: { where: { activa: true } },
        mediciones: { orderBy: { creadoEn: 'desc' }, take: 48 },
      },
    });
    if (!mat) throw new NotFoundException('Matera no encontrada');
    return mat;
  }

  async actualizarConfig(id: string, data: { umbralHumedad?: number; riegoAutomatico?: boolean; segundosRiego?: number }) {
    return this.prisma.matera.update({
      where: { id },
      data,
    });
  }

  async resolverAlerta(alertaId: string) {
    return this.prisma.alerta.update({
      where: { id: alertaId },
      data: { activa: false, resueltaEn: new Date() },
    });
  }
}
