// js/head.js
// This script runs immediately before the page renders to prevent a white flash (FOUC) in dark mode.
(function() {
    if (localStorage.getItem('site-theme') === 'dark') {
        document.documentElement.classList.add('dark-theme');
    }
})();
