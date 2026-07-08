// js/modal.js

document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('auth-modal');
    const openAuthBtn = document.getElementById('open-auth');
    const closeBtns = document.querySelectorAll('.close-modal');
    
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // --- 1. KALICI OTURUM KONTROLÜ (LOCALSTORAGE) ---
    // Bu fonksiyon sayfa her yenilendiğinde çalışıp cebimizde kimlik var mı diye bakar
    const checkSession = () => {
        const loggedInUser = localStorage.getItem('kavrulmus_user');
        if (loggedInUser && openAuthBtn) {
            const user = JSON.parse(loggedInUser);
            // İsmi yazdır ve yanına Çıkış yazısı ekle
            openAuthBtn.innerHTML = `👤 ${user.email.split('@')[0]} (Çıkış)`;
            openAuthBtn.classList.add('logged-in'); 
        }
    };
    checkSession(); // Sayfa açılır açılmaz çalıştır!

    // Modalı Aç veya Çıkış Yap
    if (openAuthBtn) {
        openAuthBtn.addEventListener('click', () => {
            if (openAuthBtn.classList.contains('logged-in')) {
                // Eğer zaten giriş yapılmışsa, butona basınca ÇIKIŞ yapsın
                localStorage.removeItem('kavrulmus_user');
                openAuthBtn.innerHTML = `👤 Giriş / Kayıt`;
                openAuthBtn.classList.remove('logged-in');
                window.showToast('ℹ️ Başarıyla çıkış yapıldı.');
            } else {
                // Giriş yapılmamışsa modalı aç
                authModal.classList.add('active');
            }
        });
    }

    // Modal Kapatma İşlemleri
    closeBtns.forEach(btn => btn.addEventListener('click', function() {
        this.closest('.modal-overlay').classList.remove('active');
    }));
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('active');
    });

    // --- 2. SEKMELER ARASI GEÇİŞ (TAKILMA HATASI ÇÖZÜLDÜ) ---
    if (tabLogin && tabRegister) {
        tabLogin.addEventListener('click', (e) => {
            e.preventDefault(); // TAKILMAYI ÖNLEYEN KOD BURASI
            tabLogin.style.background = 'var(--gold-accent)';
            tabLogin.style.color = '#111';
            tabRegister.style.background = 'transparent';
            tabRegister.style.color = 'var(--text-light)';
            
            loginForm.style.display = 'flex';
            registerForm.style.display = 'none';
        });

        tabRegister.addEventListener('click', (e) => {
            e.preventDefault(); // TAKILMAYI ÖNLEYEN KOD BURASI
            tabRegister.style.background = 'var(--gold-accent)';
            tabRegister.style.color = '#111';
            tabLogin.style.background = 'transparent';
            tabLogin.style.color = 'var(--text-light)';
            
            registerForm.style.display = 'flex';
            loginForm.style.display = 'none';
        });
    }

    // --- 3. GERÇEK GİRİŞ YAPMA İŞLEMİ (LOGIN) ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('input[type="email"]').value;
            const password = loginForm.querySelector('input[type="password"]').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();

                if (response.ok) {
                    window.showToast(`✅ ${data.mesaj}`);
                    authModal.classList.remove('active');
                    loginForm.reset();
                    
                    // KULLANICIYI HAFIZAYA KAYDET (KALICI OTURUM)
                    localStorage.setItem('kavrulmus_user', JSON.stringify(data.user));
                    checkSession(); // Navbar'ı güncelle
                } else {
                    window.showToast(`❌ ${data.mesaj}`); // Hatalı şifre uyarısı
                }
            } catch (error) {
                window.showToast('❌ Sunucuya bağlanılamadı.');
            }
        });
    }

    // --- 4. KAYIT OLMA İŞLEMİ (REGISTER) ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const inputs = registerForm.querySelectorAll('input');
            const email = inputs[1].value;
            const password = inputs[2].value;

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();

                if (response.ok) {
                    window.showToast(`✅ ${data.mesaj}`);
                    authModal.classList.remove('active'); 
                    registerForm.reset(); 
                    
                    // KAYIT OLDUKTAN SONRA OTOMATİK GİRİŞ YAP VE HAFIZAYA AL
                    localStorage.setItem('kavrulmus_user', JSON.stringify(data.user));
                    checkSession();
                } else {
                    window.showToast(`❌ ${data.mesaj}`);
                }
            } catch (error) {
                window.showToast('❌ Sunucuya bağlanılamadı.');
            }
        });
    }
});