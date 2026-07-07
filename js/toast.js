// js/toast.js

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. BUTONLARA RIPPLE (SU DALGASI) EFEKTİ EKLEME
    const buttons = document.querySelectorAll('.btn-premium');
    
    buttons.forEach(button => {
        button.addEventListener('click', function (e) {
            // Tıklanan noktanın koordinatlarını hesapla
            const x = e.clientX - e.target.getBoundingClientRect().left;
            const y = e.clientY - e.target.getBoundingClientRect().top;
            
            // Dalga elementini oluştur
            const ripple = document.createElement('span');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            // Animasyon bitince elementi DOM'dan temizle
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // 2. SEPETE EKLE VE TOAST BİLDİRİMİ
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const toastContainer = document.getElementById('toast-container');
    const cartCountElement = document.getElementById('cart-count');
    let cartCount = 0;

    addToCartButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            
            // Tıklanan ürünün adını kartın içinden çek
            const card = this.closest('.product-card');
            const productName = card.querySelector('.product-title').innerText;
            
            // Navbar'daki sepet sayısını artır
            cartCount++;
            cartCountElement.innerText = cartCount;

            // Toast bildirimini tetikle
            showToast(`☕ <strong>${productName}</strong> sepete eklendi!`);
        });
    });

    // Toast Oluşturma Fonksiyonu
    function showToast(message) {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.innerHTML = message;
        
        toastContainer.appendChild(toast);
        
        // CSS animasyonunun çalışması için çok kısa bir gecikme ekliyoruz
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // 3 Saniye sonra bildirimi ekrandan kaldır
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.remove();
            }, 400); // CSS transition süresini bekle
        }, 3000);
    }
});