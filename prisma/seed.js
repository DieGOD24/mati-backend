import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed in PostgreSQL mati_db...');

  // Limpiar datos existentes de forma segura
  await prisma.alerta.deleteMany();
  await prisma.medicion.deleteMany();
  await prisma.matera.deleteMany();
  await prisma.usuario.deleteMany();

  const salt = await bcrypt.genSalt(10);

  const cuentas = [
    {
      nombre: 'Carlos Méndez',
      correo: 'viajero@mati.cerebria.co',
      contrasena: 'viajero123',
      rol: 'Profesional Urbano / Viajero',
      tipoDemo: 'viajero',
      matera: {
        nombre: 'Lulú',
        especie: 'potus',
        ubicacion: 'Sala',
        codigo: 'MT-VIAJERO',
        umbralHumedad: 40.0,
        riegoAutomatico: true,
        segundosRiego: 5,
        alertas: [
          {
            tipo: 'tanque',
            titulo: 'Tanque con poca agua',
            detalle: 'Le queda agua para 1 o 2 riegos. Rellénalo antes de salir de viaje para que riegue sola.',
            activa: true,
            vista: false
          }
        ],
        estado: { humedad: 42.0, ph: 6.3, lux: 3500.0, tanque: 14.0, cara: 'feliz' }
      }
    },
    {
      nombre: 'Familia Gómez',
      correo: 'familia@mati.cerebria.co',
      contrasena: 'familia123',
      rol: 'Familia con Niños',
      tipoDemo: 'familia',
      matera: {
        nombre: 'Panchito',
        especie: 'suculenta',
        ubicacion: 'Habitación niños',
        codigo: 'MT-FAMILIA',
        umbralHumedad: 20.0,
        riegoAutomatico: false,
        segundosRiego: 3,
        alertas: [],
        estado: { humedad: 32.0, ph: 6.4, lux: 5200.0, tanque: 80.0, cara: 'feliz' }
      }
    },
    {
      nombre: 'Valentina Rivas',
      correo: 'botanica@mati.cerebria.co',
      contrasena: 'botanica123',
      rol: 'Plant Lover / Coleccionista',
      tipoDemo: 'botanica',
      matera: {
        nombre: 'Aura',
        especie: 'monstera',
        ubicacion: 'Estudio con ventanal',
        codigo: 'MT-BOTANICA',
        umbralHumedad: 45.0,
        riegoAutomatico: true,
        segundosRiego: 5,
        alertas: [
          {
            tipo: 'ph',
            titulo: 'Suelo acidificado (pH 5.2)',
            detalle: 'El pH está por debajo del rango ideal (5.8 - 6.5). Aplica una pizca de cal agrícola o cáscara de huevo molida para corregirlo.',
            activa: true,
            vista: false
          }
        ],
        estado: { humedad: 54.0, ph: 5.2, lux: 4100.0, tanque: 75.0, cara: 'mareada' }
      }
    },
    {
      nombre: 'Café Macondo',
      correo: 'negocio@mati.cerebria.co',
      contrasena: 'negocio123',
      rol: 'Oficina / Café Local',
      tipoDemo: 'negocio',
      matera: {
        nombre: 'Verde',
        especie: 'ficus',
        ubicacion: 'Recepción',
        codigo: 'MT-NEGOCIO',
        umbralHumedad: 35.0,
        riegoAutomatico: true,
        segundosRiego: 3,
        alertas: [],
        estado: { humedad: 62.0, ph: 6.5, lux: 2800.0, tanque: 90.0, cara: 'feliz' }
      }
    },
    {
      nombre: 'Visitante General',
      correo: 'demo@mati.cerebria.co',
      contrasena: 'demo1234',
      rol: 'Visitante Demo',
      tipoDemo: 'visitante',
      matera: {
        nombre: 'Lulú',
        especie: 'potus',
        ubicacion: 'Sala',
        codigo: 'MT-0042',
        umbralHumedad: 40.0,
        riegoAutomatico: true,
        segundosRiego: 5,
        alertas: [],
        estado: { humedad: 48.0, ph: 6.3, lux: 3500.0, tanque: 70.0, cara: 'feliz' }
      }
    }
  ];

  for (const c of cuentas) {
    const contrasenaHash = await bcrypt.hash(c.contrasena, salt);
    const usuario = await prisma.usuario.create({
      data: {
        nombre: c.nombre,
        correo: c.correo,
        contrasenaHash,
        rol: c.rol,
        esDemo: true,
        tipoDemo: c.tipoDemo
      }
    });

    const mat = await prisma.matera.create({
      data: {
        nombre: c.matera.nombre,
        especie: c.matera.especie,
        ubicacion: c.matera.ubicacion,
        codigo: c.matera.codigo,
        usuarioId: usuario.id,
        umbralHumedad: c.matera.umbralHumedad,
        riegoAutomatico: c.matera.riegoAutomatico,
        segundosRiego: c.matera.segundosRiego
      }
    });

    for (const a of c.matera.alertas) {
      await prisma.alerta.create({
        data: {
          materaId: mat.id,
          tipo: a.tipo,
          titulo: a.titulo,
          detalle: a.detalle,
          activa: a.activa,
          vista: a.vista
        }
      });
    }

    // Generar 12 mediciones históricas simuladas (últimas horas)
    const baseH = c.matera.estado.humedad;
    const basePh = c.matera.estado.ph;
    const baseLux = c.matera.estado.lux;
    const baseTanque = c.matera.estado.tanque;
    const baseCara = c.matera.estado.cara;

    for (let i = 12; i >= 0; i--) {
      const fecha = new Date(Date.now() - i * 10 * 60 * 1000);
      const variacionH = (Math.sin(i) * 2).toFixed(1);
      await prisma.medicion.create({
        data: {
          materaId: mat.id,
          humedad: parseFloat((baseH + parseFloat(variacionH)).toFixed(1)),
          ph: basePh,
          lux: i > 6 ? baseLux : Math.max(50, baseLux * 0.2),
          tanque: baseTanque,
          cara: i === 0 ? baseCara : 'feliz',
          fueRiego: i === 6,
          creadoEn: fecha
        }
      });
    }

    console.log(`  ✓ Creado usuario [${c.nombre}] (${c.correo}) con matera [${c.matera.nombre}]`);
  }

  console.log('✅ Seed completado con éxito en PostgreSQL mati_db!');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
