// js/toast.js

document.addEventListener('DOMContentLoaded', () => {
    
    // BUTONLARA RIPPLE (SU DALGASI) EFEKTİ EKLEME
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

    const toastContainer = document.getElementById('toast-container');

    // Toast Oluşturma Fonksiyonunu global (window) yapıyoruz ki cart.js kullanabilsin
    window.showToast = function(message) {
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
            }, 400); 
        }, 3000);
    };
});