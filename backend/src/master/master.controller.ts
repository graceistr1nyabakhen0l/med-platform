import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards, Req, Query } from '@nestjs/common';
import { MasterService } from './master.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('master')
export class MasterController {
    constructor(private readonly masterService: MasterService) { }

    @Get('profil/pasien')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('PASIEN')
    async getProfil(@Req() req: any) {
        return this.masterService.getProfilPasien(req.user.id);
    }

    @Put('profil/pasien')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('PASIEN')
    async updateProfil(@Req() req: any, @Body() body: any) {
        return this.masterService.updateProfilPasien(req.user.id, body);
    }

    @Get('dokters')
    async getDokters(
        @Query('spesialisasi') spesialisasi?: string,
        @Query('hari') hari?: string,
        @Query('jam') jam?: string,
    ) {
        return this.masterService.getDokters({ spesialisasi, hari, jam });
    }

    @Get('obat/pasien')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('PASIEN')
    async getObatPasien() {
        return this.masterService.getObatPasienOnly();
    }

    @Get('obat/dokter')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('DOKTER')
    async getObatDokter() {
        return this.masterService.getAllObat();
    }

    @Post('obat')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('DOKTER')
    async createObat(@Body() body: any) {
        return this.masterService.createObat(body);
    }

    @Put('/obat/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('DOKTER')
    async updateObat(@Param('id') id: string, @Body() body: any) {
        // FIX: Tambahkan Number() untuk mengubah parameter string URL menjadi angka
        return this.masterService.updateObat(Number(id), body);
    }

    @Delete('/obat/:id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles('DOKTER')
    async deleteObat(@Param('id') id: string) {
        // FIX: Tambahkan Number() untuk mengubah parameter string URL menjadi angka
        return this.masterService.deleteObat(Number(id));
    }
}