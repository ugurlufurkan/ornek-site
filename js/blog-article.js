// js/blog-article.js — Tekil blog makalesi
document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');
    const articles = window.BLOG_ARTICLES || {};
    const article = slug ? articles[slug] : null;

    const titleEl = document.getElementById('article-title');
    const metaEl = document.getElementById('article-meta');
    const imgEl = document.getElementById('article-image');
    const bodyEl = document.getElementById('article-body');
    const categoryEl = document.getElementById('article-category');
    const notFoundEl = document.getElementById('article-not-found');
    const contentEl = document.getElementById('article-content');

    if (!article) {
        if (contentEl) contentEl.style.display = 'none';
        if (notFoundEl) notFoundEl.style.display = 'block';
        document.title = 'Yazı Bulunamadı | Kavrulmuş';
        return;
    }

    document.title = `${article.title} | Kavrulmuş`;
    if (titleEl) titleEl.textContent = article.title;
    if (metaEl) metaEl.textContent = `📅 ${article.date} • ⏱️ ${article.readTime} okuma`;
    if (imgEl) { imgEl.src = article.image; imgEl.alt = article.title; }
    if (categoryEl) categoryEl.textContent = article.category;
    if (bodyEl) bodyEl.innerHTML = article.content;
});
