import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class TelemetriaService {
  constructor(private prisma: PrismaService) {}

  async registrarLectura(data: {
    materaId: string;
    humedad: number;
    ph: number;
    lux: number;
    tanque: number;
    cara?: string;
    fueRiego?: boolean;
  }) {
    const matera = await this.prisma.matera.findUnique({ where: { id: data.materaId } });
    if (!matera) throw new NotFoundException('Matera no encontrada');

    return this.prisma.medicion.create({
      data: {
        materaId: data.materaId,
        humedad: data.humedad,
        ph: data.ph,
        lux: data.lux,
        tanque: data.tanque,
        cara: data.cara || 'feliz',
        fueRiego: data.fueRiego || false,
      },
    });
  }

  async obtenerHistorial(materaId: string, limite = 48) {
    return this.prisma.medicion.findMany({
      where: { materaId },
      orderBy: { creadoEn: 'desc' },
      take: limite,
    });
  }

  async registrarRiego(materaId: string, segundos: number, origen: 'manual' | 'auto') {
    const matera = await this.prisma.matera.findUnique({ where: { id: materaId } });
    if (!matera) throw new NotFoundException('Matera no encontrada');

    // Descontar agua del tanque y registrar medición de riego
    const ultima = await this.prisma.medicion.findFirst({
      where: { materaId },
      orderBy: { creadoEn: 'desc' },
    });

    const tanqueActual = ultima ? ultima.tanque : 70;
    const nuevoTanque = Math.max(0, tanqueActual - 1.6 * segundos);
    const nuevaHumedad = Math.min(95, (ultima ? ultima.humedad : 40) + 4.2 * segundos);

    const medicion = await this.prisma.medicion.create({
      data: {
        materaId,
        humedad: parseFloat(nuevaHumedad.toFixed(1)),
        ph: ultima ? ultima.ph : 6.3,
        lux: ultima ? ultima.lux : 3000,
        tanque: parseFloat(nuevoTanque.toFixed(1)),
        cara: 'feliz',
        fueRiego: true,
      },
    });

    // Si el tanque queda muy bajo, generar alerta automática
    if (nuevoTanque < 20) {
      await this.prisma.alerta.create({
        data: {
          materaId,
          tipo: 'tanque',
          titulo: 'Tanque con poca agua',
          detalle: `Quedan solo ${nuevoTanque.toFixed(0)} % de agua en el tanque. Rellénalo pronto.`,
          activa: true,
        },
      });
    }

    return { exito: true, medicion, mensaje: `Riego ${origen} de ${segundos} s ejecutado exitosamente.` };
  }
}
