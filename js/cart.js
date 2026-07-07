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
    const addToCartButtons = document.querySelectorAll('.add-to-cart');

    // Sepet Verisi
    let cart = [];

    // Sepeti Aç
    cartIcon.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
    });

    // Sepeti Kapat (Çarpı butonuna veya dışarıya tıklayınca)
    const closeCart = () => {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
    };

    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Ürün Ekleme İşlemi
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            
            const card = this.closest('.product-card');
            const title = card.querySelector('.product-title').innerText;
            const priceText = card.querySelector('.price').innerText;
            const price = parseFloat(priceText.replace(' TL', ''));
            const imgSrc = card.querySelector('.product-img').src;

            // Sepet objesi oluştur
            const product = { title, price, imgSrc, id: Date.now() };
            
            // Sepete ekle ve UI güncelle
            cart.push(product);
            updateCartUI();
            
            // Toast Bildirimini Tetikle (toast.js içindeki global fonksiyona erişim)
            if (typeof window.showToast === 'function') {
                window.showToast(`☕ <strong>${title}</strong> sepete eklendi!`);
            }
        });
    });

    // Sepet Arayüzünü Güncelle
    function updateCartUI() {
        // Sepet sayısını güncelle
        cartCountElement.innerText = cart.length;

        // Sepet içini temizle
        cartItemsContainer.innerHTML = '';

        let total = 0;

        // Sepetteki ürünleri ekrana bas
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

        // Toplam fiyatı güncelle
        cartTotalElement.innerText = total.toFixed(2);

        // Silme butonlarına olay dinleyici ekle
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const itemIndex = this.getAttribute('data-index');
                cart.splice(itemIndex, 1);
                updateCartUI();
            });
        });
    }
});