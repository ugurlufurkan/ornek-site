// 14. ALTIN CURSOR MANTIĞI
const cursor = document.getElementById('cursor-ring');
document.addEventListener('mousemove', e => {
    if(cursor) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }
});

// LOADER & THEME & SCROLL
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if(loader) setTimeout(() => loader.classList.add('fade-out'), 800); 
});

const themeBtn = document.getElementById('theme-toggle');
if (localStorage.getItem('theme') === 'light') { document.body.classList.add('light-mode'); if(themeBtn) themeBtn.textContent = '🌙'; }
if(themeBtn) {
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
        themeBtn.textContent = document.body.classList.contains('light-mode') ? '🌙' : '☀️';
    });
}
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if(window.scrollY > 50) nav.classList.add('scrolled');
    else if(window.location.pathname.includes('index') || window.location.pathname === '/') nav.classList.remove('scrolled');
});

// 16. AKILLI ARAMA (Etiketlerle)
const globalProducts = [
    { id: 1, name: "Filtre Kahve + Tiramisu", price: 400, img: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?q=80&w=100", tags: "menü tatlı kahve sıcak", link: "urunler.html" },
    { id: 2, name: "Espresso", price: 335, img: "https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?q=80&w=100", tags: "sıcak yoğun sade sert", link: "urunler.html" },
    { id: 3, name: "Flat White", price: 140, img: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?q=80&w=100", tags: "sıcak sütlü yumuşak latte", link: "urunler.html" },
    { id: 4, name: "Iced Latte", price: 150, img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=100", tags: "soğuk sütlü buzlu yaz", link: "urunler.html" },
    { id: 5, name: "Cold Brew", price: 165, img: "https://images.unsplash.com/photo-1517701550927-30cfcb11f267?q=80&w=100", tags: "soğuk sert vegan sade", link: "urunler.html" },
    { id: 6, name: "San Sebastian", price: 280, img: "https://images.unsplash.com/photo-1602351447937-745cb7be3ab6?q=80&w=100", tags: "tatlı peynir kek mocha", link: "urunler.html" },
    { id: 7, name: "Belçika Brownie", price: 190, img: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?q=80&w=100", tags: "tatlı çikolata kek", link: "urunler.html" },
    { id: 8, name: "Latte + San Sebastian", price: 450, img: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=100", tags: "menü tatlı sütlü", link: "urunler.html" }
];

const sInput = document.getElementById('search-input');
const sResults = document.getElementById('search-results');
if(sInput && sResults) {
    sInput.addEventListener('input', e => {
        const query = e.target.value.toLowerCase().trim();
        sResults.innerHTML = '';
        if (query.length > 0) {
            const res = globalProducts.filter(p => p.name.toLowerCase().includes(query) || p.tags.includes(query));
            if(res.length > 0) {
                sResults.classList.add('active');
                res.forEach(p => sResults.innerHTML += `<a href="${p.link}" class="search-item"><img src="${p.img}"><div><h4>${p.name}</h4><p>${p.price} TL</p></div></a>`);
            } else sResults.classList.remove('active');
        } else sResults.classList.remove('active');
    });
}

// 7. FAVORİLER & 17. GELİŞMİŞ FİLTRELER
let favs = JSON.parse(localStorage.getItem('favs')) || [];
const heartBtns = document.querySelectorAll('.heart-btn');
heartBtns.forEach(btn => {
    const pId = btn.parentElement.getAttribute('data-id');
    if(favs.includes(pId)) btn.classList.add('active');
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        if(favs.includes(pId)) { favs = favs.filter(id => id !== pId); this.classList.remove('active'); }
        else { favs.push(pId); this.classList.add('active'); }
        localStorage.setItem('favs', JSON.stringify(favs));
    });
});

const mainFilters = document.querySelectorAll('.filter-btn');
const advFilters = document.querySelectorAll('.adv-filter');
const pCards = document.querySelectorAll('.filter-item');

function applyFilters() {
    let activeMain = document.querySelector('.filter-btn.active').getAttribute('data-filter');
    let activeAdv = Array.from(advFilters).filter(cb => cb.checked).map(cb => cb.value);
    
    pCards.forEach(card => {
        let matchMain = (activeMain === 'all') || (activeMain === 'favori' && favs.includes(card.getAttribute('data-id'))) || card.classList.contains(activeMain);
        let matchAdv = activeAdv.length === 0 || activeAdv.every(cls => card.classList.contains(cls));
        card.style.display = (matchMain && matchAdv) ? 'flex' : 'none';
    });
}
mainFilters.forEach(btn => btn.addEventListener('click', function() { mainFilters.forEach(b => b.classList.remove('active')); this.classList.add('active'); applyFilters(); }));
advFilters.forEach(cb => cb.addEventListener('change', applyFilters));

// 11. HIZLI BAKIŞ MODALI & İSTATİSTİKLER
const modal = document.getElementById('product-modal');
document.querySelectorAll('.modal-trigger').forEach(trigger => {
    trigger.addEventListener('click', function() {
        document.getElementById('modal-img').src = this.getAttribute('src');
        document.getElementById('modal-title').textContent = this.nextElementSibling.textContent;
        document.getElementById('modal-desc').textContent = this.getAttribute('data-desc');
        document.getElementById('modal-notes').textContent = this.getAttribute('data-notes');
        document.getElementById('modal-price').textContent = this.parentElement.querySelector('.new-price').textContent;
        
        // Barları doldur (1-5 arası)
        if(document.getElementById('stat-int')) {
            document.getElementById('stat-int').style.width = (this.getAttribute('data-int') * 20) + '%';
            document.getElementById('stat-acid').style.width = (this.getAttribute('data-acid') * 20) + '%';
            document.getElementById('stat-caf').style.width = (this.getAttribute('data-caf') * 20) + '%';
        }
        modal.classList.add('active');
    });
});
if(document.getElementById('close-modal')) document.getElementById('close-modal').addEventListener('click', () => modal.classList.remove('active'));

// 15. SEPETE UÇAN ANİMASYON & SEPET MANTIĞI
let cart = JSON.parse(localStorage.getItem('cartItems')) || [];
const cartIcon = document.getElementById('cart-icon');
const cSide = document.getElementById('cart-sidebar');
const cOver = document.getElementById('cart-overlay');
if(cartIcon) cartIcon.addEventListener('click', () => { cSide.classList.add('open'); cOver.classList.add('active'); renderCart(); });
function closeCart() { if(cSide) cSide.classList.remove('open'); if(cOver) cOver.classList.remove('active'); }
if(cOver) cOver.addEventListener('click', closeCart);
if(document.getElementById('close-cart')) document.getElementById('close-cart').addEventListener('click', closeCart);

document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', function(e) {
        // Uçan Animasyon (Feature 15)
        const imgNode = this.parentElement.querySelector('img');
        if(imgNode && cartIcon) {
            const flyingImg = imgNode.cloneNode();
            flyingImg.classList.add('flying-img');
            const rect = imgNode.getBoundingClientRect();
            flyingImg.style.top = rect.top + 'px'; flyingImg.style.left = rect.left + 'px';
            document.body.appendChild(flyingImg);
            
            const targetRect = cartIcon.getBoundingClientRect();
            setTimeout(() => {
                flyingImg.style.top = (targetRect.top + 10) + 'px';
                flyingImg.style.left = (targetRect.left + 20) + 'px';
                flyingImg.style.width = '20px'; flyingImg.style.height = '20px';
                flyingImg.style.opacity = '0';
            }, 10);
            setTimeout(() => flyingImg.remove(), 800);
        }

        // Sepete Ekleme İşi
        const id = this.getAttribute('data-id');
        const ex = cart.find(i => i.id === id);
        if (ex) ex.quantity += 1;
        else cart.push({ id, name: this.getAttribute('data-name'), price: parseFloat(this.getAttribute('data-price')), img: this.getAttribute('data-img'), quantity: 1 });
        localStorage.setItem('cartItems', JSON.stringify(cart));
        updateCartCount();
    });
});

function renderCart() {
    const cCont = document.getElementById('cart-items');
    if(!cCont) return;
    cCont.innerHTML = ""; let total = 0;
    if(cart.length === 0) cCont.innerHTML = "<p style='text-align:center;color:#aaa;'>Sepet boş.</p>";
    cart.forEach(item => {
        total += item.price * item.quantity;
        cCont.innerHTML += `<div class="cart-item"><img src="${item.img}"><div><h4>${item.name}</h4><p>${item.price} TL</p></div><div class="quantity-controls"><button onclick="changeQ('${item.id}', -1)">-</button><span>${item.quantity}</span><button onclick="changeQ('${item.id}', 1)">+</button></div></div>`;
    });
    if(document.getElementById('cart-total')) document.getElementById('cart-total').textContent = total.toFixed(2);
}
window.changeQ = function(id, d) {
    const it = cart.find(i => i.id === id);
    if(it) { it.quantity += d; if(it.quantity <= 0) cart = cart.filter(i => i.id !== id); localStorage.setItem('cartItems', JSON.stringify(cart)); renderCart(); updateCartCount(); }
}
function updateCartCount() {
    let t = 0; cart.forEach(i => t += i.quantity);
    if(document.getElementById('cart-count')) document.getElementById('cart-count').textContent = t;
}
updateCartCount();

// 8. CHECKOUT & 9. TAKİP SİSTEMİ
const goCheck = document.getElementById('go-to-checkout');
const checkModal = document.getElementById('checkout-modal');
const trackModal = document.getElementById('tracking-modal');
if(goCheck) {
    goCheck.addEventListener('click', () => {
        if(cart.length === 0) { alert('Sepetiniz boş!'); return; }
        closeCart();
        checkModal.classList.add('active');
    });
}
if(document.getElementById('checkout-form')) {
    document.getElementById('checkout-form').addEventListener('submit', function(e) {
        e.preventDefault();
        checkModal.classList.remove('active');
        cart = []; localStorage.setItem('cartItems', '[]'); updateCartCount();
        trackModal.classList.add('active');
        
        // Animasyonlu Takip Barı (Feature 9)
        const pFill = document.getElementById('track-progress');
        setTimeout(() => { pFill.style.width = '33%'; document.getElementById('stage-2').classList.add('active'); }, 2000);
        setTimeout(() => { pFill.style.width = '66%'; document.getElementById('stage-3').classList.add('active'); }, 4000);
        setTimeout(() => { pFill.style.width = '100%'; document.getElementById('stage-4').classList.add('active'); }, 6000);
    });
}

// 6. SADAKAT (PUAN) VE GİRİŞ SİSTEMİ
const aModal = document.getElementById('auth-modal');
if(document.getElementById('close-auth')) document.getElementById('close-auth').addEventListener('click', () => aModal.classList.remove('active'));
if(document.getElementById('tab-login')) {
    document.getElementById('tab-login').addEventListener('click', () => { document.getElementById('tab-login').classList.add('active'); document.getElementById('tab-register').classList.remove('active'); document.getElementById('login-form').classList.add('active'); document.getElementById('register-form').classList.remove('active'); });
    document.getElementById('tab-register').addEventListener('click', () => { document.getElementById('tab-register').classList.add('active'); document.getElementById('tab-login').classList.remove('active'); document.getElementById('register-form').classList.add('active'); document.getElementById('login-form').classList.remove('active'); });
}

if(document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', e => {
        e.preventDefault();
        let users = JSON.parse(localStorage.getItem('users')) || [];
        users.push({ name: document.getElementById('reg-name').value, email: document.getElementById('reg-email').value, pass: document.getElementById('reg-pass').value, points: 240 });
        localStorage.setItem('users', JSON.stringify(users));
        alert("Kayıt başarılı! Lütfen giriş yapın.");
        document.getElementById('tab-login').click();
    });
}
if(document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', e => {
        e.preventDefault();
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === document.getElementById('login-email').value && u.pass === document.getElementById('login-pass').value);
        if(user) { localStorage.setItem('currentUser', JSON.stringify(user)); aModal.classList.remove('active'); updateAuth(); }
        else alert("Hatalı giriş!");
    });
}

window.logoutUser = function() { localStorage.removeItem('currentUser'); updateAuth(); }
function updateAuth() {
    const area = document.getElementById('auth-menu-area');
    if(!area) return;
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if(user) {
        area.innerHTML = `<div class="dropdown"><button class="auth-btn">${user.name.split(' ')[0]} <span class="loyalty-badge">⭐ ${user.points} Puan</span></button><div class="dropdown-content"><a href="#" onclick="logoutUser()">Çıkış Yap</a></div></div>`;
    } else {
        area.innerHTML = `<button id="open-auth" class="auth-btn">👤 Giriş Yap</button>`;
        document.getElementById('open-auth').addEventListener('click', () => aModal.classList.add('active'));
    }
}
updateAuth();

// 10. KAHVE QUİZ
let qStep = 1;
window.nextQuiz = function(ans) {
    const q = document.getElementById('quiz-question');
    if(qStep === 1) {
        if(ans === 'evet') { q.textContent = "Sütlü olsun mu?"; qStep = 2; }
        else { q.textContent = "Ferahlatıcı ve soğuk mu olsun?"; qStep = 3; }
    } else if(qStep === 2) {
        showQuizResult(ans === 'evet' ? 'Flat White' : 'Espresso');
    } else if(qStep === 3) {
        showQuizResult(ans === 'evet' ? 'Cold Brew' : 'Filtre Kahve');
    }
}
function showQuizResult(coffee) {
    document.getElementById('quiz-question-box').classList.add('hidden');
    document.getElementById('quiz-result').classList.remove('hidden');
    document.getElementById('result-coffee').textContent = coffee;
}
window.resetQuiz = function() {
    qStep = 1;
    document.getElementById('quiz-question').textContent = "Sert ve yoğun kahve sever misin?";
    document.getElementById('quiz-question-box').classList.remove('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
}

// 23. AI ASİSTAN SOHBET
const chatToggle = document.getElementById('chat-toggle');
const chatBot = document.getElementById('ai-chatbot');
const chatInput = document.getElementById('chat-input-text');
const chatSend = document.getElementById('chat-send');
const chatBody = document.getElementById('chat-body');

if(chatToggle) {
    chatToggle.addEventListener('click', () => {
        chatBot.classList.toggle('open');
        document.getElementById('chat-icon').textContent = chatBot.classList.contains('open') ? '▼' : '▲';
    });
}
if(chatSend) {
    chatSend.addEventListener('click', () => {
        const txt = chatInput.value.trim().toLowerCase();
        if(!txt) return;
        chatBody.innerHTML += `<div class="chat-message user">${chatInput.value}</div>`;
        chatInput.value = '';
        setTimeout(() => {
            let reply = "Harika bir seçim! Filtre kahvemizi denemelisin.";
            if(txt.includes('tatlı')) reply = "Sana San Sebastian ve Latte menümüzü kesinlikle öneririm!";
            if(txt.includes('soğuk') || txt.includes('buz')) reply = "Cold Brew tam sana göre, 18 saatte demlendi.";
            chatBody.innerHTML += `<div class="chat-message bot">${reply}</div>`;
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 800);
    });
}