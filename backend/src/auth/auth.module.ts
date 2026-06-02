import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            // SINKRONKAN: Membaca dari env yang sama dengan JwtStrategy
            secret: process.env.JWT_SECRET || 'rahasia_super_aman_untuk_ujian_hospa',
            signOptions: { expiresIn: '1d' },
        }),
    ],
    providers: [AuthService, JwtStrategy, RolesGuard],
    controllers: [AuthController],
    exports: [AuthService, PassportModule],
})
export class AuthModule { }