// server.js

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));
app.use(express.json());

// Veritabanı dosya yolları
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(__dirname, 'data', 'db.json');
const usersDbPath = path.join(__dirname, 'data', 'users.json');

// Klasör ve Veritabanı Kontrolü (Fail-Safe)
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(usersDbPath)) fs.writeFileSync(usersDbPath, '[]', 'utf8');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '[]', 'utf8');

// 1. API: Ürünleri Çek (GET)
app.get('/api/urunler', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ mesaj: "Ürünler veritabanı okuma hatası" });
        try { res.json(JSON.parse(data)); } 
        catch (error) { res.json([]); }
    });
});

// 2. API: YENİ ÜRÜN EKLE (ADMIN İÇİN - YENİ EKLENDİ)
app.post('/api/urunler', (req, res) => {
    const { baslik, tur, fiyat, resimUrl } = req.body;

    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ mesaj: "Veritabanı okuma hatası" });
        
        let urunler = [];
        try { urunler = JSON.parse(data); } catch (e) { urunler = []; }

        // Yeni Ürün Objesini Oluştur
        const yeniUrun = {
            id: Date.now(),
            baslik: baslik || "İsimsiz Kahve",
            tur: tur || "Standart Çekirdek",
            fiyat: fiyat || "0",
            resim: resimUrl || "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=500&q=80"
        };

        urunler.push(yeniUrun); // Listeye ekle

        // Veritabanına kaydet
        fs.writeFile(dbPath, JSON.stringify(urunler, null, 2), (err) => {
            if (err) return res.status(500).json({ mesaj: "Ürün kaydedilemedi" });
            res.status(201).json({ mesaj: "Ürün başarıyla vitrine eklendi!", urun: yeniUrun });
        });
    });
});

// 3. API: Yeni Üye Kaydı (POST)
app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body;
    fs.readFile(usersDbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ mesaj: "Veritabanı hatası!" });
        let kullanicilar = [];
        try { kullanicilar = JSON.parse(data); } catch (e) { kullanicilar = []; }
        if (kullanicilar.find(u => u.email === email)) return res.status(400).json({ mesaj: "Bu e-posta zaten kullanımda!" });
        const yeniKullanici = { id: Date.now(), email, password, kayitTarihi: new Date().toISOString() };
        kullanicilar.push(yeniKullanici);
        fs.writeFile(usersDbPath, JSON.stringify(kullanicilar, null, 2), (err) => {
            if (err) return res.status(500).json({ mesaj: "Kayıt başarısız" });
            res.status(201).json({ mesaj: "Kayıt başarıyla tamamlandı!", user: { email } });
        });
    });
});

// 4. API: GİRİŞ YAP (LOGIN)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    fs.readFile(usersDbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ mesaj: "Veritabanı hatası" });
        let kullanicilar = [];
        try { kullanicilar = JSON.parse(data); } catch (e) { kullanicilar = []; }
        const user = kullanicilar.find(u => u.email === email && u.password === password);
        if (user) res.status(200).json({ mesaj: "Giriş başarılı!", user: { email: user.email } });
        else res.status(401).json({ mesaj: "Hatalı e-posta veya şifre!" });
    });
});

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 KAVRULMUŞ BACKEND AKTİF!`);
    console.log(`🌍 Sunucu adresi: http://localhost:${PORT}`);
    console.log(`=================================`);
});