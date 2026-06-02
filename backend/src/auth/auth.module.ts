import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './guards/roles.guard';

@Module({
    imports: [
        JwtModule.register({
    // UBAH BARIS INI: Samakan kuncinya dengan yang di atas!
    secret: 'UKL_SUPER_RAHASIA_MEDIS_2026', 
    signOptions: { expiresIn: '1d' },
}),
    ],
    providers: [AuthService, JwtStrategy, RolesGuard],
    controllers: [AuthController],
    exports: [AuthService, PassportModule],
})
export class AuthModule { }