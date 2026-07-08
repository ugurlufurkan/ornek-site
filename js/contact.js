// js/contact.js — İletişim formu
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            adSoyad: document.getElementById('contact-name')?.value?.trim(),
            email: document.getElementById('contact-email')?.value?.trim(),
            konu: document.getElementById('contact-subject')?.value?.trim(),
            mesaj: document.getElementById('contact-message')?.value?.trim()
        };

        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn?.textContent;
        if (btn) { btn.disabled = true; btn.textContent = 'Gönderiliyor...'; }

        try {
            const res = await fetch('/api/iletisim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (res.ok) {
                if (typeof window.showToast === 'function') window.showToast('✅ ' + data.mesaj);
                form.reset();
            } else {
                if (typeof window.showToast === 'function') window.showToast('❌ ' + (data.mesaj || 'Mesaj gönderilemedi.'));
            }
        } catch {
            if (typeof window.showToast === 'function') window.showToast('❌ Sunucuya bağlanılamadı.');
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = originalText; }
        }
    });
});
