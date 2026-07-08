// js/favorites.js — DB + localStorage birleşik favoriler
const FAVORITES_KEY = 'kavrulmus_favorites';
let favoritesCache = [];

async function syncFavoritesFromServer() {
    const token = localStorage.getItem('kavrulmus_token');
    if (!token) {
        favoritesCache = (JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []).map(Number);
        return favoritesCache;
    }
    try {
        const localIds = (JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []).map(Number);
        if (localIds.length) {
            await fetch('/api/favoriler/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ids: localIds })
            });
        }
        const res = await fetch('/api/favoriler', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
            favoritesCache = (await res.json()).map(Number);
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesCache));
        }
    } catch {
        favoritesCache = (JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []).map(Number);
    }
    return favoritesCache;
}

function getFavorites() {
    return favoritesCache.length ? favoritesCache : (JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []).map(Number);
}

function saveFavoritesLocal(favorites) {
    favoritesCache = favorites.map(Number);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesCache));
}

function isFavorite(id) {
    return getFavorites().includes(Number(id));
}

function updateFavoriteButton(button, id) {
    if (!button) return;
    if (isFavorite(id)) {
        button.innerHTML = '♥';
        button.classList.add('active');
    } else {
        button.innerHTML = '♡';
        button.classList.remove('active');
    }
}

function updateFavoriteCounter() {
    const badge = document.querySelector('.favorite-count');
    if (badge) badge.textContent = getFavorites().length;
}

async function toggleFavorite(id, button) {
    id = Number(id);
    const token = localStorage.getItem('kavrulmus_token');

    if (token) {
        try {
            const res = await fetch(`/api/favoriler/${id}`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                let list = getFavorites();
                if (data.favoride) {
                    if (!list.includes(id)) list.push(id);
                    if (window.showToast) window.showToast('❤️ Favorilere eklendi.');
                } else {
                    list = list.filter(f => f !== id);
                    if (window.showToast) window.showToast('💔 Favorilerden kaldırıldı.');
                }
                saveFavoritesLocal(list);
                updateFavoriteButton(button, id);
                updateFavoriteCounter();
                return;
            }
        } catch { /* local fallback */ }
    }

    let favorites = getFavorites();
    if (favorites.includes(id)) {
        favorites = favorites.filter(f => f !== id);
        if (window.showToast) window.showToast('💔 Favorilerden kaldırıldı.');
    } else {
        favorites.push(id);
        if (window.showToast) window.showToast('❤️ Favorilere eklendi.');
    }
    saveFavoritesLocal(favorites);
    updateFavoriteButton(button, id);
    updateFavoriteCounter();
}

document.addEventListener('click', (e) => {
    const btn = e.target.closest('.wishlist-btn, .detail-wishlist-btn');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(btn.dataset.id, btn);
});

document.addEventListener('DOMContentLoaded', async () => {
    await syncFavoritesFromServer();
    updateFavoriteCounter();
    document.querySelectorAll('.wishlist-btn, .detail-wishlist-btn').forEach(btn => {
        updateFavoriteButton(btn, btn.dataset.id);
    });
});

window.syncFavoritesFromServer = syncFavoritesFromServer;
window.getFavorites = getFavorites;
window.toggleFavorite = toggleFavorite;
window.updateFavoriteCounter = updateFavoriteCounter;
window.updateFavoriteButton = updateFavoriteButton;
