// server.js

const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const { Pool } = require('pg'); // YENİ: PostgreSQL Kütüphanesi

const app = express();
const PORT = 3000;
const JWT_SECRET = 'KAVRULMUS_GIZLI_ANAHTAR_2026'; 

app.use(express.static(__dirname));
app.use(express.json());

// --- POSTGRESQL BAĞLANTI AYARLARI (Docker'daki ayarlarımız) ---
const pool = new Pool({
    user: 'patron',
    host: 'localhost',
    database: 'kavrulmus_db',
    password: 'supergizlisifre2026',
    port: 5432,
});

// --- VERİTABANI TABLOLARINI OTOMATİK OLUŞTURMA (MIGRATION) ---
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS products (
                id SERIAL PRIMARY KEY,
                baslik VARCHAR(255) NOT NULL,
                tur VARCHAR(255) NOT NULL,
                fiyat NUMERIC NOT NULL,
                resim TEXT,
                stok INT DEFAULT 10
            );

            CREATE TABLE IF NOT EXISTS orders (
                id VARCHAR(50) PRIMARY KEY,
                tarih TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                musteri_ad VARCHAR(255),
                telefon VARCHAR(50),
                adres TEXT,
                odeme_yontemi VARCHAR(50),
                user_email VARCHAR(255),
                urunler JSONB,
                toplam_tutar NUMERIC,
                durum VARCHAR(50) DEFAULT 'Hazırlanıyor'
            );
        `);
        console.log("📦 SQL Veritabanı tabloları kontrol edildi/oluşturuldu.");
    } catch (err) {
        console.error("❌ Veritabanı tabloları oluşturulurken hata:", err);
    }
};
initDB();

// 1. API: Ürünleri Çek (SQL GET)
app.get('/api/urunler', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ mesaj: "Ürünler okuma hatası" });
    }
});

// 2. API: YENİ ÜRÜN EKLE (SQL INSERT)
app.post('/api/urunler', async (req, res) => {
    const { baslik, tur, fiyat, resimUrl, stok } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO products (baslik, tur, fiyat, resim, stok) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [baslik || "İsimsiz Kahve", tur || "Standart", fiyat || 0, resimUrl, parseInt(stok) || 10]
        );
        res.status(201).json({ mesaj: "Ürün başarıyla vitrine eklendi!", urun: result.rows[0] });
    } catch (err) {
        res.status(500).json({ mesaj: "Ürün kaydedilemedi" });
    }
});

// 3. API: YENİ ÜYE KAYDI (SQL INSERT & BCRYPT)
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const checkUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) return res.status(400).json({ mesaj: "Bu e-posta zaten kullanımda!" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
            [email, hashedPassword]
        );
        
        const yeniKullanici = result.rows[0];
        const token = jwt.sign({ id: yeniKullanici.id, email: yeniKullanici.email }, JWT_SECRET, { expiresIn: '2h' });
        res.status(201).json({ mesaj: "Kayıt başarıyla tamamlandı!", token, user: { email: yeniKullanici.email } });
    } catch (err) {
        res.status(500).json({ mesaj: "Kayıt başarısız" });
    }
});

// 4. API: GİRİŞ YAP (SQL SELECT & BCRYPT)
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];
        
        if (!user) return res.status(401).json({ mesaj: "Hatalı e-posta veya şifre!" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ mesaj: "Hatalı e-posta veya şifre!" });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
        res.status(200).json({ mesaj: "Giriş başarılı, hoş geldin!", token, user: { email: user.email } });
    } catch (err) {
        res.status(500).json({ mesaj: "Giriş yapılırken sunucu hatası" });
    }
});

// 5. API: SİPARİŞİ KAYDET VE STOKLARI DÜŞÜR (SQL TRANSACTION)
app.post('/api/siparis', async (req, res) => {
    const { musteriAd, telefon, adres, odemeYontemi, sepet, toplamTutar, userEmail } = req.body;
    
    // İşlemlerin yarıda kesilmesini önlemek için Transaction başlatıyoruz
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN'); // SQL: İşlemi başlat

        const takipNo = 'KVR-' + Math.floor(1000 + Math.random() * 9000);
        
        // 1. Siparişi veritabanına yaz (JSONB formatında sepeti gömüyoruz)
        await client.query(
            `INSERT INTO orders (id, musteri_ad, telefon, adres, odeme_yontemi, user_email, urunler, toplam_tutar) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [takipNo, musteriAd, telefon, adres, odemeYontemi, userEmail, JSON.stringify(sepet), toplamTutar]
        );

        // 2. Sepetteki her ürün için SQL'de stoğu düşür (Eksiye düşmeyi GREATEST(0, ...) ile engelliyoruz)
        for (const item of sepet) {
            await client.query(
                'UPDATE products SET stok = GREATEST(0, stok - $1) WHERE id = $2',
                [item.quantity, item.id]
            );
        }

        await client.query('COMMIT'); // SQL: Her şey başarılı, kaydet
        res.status(201).json({ mesaj: "Sipariş başarıyla alındı!", takipNo });
    } catch (err) {
        await client.query('ROLLBACK'); // SQL: Hata varsa hiçbir şeyi kaydetme, geri al
        console.error(err);
        res.status(500).json({ mesaj: "Sipariş kaydedilemedi" });
    } finally {
        client.release();
    }
});

// 6. API: SİPARİŞLERİ GETİR (ADMIN PANELİ İÇİN - SQL GET)
app.get('/api/siparisler', async (req, res) => {
    try {
        // En son gelen sipariş en üstte olsun diye DESC sıralıyoruz
        const result = await pool.query('SELECT * FROM orders ORDER BY tarih DESC');
        
        // Tablodaki snake_case (musteri_ad) sütunlarını, front-end'in beklediği camelCase formata çeviriyoruz
        const formatliSiparisler = result.rows.map(row => ({
            id: row.id,
            tarih: row.tarih,
            musteriAd: row.musteri_ad,
            telefon: row.telefon,
            adres: row.adres,
            odemeYontemi: row.odeme_yontemi,
            userEmail: row.user_email,
            urunler: row.urunler,
            toplamTutar: row.toplam_tutar,
            durum: row.durum
        }));
        
        res.json(formatliSiparisler);
    } catch (err) {
        res.status(500).json({ mesaj: "Siparişler okunamadı" });
    }
});

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 KAVRULMUŞ BACKEND (POSTGRESQL) AKTİF!`);
    console.log(`🌍 Sunucu adresi: http://localhost:${PORT}`);
    console.log(`=================================`);
});