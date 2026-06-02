import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
    super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        // UBAH BARIS INI: Tulis teks ini langsung!
        secretOrKey: 'UKL_SUPER_RAHASIA_MEDIS_2026', 
    });
}

    async validate(payload: any) {
        return { id: payload.id, email: payload.email, role: payload.role };
    }
}