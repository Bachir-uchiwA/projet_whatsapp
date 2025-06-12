// JS principal pour la page chat (nécessaire pour éviter l'erreur MIME lors du déploiement Vercel)
// Ajoute ici ton code JS spécifique à la page chat si besoin.

console.log("chat.js chargé !");

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM entièrement chargé !");
    
    // Gestion navigation sidebar
    const settingsIcon = document.getElementById('settingsIcon');
    const sidebarChats = document.getElementById('sidebarChats');
    const sidebarSettings = document.getElementById('sidebarSettings');
    const sidebarChatIcon = document.getElementById('sidebarChatIcon');

    if (settingsIcon && sidebarChats && sidebarSettings) {
        settingsIcon.addEventListener('click', () => {
            console.log("Clic sur settingsIcon");
            sidebarChats.classList.add('hidden');
            sidebarSettings.classList.remove('hidden');
        });
    }
    
    if (sidebarChatIcon && sidebarChats && sidebarSettings) {
        sidebarChatIcon.addEventListener('click', () => {
            console.log("Clic sur sidebarChatIcon");
            sidebarSettings.classList.add('hidden');
            sidebarChats.classList.remove('hidden');
        });
    }

    // Gestion menu contextuel - VERSION AMÉLIORÉE
    const menuBtn = document.getElementById('menuBtn');
    const contextMenu = document.getElementById('contextMenu');

    console.log("menuBtn:", menuBtn);
    console.log("contextMenu:", contextMenu);

    if (menuBtn && contextMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Clic sur menuBtn - Toggle menu");
            
            // Toggle du menu
            const isHidden = contextMenu.classList.contains('hidden');
            if (isHidden) {
                contextMenu.classList.remove('hidden');
                console.log("Menu affiché");
            } else {
                contextMenu.classList.add('hidden');
                console.log("Menu caché");
            }
        });

        // Fermer le menu si clic en dehors
        document.addEventListener('click', (e) => {
            if (!contextMenu.classList.contains('hidden')) {
                // Si le clic n'est pas sur le menu ni sur le bouton
                if (!contextMenu.contains(e.target) && !menuBtn.contains(e.target)) {
                    contextMenu.classList.add('hidden');
                    console.log("Menu fermé (clic extérieur)");
                }
            }
        });

        // Gestion déconnexion depuis le menu contextuel
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                    window.location.href = '/';
                }
            });
        }
    } else {
        console.error("menuBtn ou contextMenu non trouvé !");
    }

    // Gestion déconnexion depuis les paramètres
    const settingsLogout = document.getElementById('settingsLogout');
    if (settingsLogout) {
        settingsLogout.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                window.location.href = '/';
            }
        });
    }
});

export {};