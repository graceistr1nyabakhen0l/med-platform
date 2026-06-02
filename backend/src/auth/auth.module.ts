import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport'; // 👈 Pastikan import ini ada
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

@Module({
    imports: [
        // 1. DAFTARKAN PassportModule di sini agar bisa di-export di bawah!
        PassportModule.register({ defaultStrategy: 'jwt' }), 
        
        JwtModule.register({
            secret: 'UKL_SUPER_RAHASIA_MEDIS_2026', 
            signOptions: { expiresIn: '1d' },
        }),
    ],
    providers: [AuthService, JwtStrategy, RolesGuard],
    controllers: [AuthController],
    exports: [AuthService, PassportModule], // 👈 Sekarang ini sudah aman dan legal
})
export class AuthModule { }