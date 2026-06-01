
import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@Controller('transaction')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TransactionController {
    constructor(private readonly transactionService: TransactionService) { }

    @Post('/booking')
    async createBooking(@Req() req: any, @Body('dokterId') dokterId: string) {
        // FIX: Pastikan req.user.id dan dokterId diparsing ke Number
        return this.transactionService.createBooking(Number(req.user.id), Number(dokterId));
    }

    @Post('chat')
    async sendChat(@Req() req: any, @Body() body: any) {
        return this.transactionService.sendChat(body.bookingId, req.user.id, body.pesan);
    }

    @Get('/bookings')
    async getBookings(@Req() req: any) {
        return this.transactionService.getBookings(Number(req.user.id), req.user.role);
    }

    @Get('/chats/:bookingId')
    async getChats(@Param('bookingId') bookingId: string) {
        // FIX: Ubah parameter string bookingId dari URL menjadi number
        return this.transactionService.getChats(Number(bookingId));
    }

    @Post('resep')
    @Roles('DOKTER')
    async createResep(@Body() body: any) {
        return this.transactionService.createResepDigital(body.bookingId, body.items);
    }

    @Post('checkout')
    @Roles('PASIEN')
    async checkout(@Req() req: any, @Body() body: any) {
        return this.transactionService.checkoutPembayaran(req.user.id, body);
    }
}
