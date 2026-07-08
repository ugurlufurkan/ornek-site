// server.js

const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs'); // ŞİFRELEME MODÜLÜ
const jwt = require('jsonwebtoken'); // OTURUM KİMLİĞİ MODÜLÜ

const app = express();
const PORT = 3000;
const JWT_SECRET = 'KAVRULMUS_GIZLI_ANAHTAR_2026'; // Bu anahtarla tokenleri imzalayacağız

app.use(express.static(__dirname));
app.use(express.json());

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(__dirname, 'data', 'db.json');
const usersDbPath = path.join(__dirname, 'data', 'users.json');

// Klasör ve Veritabanı Kontrolü
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(usersDbPath)) fs.writeFileSync(usersDbPath, '[]', 'utf8');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '[]', 'utf8');

// 1. API: Ürünleri Çek
app.get('/api/urunler', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ mesaj: "Ürünler okuma hatası" });
        try { res.json(JSON.parse(data)); } catch (e) { res.json([]); }
    });
});

// 2. API: YENİ ÜRÜN EKLE (ADMIN)
app.post('/api/urunler', (req, res) => {
    const { baslik, tur, fiyat, resimUrl } = req.body;
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ mesaj: "Veritabanı hatası" });
        let urunler = [];
        try { urunler = JSON.parse(data); } catch (e) { urunler = []; }

        const yeniUrun = {
            id: Date.now(),
            baslik: baslik || "İsimsiz Kahve",
            tur: tur || "Standart Çekirdek",
            fiyat: fiyat || "0",
            resim: resimUrl || "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=500&q=80"
        };
        urunler.push(yeniUrun);

        fs.writeFile(dbPath, JSON.stringify(urunler, null, 2), (err) => {
            if (err) return res.status(500).json({ mesaj: "Ürün kaydedilemedi" });
            res.status(201).json({ mesaj: "Ürün başarıyla vitrine eklendi!", urun: yeniUrun });
        });
    });
});

// 3. API: YENİ ÜYE KAYDI (ŞİFRELİ)
app.post('/api/auth/register', async (req, res) => {
    const { email, password } = req.body;
    
    fs.readFile(usersDbPath, 'utf8', async (err, data) => {
        if (err) return res.status(500).json({ mesaj: "Veritabanı hatası!" });
        let kullanicilar = [];
        try { kullanicilar = JSON.parse(data); } catch (e) { kullanicilar = []; }
        
        if (kullanicilar.find(u => u.email === email)) {
            return res.status(400).json({ mesaj: "Bu e-posta zaten kullanımda!" });
        }

        // Şifreyi Bcrypt ile Hash'le (Kriptola)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const yeniKullanici = { 
            id: Date.now(), 
            email, 
            password: hashedPassword, // Düz metin değil, kriptolu şifre kaydediliyor!
            kayitTarihi: new Date().toISOString() 
        };
        kullanicilar.push(yeniKullanici);

        fs.writeFile(usersDbPath, JSON.stringify(kullanicilar, null, 2), (err) => {
            if (err) return res.status(500).json({ mesaj: "Kayıt başarısız" });
            
            // Kayıt olur olmaz Token üret ve yolla
            const token = jwt.sign({ id: yeniKullanici.id, email: yeniKullanici.email }, JWT_SECRET, { expiresIn: '2h' });
            res.status(201).json({ mesaj: "Kayıt başarıyla tamamlandı!", token, user: { email } });
        });
    });
});

// 4. API: GİRİŞ YAP (ŞİFRE ÇÖZÜCÜ & JWT)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    fs.readFile(usersDbPath, 'utf8', async (err, data) => {
        if (err) return res.status(500).json({ mesaj: "Veritabanı hatası" });
        let kullanicilar = [];
        try { kullanicilar = JSON.parse(data); } catch (e) { kullanicilar = []; }
        
        const user = kullanicilar.find(u => u.email === email);
        if (!user) return res.status(401).json({ mesaj: "Hatalı e-posta veya şifre!" });

        // Girilen şifre ile veritabanındaki hash'li şifreyi karşılaştır
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ mesaj: "Hatalı e-posta veya şifre!" });

        // Şifre doğruysa JWT Token üret
        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });
        
        res.status(200).json({ mesaj: "Giriş başarılı, hoş geldin!", token, user: { email: user.email } });
    });
});

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 KAVRULMUŞ BACKEND (GÜVENLİ) AKTİF!`);
    console.log(`🌍 Sunucu adresi: http://localhost:${PORT}`);
    console.log(`🔒 Bcrypt & JWT Devrede.`);
    console.log(`=================================`);
});