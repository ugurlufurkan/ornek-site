// js/order-track.js — Sipariş takip (takip no ile)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('track-form');
    const resultBox = document.getElementById('track-result');
    if (!form || !resultBox) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const takipNo = document.getElementById('track-no')?.value?.trim();
        if (!takipNo) return;

        resultBox.innerHTML = '<p style="color:#888;">Sorgulanıyor...</p>';
        resultBox.style.display = 'block';

        try {
            const res = await fetch(`/api/siparisler/takip/${encodeURIComponent(takipNo)}`);
            const data = await res.json();

            if (!res.ok) {
                resultBox.innerHTML = `<p style="color:#e63946;">❌ ${data.mesaj || 'Sipariş bulunamadı.'}</p>`;
                return;
            }

            const urunler = (data.urunler || []).map(u => `${u.quantity}x ${u.title}`).join(', ');
            const tarih = data.tarih ? new Date(data.tarih).toLocaleString('tr-TR') : '-';

            resultBox.innerHTML = `
                <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(200,159,93,0.25); border-radius:12px; padding:24px; text-align:left;">
                    <p><strong>Takip No:</strong> ${data.id}</p>
                    <p><strong>Durum:</strong> <span style="color:var(--gold-accent);">${data.durum}</span></p>
                    <p><strong>Tarih:</strong> ${tarih}</p>
                    <p><strong>Toplam:</strong> ${data.toplamTutar} TL</p>
                    <p><strong>Ürünler:</strong> ${urunler || '-'}</p>
                </div>`;
        } catch {
            resultBox.innerHTML = '<p style="color:#e63946;">Sunucuya bağlanılamadı.</p>';
        }
    });
});
