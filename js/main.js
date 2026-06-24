// js/main.js

let skipTyping = false;
let currentTypingSession = 0;

function typeStringWithHTML(targetEl, string, session, onComplete) {
    let i = 0;
    targetEl.innerHTML = '';
    
    function typeChar() {
        if (session !== currentTypingSession) return; // Abort if we navigated away

        if (skipTyping) {
            targetEl.innerHTML = string;
            if (onComplete) onComplete();
            return;
        }

        if (i < string.length) {
            if (string.charAt(i) === '<') {
                // skip to end of HTML tag
                let tagEnd = string.indexOf('>', i);
                if (tagEnd !== -1) {
                    targetEl.innerHTML = string.substring(0, tagEnd + 1) + '<span class="cursor">|</span>';
                    i = tagEnd + 1;
                }
            } else {
                targetEl.innerHTML = string.substring(0, i + 1) + '<span class="cursor">|</span>';
                i++;
            }
            setTimeout(typeChar, 15 + Math.random() * 20); // Fast typing speed
        } else {
            targetEl.innerHTML = string; // Remove cursor
            if (onComplete) onComplete();
        }
    }
    typeChar();
}

function startTypewriterSequence(elements, textContents, skipBtn) {
    currentTypingSession++;
    let session = currentTypingSession;
    let currentElIndex = 0;

    function typeNextElement() {
        if (session !== currentTypingSession) return;

        if (currentElIndex < elements.length) {
            typeStringWithHTML(elements[currentElIndex], textContents[currentElIndex], session, () => {
                currentElIndex++;
                typeNextElement();
            });
            // Scroll element into view smoothly if it's a long article
            if (currentElIndex > 0) {
                elements[currentElIndex - 1].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        } else {
            if (skipBtn) skipBtn.style.display = 'none';
        }
    }
    typeNextElement();
}

function initPage(overrideUrl = null) {
    skipTyping = false;

    // Inject Configuration Data
    if (typeof SITE_CONFIG !== 'undefined') {
        document.querySelectorAll('.insert-author-name').forEach(el => {
            el.textContent = SITE_CONFIG.authorName;
        });
        
        document.querySelectorAll('.insert-site-title').forEach(el => {
            el.textContent = SITE_CONFIG.siteTitle;
        });

        if (document.title.includes('{{AUTHOR_NAME}}')) {
            document.title = document.title.replace("{{AUTHOR_NAME}}", SITE_CONFIG.authorName);
        } else if (!document.title.startsWith(SITE_CONFIG.authorName)) {
            document.title = `${SITE_CONFIG.authorName} - ${document.title}`;
        }
    }

    // 1. If we are on index.html, update the Begin Reading link
    const beginReadingLink = document.getElementById('begin-reading-link');
    if (beginReadingLink && typeof WRITINGS_LIST !== 'undefined' && WRITINGS_LIST.length > 0) {
        beginReadingLink.href = `writings/${WRITINGS_LIST[0].file}`;
    }

    // 2. If we are on writings.html, populate all writings
    const allWritingsContainer = document.getElementById('full-writing-list');
    if (allWritingsContainer && typeof WRITINGS_LIST !== 'undefined') {
        allWritingsContainer.innerHTML = '';
        
        // Add Total Archive Banner
        const totalWritings = WRITINGS_LIST.length;
        const statsBanner = document.createElement('div');
        statsBanner.className = 'archive-stats';
        statsBanner.innerHTML = `Total Archive: ${totalWritings} Published Writings`;
        allWritingsContainer.appendChild(statsBanner);

        WRITINGS_LIST.forEach(writing => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="writings/${writing.file}">
                    <span class="title">${writing.title}</span>
                </a>
            `;
            allWritingsContainer.appendChild(li);
        });
    }

    // 3. If we are on an individual writing page, update Next/Prev links
    const writingNav = document.getElementById('dynamic-writing-nav');
    
    if (writingNav && typeof WRITINGS_LIST !== 'undefined') {
        const pathStr = overrideUrl || window.location.pathname;
        const pathArray = pathStr.split('/');
        // Decode the URL and strip any query parameters or hash fragments
        const currentFile = decodeURIComponent(pathArray[pathArray.length - 1].split('?')[0].split('#')[0]); 
        
        // Match the filename robustly (handles exact match, fully decoded match, or lowercased fallback)
        const currentIndex = WRITINGS_LIST.findIndex(w => {
            const decodedW = decodeURIComponent(w.file);
            return w.file === currentFile || decodedW === currentFile || w.file.toLowerCase() === currentFile.toLowerCase();
        });
        
        if (currentIndex !== -1) {
            let prevLinkHTML = `<span style="visibility: hidden; width: 80px;">Empty</span>`;
            if (currentIndex > 0) {
                const prevLinkPath = WRITINGS_LIST[currentIndex - 1].file;
                prevLinkHTML = `<a href="${prevLinkPath}" id="prev-btn">&larr; Previous</a>`;
            }

            let nextLinkHTML = `<span style="visibility: hidden; width: 80px; text-align: right;">Empty</span>`;
            if (currentIndex < WRITINGS_LIST.length - 1) {
                const nextLinkPath = WRITINGS_LIST[currentIndex + 1].file;
                nextLinkHTML = `<a href="${nextLinkPath}" id="next-btn">Next &rarr;</a>`;
            }

            // Adjust relative paths depending on if we are in writings/ folder
            const inWritingsFolder = window.location.pathname.includes('/writings/');
            const indexPath = inWritingsFolder ? "../writings.html" : "writings.html";

            writingNav.innerHTML = `
                ${prevLinkHTML}
                <a href="${indexPath}">All Writings</a>
                ${nextLinkHTML}
            `;
            
            const pageTitleEl = document.querySelector('.writing-title');
            const pageMetaEl = document.querySelector('.writing-meta');
            if (pageTitleEl) pageTitleEl.textContent = WRITINGS_LIST[currentIndex].title;

            if (pageMetaEl) {
                const contentDiv = document.querySelector('.writing-content');
                let wordCount = 0;
                let readingTime = 1;
                let paragraphCount = 0;
                let richness = 0;
                
                if (contentDiv) {
                    const fullText = contentDiv.textContent.trim();
                    const wordsArray = fullText.split(/\s+/).filter(word => word.length > 0);
                    wordCount = wordsArray.length;
                    readingTime = Math.max(1, Math.ceil(wordCount / 200));
                    
                    // Paragraphs (splitting by double newline)
                    paragraphCount = fullText.split(/\n\s*\n/).filter(p => p.trim() !== '').length;
                    
                    // Vocabulary Richness (Unique words)
                    // Remove punctuation and lowercase everything for accurate matching
                    const cleanWordsArray = fullText.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 0);
                    const uniqueWords = new Set(cleanWordsArray).size;
                    richness = wordCount > 0 ? Math.round((uniqueWords / cleanWordsArray.length) * 100) : 0;
                }
                
                // Construct top meta
                pageMetaEl.innerHTML = `A ${readingTime}-minute read.`;
                
                // Construct bottom stats
                // First, remove any existing bottom stats to prevent duplicates on SPA navigation
                const existingStats = document.querySelector('.geeky-stats');
                if (existingStats) existingStats.remove();
                
                const bottomStats = document.createElement('div');
                bottomStats.className = 'geeky-stats';
                bottomStats.innerHTML = `
                    <div class="stat-item" aria-label="${wordCount.toLocaleString()} Words.">
                        <span class="stat-value" aria-hidden="true">${wordCount.toLocaleString()}</span>
                        <span class="stat-label" aria-hidden="true">Words</span>
                    </div>
                    <div class="stat-item" aria-label="${paragraphCount} Paragraphs.">
                        <span class="stat-value" aria-hidden="true">${paragraphCount}</span>
                        <span class="stat-label" aria-hidden="true">Paragraphs</span>
                    </div>
                    <div class="stat-item" aria-label="${richness}% Unique Vocabulary.">
                        <span class="stat-value" aria-hidden="true">${richness}%</span>
                        <span class="stat-label" aria-hidden="true">Vocabulary</span>
                    </div>
                `;
                
                // Insert after writing-content
                if (contentDiv && contentDiv.parentNode) {
                    contentDiv.parentNode.insertBefore(bottomStats, contentDiv.nextSibling);
                }
            }
            document.title = `${SITE_CONFIG.authorName} - ${WRITINGS_LIST[currentIndex].title}`;
        } else {
            // Absolute bulletproof fallback: if the file somehow isn't in WRITINGS_LIST, 
            // still destroy the placeholder text using the filename.
            const pageTitleEl = document.querySelector('.writing-title');
            if (pageTitleEl) pageTitleEl.textContent = currentFile.replace('.html', '');
        }

        // Auto-paragraphing and Typewriter Effect
        const contentDiv = document.querySelector('.writing-content');
        if (contentDiv) {
            const rawText = contentDiv.innerHTML;
            
            if (!rawText.includes('<p>')) {
                const text = rawText.trim();
                if (text) {
                    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim() !== '');
                    contentDiv.innerHTML = ''; 
                    
                    const elementsToType = [];
                    const textsToType = [];

                    paragraphs.forEach(pText => {
                        const trimmedText = pText.trim();
                        let isQuote = false;
                        let pContent = trimmedText;

                        if (trimmedText.startsWith('>')) {
                            isQuote = true;
                            pContent = trimmedText.substring(1).trim();
                        } else if (trimmedText.startsWith('&gt;')) {
                            isQuote = true;
                            pContent = trimmedText.substring(4).trim();
                        }

                        if (isQuote) {
                            const blockquote = document.createElement('blockquote');
                            const p = document.createElement('p');
                            blockquote.appendChild(p);
                            contentDiv.appendChild(blockquote);
                            
                            elementsToType.push(p);
                            textsToType.push(pContent);
                        } else {
                            const p = document.createElement('p');
                            contentDiv.appendChild(p);
                            
                            elementsToType.push(p);
                            textsToType.push(trimmedText);
                        }
                    });

                    // Add Skip Button
                    const skipBtn = document.createElement('button');
                    skipBtn.id = 'skip-btn';
                    skipBtn.textContent = 'Skip Animation';
                    skipBtn.onclick = () => { skipTyping = true; skipBtn.style.display = 'none'; };
                    contentDiv.appendChild(skipBtn);

                    // Check if animations should be skipped (user preference or already seen)
                    const animState = localStorage.getItem('animations-state') || 'once';
                    const hasSeenTypewriter = sessionStorage.getItem('hasSeenTypewriter') === 'true';

                    if (animState === 'off') {
                        skipTyping = true;
                        skipBtn.style.display = 'none';
                    } else if (animState === 'once' && hasSeenTypewriter) {
                        skipTyping = true;
                        skipBtn.style.display = 'none';
                    } else {
                        // For 'always' or ('once' + first time)
                        sessionStorage.setItem('hasSeenTypewriter', 'true');
                    }

                    // Start effect
                    startTypewriterSequence(elementsToType, textsToType, skipBtn);
                }
            }
        }
    }
    
    // Set Current Year centrally
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    document.body.classList.add('js-loaded');
}

// -----------------------------------------
// SPA Router & Global Events (Run Once)
// -----------------------------------------
(function bootstrap() {
    // Welcome Gift Popup Logic
    const modal = document.getElementById('note-modal');
    if (modal && typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.friendNoteBody) {
        if (!localStorage.getItem('hasSeenGiftPopup')) {
            document.getElementById('modal-title').textContent = SITE_CONFIG.friendNoteTitle;
            document.getElementById('modal-body').textContent = SITE_CONFIG.friendNoteBody;
            
            // Short delay to allow CSS transitions to initialize
            setTimeout(() => modal.classList.add('active'), 200);
            
            document.getElementById('close-modal').addEventListener('click', () => {
                modal.classList.remove('active');
                localStorage.setItem('hasSeenGiftPopup', 'true');
            });
        } else {
            // Remove from DOM entirely if already seen to keep it clean
            modal.remove();
        }
    }

    // Inject GoatCounter Analytics dynamically on first load
    if (typeof SITE_CONFIG !== 'undefined' && SITE_CONFIG.goatCounterUrl) {
        const gcScript = document.createElement('script');
        gcScript.dataset.goatcounter = SITE_CONFIG.goatCounterUrl;
        gcScript.async = true;
        gcScript.src = "https://gc.zgo.at/count.js";
        document.head.appendChild(gcScript);
    }

    // Single Page Application Navigation
    async function navigateTo(url, isPopState = false) {
        try {
            const response = await fetch(url);
            const htmlText = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            
            const newMain = doc.querySelector('main');
            const newTitle = doc.querySelector('title').textContent;
            
            if (newMain) {
                const updateDOM = () => {
                    document.body.classList.remove('js-loaded'); // Prevent FOUC during SPA transition
                    
                    // Add tabindex so we can programmatically focus it for screen readers
                    newMain.setAttribute('tabindex', '-1');
                    // Remove default outline when focused via script
                    newMain.style.outline = 'none';
                    
                    document.querySelector('main').replaceWith(newMain);
                    document.title = newTitle;
                    
                    // Update Navigation aria-current
                    document.querySelectorAll('nav a').forEach(navLink => {
                        navLink.removeAttribute('aria-current');
                        // Extremely robust matching for the active link
                        if (navLink.href === url || url.includes(navLink.getAttribute('href'))) {
                            navLink.setAttribute('aria-current', 'page');
                        }
                    });
                    
                    try {
                        if (!isPopState) history.pushState({}, '', url);
                    } catch (e) {
                        console.warn("history.pushState blocked by browser (typical for local file:// testing).", e);
                    }
                    
                    window.scrollTo(0, 0); // scroll to top
                    initPage(url); // pass the new URL explicitly in case pushState failed
                    
                    // Shift screen reader focus to the new content
                    newMain.focus();

                    // Track SPA navigation in GoatCounter
                    if (window.goatcounter && window.goatcounter.count) {
                        window.goatcounter.count({
                            path: location.pathname + location.search + location.hash,
                            title: newTitle
                        });
                    }
                };

                if (document.startViewTransition) {
                    document.startViewTransition(updateDOM);
                } else {
                    updateDOM();
                }
            } else {
                window.location = url;
            }
        } catch(err) {
            window.location = url; // Fallback to hard reload
        }
    }

    document.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        // Ignore external links or empty links
        if (!href || href.startsWith('http') || href.startsWith('#')) return;

        // Ignore links meant to open in a new tab
        if (link.getAttribute('target') === '_blank') return;

        // Ensure we don't intercept middle-clicks or ctrl-clicks
        if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey) return;

        e.preventDefault();
        navigateTo(link.href);
    });

    window.addEventListener('popstate', () => {
        navigateTo(window.location.href, true);
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowRight') {
            const nextBtn = document.getElementById('next-btn');
            if (nextBtn) {
                e.preventDefault();
                nextBtn.click(); // trigger SPA router
            }
        } else if (e.key === 'ArrowLeft') {
            const prevBtn = document.getElementById('prev-btn');
            if (prevBtn) {
                e.preventDefault();
                prevBtn.click();
            }
        }
    });

    // Dark Mode / Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        const currentTheme = localStorage.getItem('site-theme');
        if (currentTheme === 'dark') {
            document.body.classList.add('dark-theme');
            themeToggleBtn.textContent = 'Lighten';
            themeToggleBtn.setAttribute('aria-pressed', 'true');
            themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
        } else {
            themeToggleBtn.setAttribute('aria-pressed', 'false');
            themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
        }

        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            
            themeToggleBtn.textContent = isDark ? 'Lighten' : 'Dim';
            themeToggleBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            themeToggleBtn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
            
            localStorage.setItem('site-theme', isDark ? 'dark' : 'light');
        });
    }

    // Inject Animation Toggle dynamically next to Theme Toggle
    const themeToggleBtnEl = document.getElementById('theme-toggle');
    if (themeToggleBtnEl && !document.getElementById('anim-toggle')) {
        const animBtn = document.createElement('button');
        animBtn.id = 'anim-toggle';
        animBtn.className = 'theme-toggle-btn'; // reuse theme toggle styling
        
        const states = ['once', 'always', 'off'];
        const stateLabels = {
            'once': 'Anim: ONCE',
            'always': 'Anim: ALWAYS',
            'off': 'Anim: OFF'
        };

        let currentState = localStorage.getItem('animations-state') || 'once';
        
        // Migrate old boolean value if present
        if (localStorage.getItem('animations-enabled') === 'false') {
            currentState = 'off';
            localStorage.removeItem('animations-enabled');
        } else if (localStorage.getItem('animations-enabled') === 'true') {
            currentState = 'once'; // Default back to once to prevent annoyance
            localStorage.removeItem('animations-enabled');
        }
        
        localStorage.setItem('animations-state', currentState);
        animBtn.textContent = stateLabels[currentState];
        
        animBtn.addEventListener('click', () => {
            let nextIndex = (states.indexOf(currentState) + 1) % states.length;
            currentState = states[nextIndex];
            localStorage.setItem('animations-state', currentState);
            
            document.querySelectorAll('#anim-toggle').forEach(b => {
                b.textContent = stateLabels[currentState];
            });
        });
        
        // Wrap both buttons in a flex container so they sit side-by-side neatly
        const toggleContainer = document.createElement('div');
        toggleContainer.style.display = 'flex';
        toggleContainer.style.gap = '10px';
        toggleContainer.style.justifyContent = 'center';
        
        themeToggleBtnEl.parentNode.insertBefore(toggleContainer, themeToggleBtnEl);
        toggleContainer.appendChild(animBtn);
        toggleContainer.appendChild(themeToggleBtnEl);
    }

    // Run initial page setup
    initPage();
})();
