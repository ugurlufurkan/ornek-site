// server.js

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));

// Gerçek bir veritabanı simülasyonu (Tüm ürün detaylarıyla)
app.get('/api/urunler', (req, res) => {
    const urunler = [
        { 
            id: 1, 
            isim: "Premium Espresso Blend", 
            fiyat: 335, 
            tur: "%100 Arabica / Çikolata, Fındık",
            resim: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=500&q=80",
            etiket: "🔥 Bestseller",
            gramaj: "250g",
            yildiz: "⭐⭐⭐⭐⭐",
            degerlendirme: 128
        },
        { 
            id: 2, 
            isim: "Etiyopya Yirgacheffe", 
            fiyat: 380, 
            tur: "Yöresel Filtre / Çiçeksi, Yasemin",
            resim: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80",
            etiket: "Yeni",
            gramaj: "250g",
            yildiz: "⭐⭐⭐⭐½",
            degerlendirme: 85
        },
        { 
            id: 3, 
            isim: "Kolombiya Supremo", 
            fiyat: 360, 
            tur: "Yöresel Filtre / Karamel, Kakao",
            resim: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=500&q=80",
            etiket: "Popüler",
            gramaj: "250g",
            yildiz: "⭐⭐⭐⭐⭐",
            degerlendirme: 210
        }
    ];
    
    res.json(urunler);
});

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 KAVRULMUŞ BACKEND AKTİF!`);
    console.log(`🌍 Sunucu adresi: http://localhost:${PORT}`);
    console.log(`📦 API adresi: http://localhost:${PORT}/api/urunler`);
    console.log(`=================================`);
});