import { Controller, Post, Body, Get, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('registro')
  async registrar(@Body() body: { nombre: string; correo: string; contrasena: string }) {
    return this.authService.registrar(body.nombre, body.correo, body.contrasena);
  }

  @Post('login')
  async login(@Body() body: { correo: string; contrasena: string }) {
    return this.authService.login(body.correo, body.contrasena);
  }

  @Post('demo/:tipo')
  async loginDemo(@Param('tipo') tipo: string) {
    return this.authService.loginDemo(tipo);
  }

  @Get('perfil')
  async perfil(@Headers('authorization') authHeader: string) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token);
      return this.authService.perfil(payload.sub);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}
