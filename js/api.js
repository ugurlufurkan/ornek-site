// js/api.js — Ürün listesi, arama, filtre, sıralama, skeleton
document.addEventListener('DOMContentLoaded', async () => {
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;

    document.body.classList.add('page-enter');

    let allProducts = [];

    function showSkeleton(count = 6) {
        productsGrid.innerHTML = `<div class="skeleton-grid">${Array(count).fill('').map(() => `
            <div class="skeleton-card">
                <div class="skeleton-img"></div>
                <div class="skeleton-line medium"></div>
                <div class="skeleton-line short"></div>
            </div>
        `).join('')}</div>`;
    }

    function renderProducts(urunler) {
        if (!urunler.length) {
            productsGrid.innerHTML = '<p style="color:#888;text-align:center;width:100%;">Filtreye uygun ürün bulunamadı.</p>';
            return;
        }

        productsGrid.innerHTML = urunler.map(urun => {
            const isTukendi = urun.stok !== undefined && urun.stok <= 0;
            const esc = window.escapeHtml || (s => s);
            const butonGorseli = isTukendi
                ? `<button class="btn-premium secondary" disabled style="opacity:0.5;cursor:not-allowed;">❌ Tükendi</button>`
                : `<button class="btn-premium primary add-to-cart" data-id="${urun.id}" data-title="${esc(urun.baslik)}" data-price="${urun.fiyat}" data-image="${esc(urun.resim)}">🛒 Sepete Ekle</button>`;
            const stokBadge = isTukendi
                ? `<span class="badge" style="background:#ff4d4d;">Tükendi</span>`
                : `<span class="badge weight">Stok: ${urun.stok || '10+'}</span>`;

            return `
            <div class="product-card animate fade-up" data-tur="${esc(urun.tur)}" style="${isTukendi ? 'opacity:0.7;' : ''}">
                <div class="card-image-wrapper">
                    <div class="card-badges">${stokBadge}</div>
                    <button class="wishlist-btn" data-id="${urun.id}">♡</button>
                    <a href="urun-detay.html?id=${urun.id}">
                        <img src="${esc(urun.resim)}" alt="${esc(urun.baslik)}" class="product-img" style="${isTukendi ? 'filter:grayscale(100%);' : ''}" loading="lazy">
                    </a>
                    <div class="quick-view-overlay">
                        <a href="urun-detay.html?id=${urun.id}" class="btn-premium secondary">🔍 İncele</a>
                    </div>
                </div>
                <div class="card-content">
                    <a href="urun-detay.html?id=${urun.id}" class="product-title-link">
                        <h3 class="product-title">${esc(urun.baslik)}</h3>
                    </a>
                    <p class="product-type">${esc(urun.tur)}</p>
                    <div class="card-footer">
                        <span class="price">${urun.fiyat} TL</span>
                        ${butonGorseli}
                    </div>
                </div>
            </div>`;
        }).join('');

        if (typeof updateFavoriteCounter === 'function') updateFavoriteCounter();
        document.querySelectorAll('.wishlist-btn').forEach(btn => {
            if (typeof updateFavoriteButton === 'function') updateFavoriteButton(btn, btn.dataset.id);
        });

        if (window.KavrulmusAnimations?.initScrollAnimations) window.KavrulmusAnimations.initScrollAnimations();
        else productsGrid.querySelectorAll('.product-card').forEach(c => c.classList.add('show'));

        if (window.KavrulmusAnimations?.initImageReveal) window.KavrulmusAnimations.initImageReveal();
        else productsGrid.querySelectorAll('.product-img').forEach(img => img.classList.add('loaded'));
    }

    function applyFilters() {
        const search = (document.getElementById('product-search')?.value || '').toLowerCase().trim();
        const tur = document.getElementById('filter-tur')?.value || 'all';
        const sort = document.getElementById('sort-price')?.value || 'default';
        const stokFilter = document.getElementById('filter-stok')?.value || 'all';

        let filtered = [...allProducts];

        if (search) {
            filtered = filtered.filter(u =>
                u.baslik.toLowerCase().includes(search) || u.tur.toLowerCase().includes(search)
            );
        }
        if (tur !== 'all') filtered = filtered.filter(u => u.tur === tur);
        if (stokFilter === 'instock') filtered = filtered.filter(u => (u.stok ?? 1) > 0);
        if (stokFilter === 'outofstock') filtered = filtered.filter(u => (u.stok ?? 0) <= 0);

        if (sort === 'price-asc') filtered.sort((a, b) => Number(a.fiyat) - Number(b.fiyat));
        if (sort === 'price-desc') filtered.sort((a, b) => Number(b.fiyat) - Number(a.fiyat));
        if (sort === 'name') filtered.sort((a, b) => a.baslik.localeCompare(b.baslik, 'tr'));

        const limit = parseInt(productsGrid.dataset.limit, 10);
        if (limit > 0) filtered = filtered.slice(0, limit);

        renderProducts(filtered);
    }

    function populateTurFilter(urunler) {
        const select = document.getElementById('filter-tur');
        if (!select) return;
        const turler = [...new Set(urunler.map(u => u.tur))].sort();
        turler.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t;
            opt.textContent = t;
            select.appendChild(opt);
        });
    }

    showSkeleton(parseInt(productsGrid.dataset.limit, 10) || 6);

    if (window.location.protocol === 'file:') {
        productsGrid.innerHTML = '<p style="color:#888;text-align:center;width:100%;padding:20px;">Siteyi <strong>http://localhost:3000</strong> adresinden açın.<br><small>(HTML dosyasına çift tıklamayın — <code>npm start</code> gerekir)</small></p>';
        return;
    }

    try {
        const response = await fetch('/api/urunler');
        const data = await response.json();

        if (!response.ok || !Array.isArray(data)) {
            const mesaj = data?.mesaj || `Sunucu hatası (${response.status})`;
            throw new Error(mesaj);
        }

        allProducts = data;
        populateTurFilter(allProducts);
        applyFilters();
    } catch (error) {
        console.error('Ürünler çekilemedi:', error);
        productsGrid.innerHTML = `<p style="color:#888;text-align:center;width:100%;padding:20px;">Ürünler yüklenemedi.<br><small>${error.message || 'Veritabanı bağlantısını kontrol edin.'}</small><br><small>Docker: <code>docker compose up -d veritabani</code> · Sunucu: <code>npm start</code></small></p>`;
    }

    ['product-search', 'filter-tur', 'sort-price', 'filter-stok'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', applyFilters);
        document.getElementById(id)?.addEventListener('change', applyFilters);
    });
});
