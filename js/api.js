// js/api.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Ürünlerin basılacağı kapsayıcı (container)
    const productsGrid = document.getElementById('dynamic-products-grid');

    // Eğer sayfa ürünler sayfası değilse çalışmayı durdur
    if (!productsGrid) return;

    // Backend API'den verileri çeken fonksiyon
    async function fetchProducts() {
        try {
            // Sunucumuzdaki /api/urunler adresine istek atıyoruz
            const response = await fetch('/api/urunler');
            const urunler = await response.json();

            // Gelen verilerle HTML kartlarını oluştur
            renderProducts(urunler);
        } catch (error) {
            console.error("Ürünler çekilirken hata oluştu:", error);
            productsGrid.innerHTML = `<p style="color: red; text-align: center; width: 100%;">Ürünler yüklenemedi. Lütfen daha sonra tekrar deneyin.</p>`;
        }
    }

    // JSON verisini HTML'e çeviren fonksiyon
    function renderProducts(urunler) {
        // Önce içeriği temizle (Yükleniyor yazısını sil)
        productsGrid.innerHTML = '';

        urunler.forEach(urun => {
            const cardHTML = `
                <div class="product-card">
                    <div class="card-image-wrapper">
                        <div class="card-badges">
                            ${urun.etiket ? `<span class="badge bestseller">${urun.etiket}</span>` : ''}
                            <span class="badge weight">${urun.gramaj}</span>
                        </div>
                        <button class="wishlist-btn">♡</button>
                        <img src="${urun.resim}" alt="${urun.isim}" class="product-img">
                        <div class="quick-view-overlay">
                            <button class="btn-premium secondary">👁️ Quick View</button>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="stars">${urun.yildiz} <span style="color:#666; font-size:0.8rem;">(${urun.degerlendirme})</span></div>
                        <h3 class="product-title">${urun.isim}</h3>
                        <p class="product-type">${urun.tur}</p>
                        <div class="card-footer">
                            <span class="price">${urun.fiyat} TL</span>
                            <button class="btn-premium primary add-to-cart">🛒 Ekle</button>
                        </div>
                    </div>
                </div>
            `;
            // Oluşturulan kartı ızgaraya ekle
            productsGrid.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Yeni eklenen "🛒 Ekle" butonlarına Toast ve Sepet olaylarını bağlamamız lazım
        // Bu tetiklemeyi manuel yapıyoruz çünkü HTML sonradan oluştu.
        if (typeof attachCartEvents === 'function') {
            attachCartEvents();
        }
    }

    // Fetch işlemini başlat
    fetchProducts();
});