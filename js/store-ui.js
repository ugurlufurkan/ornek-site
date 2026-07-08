// js/store-ui.js — Sepet + checkout UI'sını eksik sayfalara yükler
(function () {
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) return resolve();
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.body.appendChild(s);
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        if (!document.getElementById('cart-icon')) return;

        if (!document.getElementById('cart-sidebar')) {
            try {
                const res = await fetch('/partials/store-ui.html');
                if (res.ok) {
                    document.body.insertAdjacentHTML('beforeend', await res.text());
                }
            } catch (err) {
                console.warn('Store UI yüklenemedi:', err);
            }
        }

        try {
            await loadScript('js/cart.js');
            await loadScript('js/tracking.js');
        } catch (err) {
            console.warn('Sepet scriptleri yüklenemedi:', err);
        }
    });
})();
