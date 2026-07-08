// js/modal.js

document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('auth-modal');
    const openAuthBtn = document.getElementById('open-auth');
    const closeBtns = document.querySelectorAll('.close-modal');
    
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // --- 1. GÜVENLİ OTURUM KONTROLÜ (JWT TOKEN İLE) ---
    const checkSession = () => {
        const token = localStorage.getItem('kavrulmus_token');
        const userEmail = localStorage.getItem('kavrulmus_user_email');
        
        if (token && userEmail && openAuthBtn) {
            openAuthBtn.innerHTML = `👤 ${userEmail.split('@')[0]} (Çıkış)`;
            openAuthBtn.classList.add('logged-in'); 
        }
    };
    checkSession(); 

    // Modalı Aç veya Çıkış Yap
    if (openAuthBtn) {
        openAuthBtn.addEventListener('click', () => {
            if (openAuthBtn.classList.contains('logged-in')) {
                // ÇIKIŞ YAP (Token'ı Yok Et)
                localStorage.removeItem('kavrulmus_token');
                localStorage.removeItem('kavrulmus_user_email');
                openAuthBtn.innerHTML = `👤 Giriş / Kayıt`;
                openAuthBtn.classList.remove('logged-in');
                window.showToast('ℹ️ Başarıyla çıkış yapıldı.');
                setTimeout(() => window.location.reload(), 1000); // Sepeti vb sıfırlamak için sayfayı tazele
            } else {
                authModal.classList.add('active');
            }
        });
    }

    closeBtns.forEach(btn => btn.addEventListener('click', function() {
        this.closest('.modal-overlay').classList.remove('active');
    }));
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('active');
    });

    // --- 2. SEKMELER ARASI GEÇİŞ ---
    if (tabLogin && tabRegister) {
        tabLogin.addEventListener('click', (e) => {
            e.preventDefault();
            tabLogin.className = "auth-tab active";
            tabRegister.className = "auth-tab";
            tabLogin.style.background = 'var(--gold-accent)'; tabLogin.style.color = '#111';
            tabRegister.style.background = 'transparent'; tabRegister.style.color = 'var(--text-light)';
            loginForm.style.display = 'flex'; registerForm.style.display = 'none';
        });

        tabRegister.addEventListener('click', (e) => {
            e.preventDefault();
            tabRegister.className = "auth-tab active";
            tabLogin.className = "auth-tab";
            tabRegister.style.background = 'var(--gold-accent)'; tabRegister.style.color = '#111';
            tabLogin.style.background = 'transparent'; tabLogin.style.color = 'var(--text-light)';
            registerForm.style.display = 'flex'; loginForm.style.display = 'none';
        });
    }

    // --- 3. GERÇEK GİRİŞ YAPMA İŞLEMİ (JWT ALIMI) ---
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
                    
                    // TOKEN VE EMAİL'İ GÜVENLİCE HAFIZAYA AL
                    localStorage.setItem('kavrulmus_token', data.token);
                    localStorage.setItem('kavrulmus_user_email', data.user.email);
                    checkSession(); 
                } else {
                    window.showToast(`❌ ${data.mesaj}`);
                }
            } catch (error) {
                window.showToast('❌ Sunucuya bağlanılamadı.');
            }
        });
    }

    // --- 4. KAYIT OLMA İŞLEMİ ---
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
                    
                    localStorage.setItem('kavrulmus_token', data.token);
                    localStorage.setItem('kavrulmus_user_email', data.user.email);
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