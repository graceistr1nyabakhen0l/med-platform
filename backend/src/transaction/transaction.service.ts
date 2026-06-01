
import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TransactionService {
    constructor(private prisma: PrismaService) { }

    async createBooking(pasienId: number, dokterId: number) {
        const dokter = await this.prisma.user.findFirst({ where: { id: Number(dokterId), role: 'DOKTER' } });
        if (!dokter) throw new NotFoundException('Dokter pilihan tidak valid!');

        return this.prisma.booking.create({
            data: { pasienId: Number(pasienId), dokterId: Number(dokterId) },
        });
    }

    async getBookings(userId: number, role: string) {
        if (role === 'PASIEN') {
            return this.prisma.booking.findMany({
                where: { pasienId: Number(userId) },
                include: {
                    dokter: { select: { id: true, nama: true, profilDokter: true } },
                    resepDigital: true
                },
                orderBy: { createdAt: 'desc' },
            });
        } else if (role === 'DOKTER') {
            return this.prisma.booking.findMany({
                where: { dokterId: Number(userId) },
                include: {
                    pasien: { select: { id: true, nama: true, email: true } },
                    resepDigital: true
                },
                orderBy: { createdAt: 'desc' },
            });
        }
        return [];
    }

    async sendChat(bookingId: number, senderId: number, pesan: string) {
        return this.prisma.chat.create({
            data: { bookingId: Number(bookingId), senderId: Number(senderId), pesan },
        });
    }

    async getChats(bookingId: number) {
        return this.prisma.chat.findMany({
            where: { bookingId: Number(bookingId) },
            orderBy: { createdAt: 'asc' },
        });
    }

    async createResepDigital(bookingId: number, items: { obatId: number; jumlah: number }[]) {
        return this.prisma.$transaction(async (tx) => {
            const resep = await tx.resepDigital.create({
                data: { bookingId: Number(bookingId) },
            });

            for (const item of items) {
                await tx.resepDetail.create({
                    data: {
                        resepDigitalId: resep.id,
                        obatId: Number(item.obatId),
                        jumlah: parseInt(item.jumlah.toString()),
                    },
                });
            }
            return resep;
        });
    }

    async checkoutPembayaran(pasienId: number, payload: { metodeBayar: string; obatItems: { obatId: number; jumlah: number }[]; resepDigitalId?: number }) {
        return this.prisma.$transaction(async (tx) => {
            let totalHarga = 0;
            const orderItemsData: any[] = [];

            for (const item of payload.obatItems) {
                const _obat = await tx.obat.findUnique({ where: { id: Number(item.obatId) } });
                if (!_obat) throw new NotFoundException('Data obat tidak ditemukan');

                if (_obat.kategori === 'RESEP' && !payload.resepDigitalId) {
                    throw new BadRequestException(`Obat [${_obat.nama}] butuh Nota Resep Dokter!`);
                }

                if (_obat.stok < item.jumlah) {
                    throw new BadRequestException(`Stok obat [${_obat.nama}] habis.`);
                }

                await tx.obat.update({
                    where: { id: _obat.id },
                    data: { stok: { decrement: parseInt(item.jumlah.toString()) } },
                });

                totalHarga += _obat.harga * item.jumlah;
                orderItemsData.push({ obatId: Number(item.obatId), jumlah: parseInt(item.jumlah.toString()) });
            }

            const transaksi = await tx.transaksi.create({
                data: {
                    pasienId: Number(pasienId),
                    metodeBayar: payload.metodeBayar,
                    totalHarga,
                    status: 'SUKSES',
                    items: { create: orderItemsData },
                },
            });

            if (payload.resepDigitalId) {
                await tx.resepDigital.update({
                    where: { id: Number(payload.resepDigitalId) },
                    data: { penebusanId: transaksi.id },
                });
            }

            return transaksi;
        });
    }
}
