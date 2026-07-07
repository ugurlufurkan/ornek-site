// js/cart.js

document.addEventListener('DOMContentLoaded', () => {
    // Seçiciler
    const cartIcon = document.getElementById('cart-icon');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');

    // Sepet Verisi
    let cart = [];

    // Sepeti Aç
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            cartSidebar.classList.add('active');
            cartOverlay.classList.add('active');
        });
    }

    // Sepeti Kapat
    const closeCart = () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    };

    if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    // --- EVENT DELEGATION (OLAY DELEGASYONU) ---
    // Sayfaya sonradan eklenen dinamik butonları yakalamak için tüm dokümanı dinliyoruz
    document.addEventListener('click', function (e) {
        
        // 1. Eğer tıklanan eleman "Sepete Ekle" butonu ise (veya içindeki ikon ise)
        if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
            e.preventDefault();
            
            const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
            const card = button.closest('.product-card');
            
            const title = card.querySelector('.product-title').innerText;
            const priceText = card.querySelector('.price').innerText;
            const price = parseFloat(priceText.replace(' TL', ''));
            const imgSrc = card.querySelector('.product-img').src;

            // Sepet objesi oluştur ve ekle
            const product = { title, price, imgSrc, id: Date.now() };
            cart.push(product);
            
            // Arayüzü Güncelle
            updateCartUI();
            
            // Global Toast fonksiyonunu tetikle
            if (typeof window.showToast === 'function') {
                window.showToast(`☕ <strong>${title}</strong> sepete eklendi!`);
            }
        }

        // 2. Eğer tıklanan eleman sepetten ürün silme butonu ise
        if (e.target.classList.contains('remove-item')) {
            const itemIndex = e.target.getAttribute('data-index');
            cart.splice(itemIndex, 1);
            updateCartUI();
        }
    });

    // Sepet Arayüzünü Güncelleme Fonksiyonu
    function updateCartUI() {
        // Sayıyı güncelle
        if (cartCountElement) cartCountElement.innerText = cart.length;

        // Temizle
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';
            let total = 0;

            // Ürünleri listele
            cart.forEach((item, index) => {
                total += item.price;

                const cartItemHTML = `
                    <div class="cart-item">
                        <img src="${item.imgSrc}" alt="${item.title}" class="cart-item-img">
                        <div class="cart-item-info">
                            <h4 class="cart-item-title">${item.title}</h4>
                            <span class="cart-item-price">${item.price} TL</span>
                        </div>
                        <button class="remove-item" data-index="${index}">🗑️</button>
                    </div>
                `;
                cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
            });

            // Toplamı yaz
            if (cartTotalElement) cartTotalElement.innerText = total.toFixed(2);
        }
    }
});