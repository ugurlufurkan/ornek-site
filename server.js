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

// =================================================================
// 🔥 TERMİNATÖR KOD: KLASÖR VE DOSYA YOKSA OTOMATİK YARAT!
// =================================================================
// 1. Önce 'data' klasörü var mı kontrol et, yoksa yarat
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
    console.log("📁 'data' klasörü bulunamadı, sistem tarafından otomatik oluşturuldu!");
}

// 2. users.json var mı kontrol et, yoksa içi boş liste olarak yarat
if (!fs.existsSync(usersDbPath)) {
    fs.writeFileSync(usersDbPath, '[]', 'utf8');
    console.log("🛠️ DİKKAT: users.json dosyası bulunamadı, otomatik yaratıldı!");
}

// 3. db.json var mı kontrol et, yoksa hata vermemesi için onu da yarat
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '[]', 'utf8');
    console.log("🛠️ DİKKAT: db.json dosyası bulunamadı, otomatik yaratıldı!");
}
// =================================================================

// 1. API: Ürünleri Çek (GET)
app.get('/api/urunler', (req, res) => {
    fs.readFile(dbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ mesaj: "Ürünler veritabanı okuma hatası" });
        try {
            res.json(JSON.parse(data));
        } catch (error) {
            res.json([]); // db.json bozuksa sayfayı çökertmek yerine boş liste döner
        }
    });
});

// 2. API: Yeni Üye Kaydı (POST)
app.post('/api/auth/register', (req, res) => {
    const { email, password } = req.body;

    fs.readFile(usersDbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ mesaj: "Veritabanı okuma hatası! Dosya bozuk olabilir." });
        
        let kullanicilar = [];
        try {
            kullanicilar = JSON.parse(data); // İçerik bozuksa yakala
        } catch (error) {
            kullanicilar = []; // Bozuksa listeyi sıfırla
        }

        if (kullanicilar.find(u => u.email === email)) {
            return res.status(400).json({ mesaj: "Bu e-posta adresi zaten kullanımda!" });
        }

        const yeniKullanici = { id: Date.now(), email, password, kayitTarihi: new Date().toISOString() };
        kullanicilar.push(yeniKullanici);

        fs.writeFile(usersDbPath, JSON.stringify(kullanicilar, null, 2), (err) => {
            if (err) return res.status(500).json({ mesaj: "Kayıt işlemi başarısız oldu" });
            res.status(201).json({ mesaj: "Kayıt başarıyla tamamlandı!", user: { email } });
        });
    });
});

// 3. API: GİRİŞ YAP (LOGIN)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    fs.readFile(usersDbPath, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ mesaj: "Veritabanı okuma hatası" });
        
        let kullanicilar = [];
        try {
            kullanicilar = JSON.parse(data);
        } catch (error) {
            kullanicilar = [];
        }

        const user = kullanicilar.find(u => u.email === email && u.password === password);
        
        if (user) {
            res.status(200).json({ mesaj: "Giriş başarılı, hoş geldin!", user: { email: user.email } });
        } else {
            res.status(401).json({ mesaj: "Hatalı e-posta veya şifre!" });
        }
    });
});

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 KAVRULMUŞ BACKEND AKTİF!`);
    console.log(`🌍 Sunucu adresi: http://localhost:${PORT}`);
    console.log(`=================================`);
});