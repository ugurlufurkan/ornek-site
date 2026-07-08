const FAVORITES_KEY = 'kavrulmus_favorites';

async function loadFavorites() {
    const grid = document.getElementById('favorites-grid');
    if (!grid) return;

    grid.innerHTML = `<div class="skeleton-grid">${Array(3).fill('<div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-line"></div></div>').join('')}</div>`;

    if (typeof syncFavoritesFromServer === 'function') await syncFavoritesFromServer();
    const ids = typeof getFavorites === 'function' ? getFavorites() : (JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []).map(Number);

    if (ids.length === 0) {
        grid.innerHTML = `<h2 style="text-align:center;width:100%;">❤️ Henüz favori ürün eklemedin.</h2>`;
        return;
    }

    const response = await fetch('/api/urunler');
    const urunler = await response.json();
    const favoriler = urunler.filter(u => ids.includes(Number(u.id)));
    const esc = window.escapeHtml || (s => s);

    grid.innerHTML = favoriler.map(urun => `
        <div class="product-card">
            <div class="card-image-wrapper">
                <img src="${esc(urun.resim)}" class="product-img" alt="${esc(urun.baslik)}">
            </div>
            <div class="card-content">
                <h3>${esc(urun.baslik)}</h3>
                <p>${esc(urun.tur)}</p>
                <span class="price">${urun.fiyat} TL</span>
                <div class="card-footer">
                    <a class="btn-premium secondary" href="urun-detay.html?id=${urun.id}">İncele</a>
                    <button class="btn-premium primary remove-fav" data-id="${urun.id}">Kaldır</button>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.remove-fav').forEach(btn => {
        btn.onclick = async () => {
            if (typeof toggleFavorite === 'function') {
                await toggleFavorite(btn.dataset.id, null);
            } else {
                let list = (JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []).map(Number);
                list = list.filter(id => Number(id) !== Number(btn.dataset.id));
                localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
            }
            loadFavorites();
        };
    });
}

loadFavorites();
