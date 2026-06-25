// js/head.js
// This script runs immediately before the page renders to prevent a white flash (FOUC) in dark mode.
(function() {
    const isDark = localStorage.getItem('site-theme') === 'dark';
    if (isDark) {
        document.documentElement.classList.add('dark-theme');
    }
    
    // Inject dynamic theme-color for mobile browser URL bars
    const meta = document.createElement('meta');
    meta.name = 'theme-color';
    meta.content = isDark ? '#1a1a1a' : '#ebe9df';
    document.head.appendChild(meta);
})();
