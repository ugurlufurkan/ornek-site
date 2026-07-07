// server.js

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Frontend dosyalarını sun
app.use(express.static(__dirname));

// Formlardan gelen JSON verilerini okuyabilmek için
app.use(express.json());

// Veritabanı dosya yolları
const dbPath = path.join(__dirname, 'data', 'db.json');
const usersDbPath = path.join(__dirname, 'data', 'users.json');

// 1. API: Ürünleri Çek (GET)
app.get('/api/urunler', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Veritabanı okuma hatası:", err);
            return res.status(500).json({ mesaj: "Veritabanına ulaşılamadı." });
        }
        res.json(JSON.parse(data));
    });
});

// 2. API: Yeni Üye Kaydı (POST)
app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ mesaj: "E-posta ve şifre zorunludur." });
    }

    fs.readFile(usersDbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ mesaj: "Veritabanı okuma hatası" });

        const kullanicilar = JSON.parse(data);

        const kayitliMi = kullanicilar.find(u => u.email === email);
        if (kayitliMi) {
            return res.status(400).json({ mesaj: "Bu e-posta adresi zaten kullanımda!" });
        }

        const yeniKullanici = {
            id: Date.now(),
            email: email,
            password: password, // Not: Gerçek projede bu şifre bcrypt ile hashlenmeli
            kayitTarihi: new Date().toISOString()
        };
        kullanicilar.push(yeniKullanici);

        fs.writeFile(usersDbPath, JSON.stringify(kullanicilar, null, 2), (err) => {
            if (err) return res.status(500).json({ mesaj: "Kayıt işlemi başarısız oldu" });
            res.status(201).json({ mesaj: "Kayıt başarıyla tamamlandı, hoş geldiniz!" });
        });
    });
});

// 3. YENİ API: Giriş Yap (POST)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ mesaj: "E-posta ve şifre zorunludur." });
    }

    fs.readFile(usersDbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ mesaj: "Veritabanı okuma hatası" });

        const kullanicilar = JSON.parse(data);

        // E-posta ve şifre eşleşen kullanıcıyı bul
        const kullanici = kullanicilar.find(u => u.email === email && u.password === password);

        if (!kullanici) {
            return res.status(401).json({ mesaj: "E-posta veya şifre hatalı." });
        }

        res.status(200).json({ mesaj: `Tekrar hoş geldin, ${email.split('@')[0]}!` });
    });
});

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 KAVRULMUŞ BACKEND AKTİF!`);
    console.log(`📁 Veritabanı bağlantıları başarılı.`);
    console.log(`🌍 Sunucu adresi: http://localhost:${PORT}`);
    console.log(`📦 API adresi: http://localhost:${PORT}/api/urunler`);
    console.log(`=================================`);
});