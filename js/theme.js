// js/theme.js — Dark / Light tema
(function () {
    const KEY = 'kavrulmus_theme';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.body.classList.toggle('light-mode', theme === 'light');
        const btn = document.getElementById('theme-toggle');
        if (btn) btn.textContent = theme === 'light' ? '🌙' : '☀️';
    }

    function initTheme() {
        const saved = localStorage.getItem(KEY) || 'dark';
        applyTheme(saved);
    }

    document.addEventListener('DOMContentLoaded', () => {
        initTheme();
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            const next = document.body.classList.contains('light-mode') ? 'dark' : 'light';
            localStorage.setItem(KEY, next);
            applyTheme(next);
        });
    });

    window.KavrulmusTheme = { applyTheme, initTheme };
})();
