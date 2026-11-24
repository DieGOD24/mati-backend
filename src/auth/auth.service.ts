import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service.js';
import bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registrar(nombre: string, correo: string, contrasena: string) {
    const email = correo.trim().toLowerCase();
    const existe = await this.prisma.usuario.findUnique({ where: { correo: email } });
    if (existe) {
      throw new BadRequestException('Ya existe una cuenta con este correo.');
    }

    const salt = await bcrypt.genSalt(10);
    const contrasenaHash = await bcrypt.hash(contrasena, salt);

    const usuario = await this.prisma.usuario.create({
      data: {
        nombre: nombre.trim(),
        correo: email,
        contrasenaHash,
        rol: 'usuario',
      },
    });

    const token = this.jwtService.sign({ sub: usuario.id, email: usuario.correo });
    return { token, usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo } };
  }

  async login(correo: string, contrasena: string) {
    const email = correo.trim().toLowerCase();
    const usuario = await this.prisma.usuario.findUnique({
      where: { correo: email },
      include: {
        materas: {
          include: {
            alertas: { where: { activa: true } },
            mediciones: { orderBy: { creadoEn: 'desc' }, take: 1 },
          },
        },
      },
    });

    if (!usuario) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    const valida = await bcrypt.compare(contrasena, usuario.contrasenaHash);
    if (!valida) {
      throw new UnauthorizedException('Correo o contraseña incorrectos.');
    }

    const token = this.jwtService.sign({ sub: usuario.id, email: usuario.correo });
    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        esDemo: usuario.esDemo,
        tipoDemo: usuario.tipoDemo,
        materas: usuario.materas,
      },
    };
  }

  async loginDemo(tipo: string = 'viajero') {
    const usuario = await this.prisma.usuario.findFirst({
      where: { tipoDemo: tipo, esDemo: true },
      include: {
        materas: {
          include: {
            alertas: { where: { activa: true } },
            mediciones: { orderBy: { creadoEn: 'desc' }, take: 24 },
          },
        },
      },
    });

    if (!usuario) {
      throw new BadRequestException(`No se encontró cuenta demo para el tipo [${tipo}]`);
    }

    const token = this.jwtService.sign({ sub: usuario.id, email: usuario.correo });
    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol,
        esDemo: usuario.esDemo,
        tipoDemo: usuario.tipoDemo,
        materas: usuario.materas,
      },
    };
  }

  async perfil(usuarioId: string) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: {
        materas: {
          include: {
            alertas: { where: { activa: true } },
            mediciones: { orderBy: { creadoEn: 'desc' }, take: 24 },
          },
        },
      },
    });
    if (!usuario) throw new UnauthorizedException();
    const { contrasenaHash, ...publico } = usuario;
    return publico;
  }
}
