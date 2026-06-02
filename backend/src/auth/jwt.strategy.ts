import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            // 1. Ambil token dari header 'Authorization: Bearer <token>'
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // 2. KUNCI MATI: Samakan dengan isi AuthModule kamu!
            secretOrKey: 'UKL_SUPER_RAHASIA_MEDIS_2026', 
        });
    }

    async validate(payload: any) {
        // Jika token kosong atau tidak valid, langsung lempar 401
        if (!payload) {
            throw new UnauthorizedException();
        }
        
        // 3. Mengembalikan data user ke request.user agar bisa dibaca RolesGuard
        // Pastikan properti 'role' disalin sesuai isi payload token kamu
        return { 
            id: payload.id, 
            email: payload.email, 
            role: payload.role 
        };
    }
}