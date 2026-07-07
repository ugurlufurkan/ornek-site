// js/auth.js

/* =====================================================
   AUTH (GİRİŞ / KAYIT) MANTIĞI
   - Sekme geçişi (Giriş Yap / Kayıt Ol) varsa yönetir
   - Kayıt formunu /api/auth/register'a gönderir
   - Giriş formunu /api/auth/login'a gönderir
   - Giriş yapan kullanıcıyı localStorage'da hatırlar
   Not: Bu dosya modal.js'in YERİNE geçmez, onunla birlikte çalışır.
   modal.js sadece modalı açar/kapatır, form gönderme işini bu dosya yapar.
===================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const authModal = document.getElementById('auth-modal');
    const openAuthBtn = document.getElementById('open-auth');

    // Bu sayfada auth sistemi yoksa hiçbir şey yapma
    if (!loginForm && !registerForm) return;

    /* -----------------------------------------------------
       SEKME (TAB) GEÇİŞİ: Giriş Yap <-> Kayıt Ol
       (Eğer HTML'de sekme yapısı varsa çalışır)
    ----------------------------------------------------- */
    if (tabLogin && tabRegister && loginForm && registerForm) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabRegister.classList.remove('active');
            loginForm.classList.add('active');
            registerForm.classList.remove('active');
        });

        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabLogin.classList.remove('active');
            registerForm.classList.add('active');
            loginForm.classList.remove('active');
        });
    }

    /* -----------------------------------------------------
       ORTAK YARDIMCI: Girişten sonra arayüzü güncelle
    ----------------------------------------------------- */
    function girisBasariliOldu(email) {
        window.showToast(`✅ Hoş geldin, ${email.split('@')[0]}!`);
        if (authModal) authModal.classList.remove('active');
        if (openAuthBtn) openAuthBtn.innerHTML = `👤 ${email.split('@')[0]}`;
        localStorage.setItem('kavrulmus_kullanici', email);
    }

    /* -----------------------------------------------------
       KAYIT OL FORMU
       Not: Ayrı bir register-form yoksa, login-form kayıt
       işini üstlenir (tek formlu eski yapıyla uyumluluk için).
    ----------------------------------------------------- */
    const kayitFormu = registerForm || loginForm;

    if (kayitFormu) {
        kayitFormu.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = kayitFormu.querySelector('input[type="email"]');
            const passwordInput = kayitFormu.querySelector('input[type="password"]');
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    kayitFormu.reset();
                    girisBasariliOldu(email);
                } else {
                    window.showToast(`❌ ${data.mesaj}`);
                }
            } catch (error) {
                console.error("Kayıt hatası:", error);
                window.showToast('❌ Sunucuya bağlanılamadı.');
            }
        });
    }

    /* -----------------------------------------------------
       GİRİŞ YAP FORMU
       Sadece register-form AYRI olarak varsa devreye girer,
       yoksa yukarıdaki tek form zaten kayıt/giriş ikisini de yapıyor demektir.
    ----------------------------------------------------- */
    if (registerForm && loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = loginForm.querySelector('input[type="email"]');
            const passwordInput = loginForm.querySelector('input[type="password"]');
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    loginForm.reset();
                    girisBasariliOldu(email);
                } else {
                    window.showToast(`❌ ${data.mesaj}`);
                }
            } catch (error) {
                console.error("Giriş hatası:", error);
                window.showToast('❌ Sunucuya bağlanılamadı.');
            }
        });
    }

    /* -----------------------------------------------------
       SAYFA AÇILINCA: Daha önce giriş yapılmış mı kontrol et
       (localStorage'da kayıtlı kullanıcı varsa navbar'ı güncelle)
    ----------------------------------------------------- */
    const kayitliKullanici = localStorage.getItem('kavrulmus_kullanici');
    if (kayitliKullanici && openAuthBtn) {
        openAuthBtn.innerHTML = `👤 ${kayitliKullanici.split('@')[0]}`;
    }
});

/* =====================================================
   END
===================================================== */