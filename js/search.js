// js/search.js

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    const productsGrid = document.getElementById('dynamic-products-grid');

    if (!searchInput || !productsGrid) return;

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const productCards = productsGrid.querySelectorAll('.product-card');

        productCards.forEach(card => {
            const title = card.querySelector('.product-title').innerText.toLowerCase();
            const type = card.querySelector('.product-type').innerText.toLowerCase();
            
            if (title.includes(searchTerm) || type.includes(searchTerm)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    });
});