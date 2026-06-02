"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
console.log('DATABASE_URL =', process.env.DATABASE_URL);
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔄 Membersihkan database lama...');
    await prisma.orderItem.deleteMany({});
    await prisma.transaksi.deleteMany({});
    await prisma.resepDetail.deleteMany({});
    await prisma.resepDigital.deleteMany({});
    await prisma.chat.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.obat.deleteMany({});
    await prisma.profilDokter.deleteMany({});
    await prisma.profilPasien.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('🌱 Memulai proses seeding data baru...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const dokter1 = await prisma.user.create({
        data: {
            email: 'dr.budi@med.com',
            password: hashedPassword,
            nama: 'dr. Budi Santoso, Sp.A',
            role: 'DOKTER',
            profilDokter: {
                create: {
                    spesialisasi: 'Anak',
                    jadwalHari: 'Senin, Rabu, Jumat',
                    jadwalJam: '09:00 - 13:00',
                },
            },
        },
    });
    const dokter2 = await prisma.user.create({
        data: {
            email: 'dr.siti@med.com',
            password: hashedPassword,
            nama: 'dr. Siti Aminah, Sp.PD',
            role: 'DOKTER',
            profilDokter: {
                create: {
                    spesialisasi: 'Penyakit Dalam',
                    jadwalHari: 'Selasa, Kamis',
                    jadwalJam: '14:00 - 17:00',
                },
            },
        },
    });
    await prisma.obat.createMany({
        data: [
            { nama: 'Paracetamol 500mg', kategori: 'NON_RESEP', harga: 8500, stok: 150 },
            { nama: 'Amoxicillin 500mg', kategori: 'RESEP', harga: 15000, stok: 80 },
            { nama: 'Vitamin C 1000mg', kategori: 'NON_RESEP', harga: 22000, stok: 200 },
            { nama: 'Cefadroxil 500mg', kategori: 'RESEP', harga: 27500, stok: 60 },
        ],
    });
    console.log('✅ Seeding berhasil diselesaikan!');
}
main()
    .catch((e) => {
    console.error('❌ Seeding gagal:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map