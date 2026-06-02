import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // SEKARANG MEMBACA DARI ENV, JIKA KOSONG BARU PAKAI DEFAULT
            secretOrKey: process.env.JWT_SECRET || 'rahasia_super_aman_untuk_ujian_hospa',
        });
    }

    async validate(payload: any) {
        return { id: payload.id, email: payload.email, role: payload.role };
    }
}