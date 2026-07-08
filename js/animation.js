/* =====================================================
   KAVRULMUŞ - PREMIUM ANIMATIONS v1.0
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    initScrollAnimations();
    initCounterAnimations();
    initParallax();
    initNavbarAnimation();

});

/* =====================================================
   SCROLL ANIMATIONS
===================================================== */

function initScrollAnimations() {

    // Sadece henüz gözlemlenmemiş (show class'ı olmayan) .animate elemanlarını seç.
    // Bu sayede fonksiyon sonradan (örn. ürünler API'den geldikten sonra) tekrar
    // çağrıldığında zaten görünür olanları yeniden gözlemlemeye çalışmaz.
    const elements = document.querySelectorAll(".animate:not(.show)");

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("show");

                observer.unobserve(entry.target);

            }

        });

    }, {

        threshold: 0.15,

        rootMargin: "0px 0px -60px 0px"

    });

    elements.forEach(element => {

        observer.observe(element);

    });

}

// Bu fonksiyonu dışarıdan (örn. api.js, ürünleri DOM'a ekledikten sonra)
// tekrar çağırabilmek için global olarak erişilebilir yapıyoruz.
window.KavrulmusAnimations = {
    initScrollAnimations
};

/* =====================================================
   COUNTER ANIMATION
===================================================== */

function initCounterAnimations() {

    const counters = document.querySelectorAll("[data-counter]");

    counters.forEach(counter => {

        const target = Number(counter.dataset.counter);

        let current = 0;

        const speed = Math.max(1, Math.floor(target / 80));

        const update = () => {

            current += speed;

            if (current >= target) {

                counter.textContent = target.toLocaleString("tr-TR");

                return;

            }

            counter.textContent = current.toLocaleString("tr-TR");

            requestAnimationFrame(update);

        };

        const observer = new IntersectionObserver((entries) => {

            entries.forEach(entry => {

                if (entry.isIntersecting) {

                    update();

                    observer.disconnect();

                }

            });

        });

        observer.observe(counter);

    });

}

/* =====================================================
   HERO PARALLAX
===================================================== */

function initParallax() {

    const hero = document.querySelector(".hero");

    if (!hero) return;

    window.addEventListener("scroll", () => {

        const offset = window.pageYOffset;

        hero.style.backgroundPositionY = `${offset * 0.4}px`;

    });

}

/* =====================================================
   NAVBAR
===================================================== */

function initNavbarAnimation() {

    const navbar = document.getElementById("navbar");

    if (!navbar) return;

    window.addEventListener("scroll", () => {

        if (window.scrollY > 40) {

            navbar.classList.add("navbar-scrolled");

        } else {

            navbar.classList.remove("navbar-scrolled");

        }

    });

}

/* =====================================================
   SMOOTH SCROLL
===================================================== */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener("click", function (e) {

        const target = document.querySelector(this.getAttribute("href"));

        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({

            behavior: "smooth",

            block: "start"

        });

    });

});

/* =====================================================
   RIPPLE EFFECT
===================================================== */

document.querySelectorAll(".btn-premium").forEach(button => {

    button.addEventListener("click", function (e) {

        const ripple = document.createElement("span");

        ripple.className = "ripple";

        const rect = this.getBoundingClientRect();

        ripple.style.left = `${e.clientX - rect.left}px`;

        ripple.style.top = `${e.clientY - rect.top}px`;

        this.appendChild(ripple);

        setTimeout(() => {

            ripple.remove();

        }, 600);

    });

});

/* =====================================================
   IMAGE REVEAL
===================================================== */

document.querySelectorAll(".product-img").forEach(img => {

    img.addEventListener("load", () => {

        img.classList.add("loaded");

    });

});

/* =====================================================
   LAZY LOADING
===================================================== */

const lazyImages = document.querySelectorAll("img[data-src]");

const lazyObserver = new IntersectionObserver((entries, observer) => {

    entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        const img = entry.target;

        img.src = img.dataset.src;

        img.onload = () => img.classList.add("loaded");

        observer.unobserve(img);

    });

});

lazyImages.forEach(image => {

    lazyObserver.observe(image);

});

/* =====================================================
   END
===================================================== */