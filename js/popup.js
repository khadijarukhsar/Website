// js/popup.js

document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('note-modal');
    
    // Only run if we are on a page with the modal
    if (!modalOverlay) return;
    
    const closeBtn = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    
    // Populate modal content from config
    if (modalTitle) modalTitle.textContent = SITE_CONFIG.friendNoteTitle;
    if (modalBody) modalBody.textContent = SITE_CONFIG.friendNoteBody;

    // Check localStorage
    const hasSeenPopup = localStorage.getItem('hasSeenFriendNote');
    
    if (!hasSeenPopup) {
        // Show popup with a small delay for a smooth, calm entrance
        setTimeout(() => {
            modalOverlay.classList.add('active');
            
            // Manage focus for accessibility
            if(closeBtn) closeBtn.focus();
        }, 800);
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
            localStorage.setItem('hasSeenFriendNote', 'true');
        });
    }

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            modalOverlay.classList.remove('active');
            localStorage.setItem('hasSeenFriendNote', 'true');
        }
    });
});
