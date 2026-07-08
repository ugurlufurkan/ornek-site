// js/admin.js

document.addEventListener('DOMContentLoaded', () => {
    const adminForm = document.getElementById('admin-add-product');

    if (adminForm) {
        adminForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Sayfanın yenilenmesini engelle

            // İnput değerlerini al
            const title = document.getElementById('p-title').value;
            const type = document.getElementById('p-type').value;
            const price = document.getElementById('p-price').value;
            const image = document.getElementById('p-image').value;

            try {
                // Backend'e POST isteği at
                const response = await fetch('/api/urunler', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        baslik: title,
                        tur: type,
                        fiyat: price,
                        resimUrl: image
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    window.showToast(`✅ ${data.mesaj}`);
                    adminForm.reset(); // Başarılıysa formu temizle
                } else {
                    window.showToast(`❌ Hata: ${data.mesaj}`);
                }
            } catch (error) {
                console.error("Bağlantı hatası:", error);
                window.showToast('❌ Sunucuya bağlanılamadı. Node.js çalışıyor mu?');
            }
        });
    }
});