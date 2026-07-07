// js/modal.js

/* =====================================================
   MODAL AÇMA / KAPAMA MANTIĞI
   Not: Form gönderme (kayıt/giriş) mantığı artık auth.js'te.
   Bu dosya SADECE modalların açılıp kapanmasından sorumlu.
===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('auth-modal');
    const openAuthBtn = document.getElementById('open-auth');
    const closeBtns = document.querySelectorAll('.close-modal');

    // "Giriş Yap" butonuna basınca auth modalını aç
    if (openAuthBtn && authModal) {
        openAuthBtn.addEventListener('click', () => {
            authModal.classList.add('active');
        });
    }

    // Tüm kapatma çarpılarını (X) ortak şekilde yönet
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const overlay = this.closest('.modal-overlay');
            if (overlay) overlay.classList.remove('active');
        });
    });

    // Modal dışına (karartılmış arka plana) tıklayınca da kapat
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.classList.remove('active');
        }
    });
});

/* =====================================================
   END
===================================================== */