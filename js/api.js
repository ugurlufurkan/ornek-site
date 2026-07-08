// js/api.js

document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.querySelector('.products-grid');
    if(!productsGrid) return;

    try {
        const response = await fetch('/api/urunler');
        const urunler = await response.json();

        if(urunler.length === 0) {
            productsGrid.innerHTML = '<p style="color:#888; text-align:center; width: 100%;">Henüz vitrine kahve eklenmedi.</p>';
            return;
        }

        // Ürünleri Ekrana Çiz
        productsGrid.innerHTML = urunler.map(urun => {
            // Stok Kontrolü
            const isTukendi = urun.stok !== undefined && urun.stok <= 0;
            
            // Stok bittiyse butonu pasif yap ve rengini değiştir
            const butonGorseli = isTukendi 
                ? `<button class="btn-premium secondary" disabled style="opacity:0.5; cursor:not-allowed;">❌ Tükendi</button>`
                : `<button class="btn-premium primary add-to-cart" data-id="${urun.id}" data-title="${urun.baslik}" data-price="${urun.fiyat}" data-image="${urun.resim}">🛒 Sepete Ekle</button>`;
            
            // Resmin üzerine stok bilgisini yaz
            const stokBadge = isTukendi 
                ? `<span class="badge" style="background:#ff4d4d;">Tükendi</span>`
                : `<span class="badge weight">Stok: ${urun.stok || '10+'}</span>`;

            // Ürün kartı (Tükendiyse resmi siyah beyaz yap - grayscale)
            return `
            <div class="product-card animate fade-up" style="${isTukendi ? 'opacity: 0.7;' : ''}">
                <div class="card-image-wrapper">
                    <div class="card-badges">
                        ${stokBadge}
                    </div>
                    <img src="${urun.resim}" alt="${urun.baslik}" class="product-img" style="${isTukendi ? 'filter: grayscale(100%);' : ''}">
                </div>
                <div class="card-content">
                    <h3 class="product-title">${urun.baslik}</h3>
                    <p class="product-type">${urun.tur}</p>
                    <div class="card-footer">
                        <span class="price">${urun.fiyat} TL</span>
                        ${butonGorseli}
                    </div>
                </div>
            </div>`;
        }).join('');
    } catch (error) {
        console.error("Ürünler çekilemedi:", error);
    }
});