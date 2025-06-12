import ChatManager from './chatManager.js';

console.log("chat.js chargé !");

let chatManager = null;

document.addEventListener('DOMContentLoaded', async function() {
    console.log("DOM entièrement chargé !");
    
    // Initialiser le gestionnaire de chat
    try {
        chatManager = new ChatManager();
        await chatManager.init();
        console.log("ChatManager initialisé avec succès");
    } catch (error) {
        console.error("Erreur lors de l'initialisation du ChatManager:", error);
    }

    // Gestion des éléments de l'interface
    const settingsIcon = document.getElementById('settingsIcon');
    const sidebarChats = document.getElementById('sidebarChats');
    const sidebarSettings = document.getElementById('sidebarSettings');
    const sidebarChatIcon = document.getElementById('sidebarChatIcon');

    console.log("settingsIcon:", settingsIcon);
    console.log("sidebarChats:", sidebarChats);
    console.log("sidebarSettings:", sidebarSettings);
    console.log("sidebarChatIcon:", sidebarChatIcon);

    // Navigation entre les panneaux
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

    // Gestion du menu contextuel
    setupContextMenu();
    
    // Gestion de la déconnexion
    setupLogoutHandlers();
    
    // Gestion de la recherche
    setupSearchFunctionality();
    
    // Gestion des filtres
    setupFilterButtons();
    
    // Gestion de la bannière de notification
    setupNotificationBanner();
});

function setupContextMenu() {
    const menuBtn = document.getElementById('menuBtn');
    const contextMenu = document.getElementById('contextMenu');

    if (menuBtn && contextMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            contextMenu.classList.toggle('hidden');
        });

        // Fermer le menu si clic en dehors
        document.addEventListener('click', (e) => {
            if (!contextMenu.classList.contains('hidden')) {
                if (!contextMenu.contains(e.target) && e.target !== menuBtn) {
                    contextMenu.classList.add('hidden');
                }
            }
        });
    }
}

function setupLogoutHandlers() {
    const logoutBtn = document.getElementById('logoutBtn');
    const settingsLogout = document.getElementById('settingsLogout');

    [logoutBtn, settingsLogout].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
                    // Nettoyer les ressources
                    if (chatManager) {
                        chatManager.destroy();
                    }
                    // Rediriger vers la page de connexion
                    window.location.href = '/';
                }
            });
        }
    });
}

function setupSearchFunctionality() {
    const searchInput = document.querySelector('input[placeholder="Rechercher ou démarrer une discussion"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const chatItems = document.querySelectorAll('.chat-item');
            
            chatItems.forEach(item => {
                const userName = item.querySelector('.text-white.font-medium')?.textContent.toLowerCase() || '';
                const lastMessage = item.querySelector('.text-gray-400.text-sm.truncate')?.textContent.toLowerCase() || '';
                
                if (userName.includes(searchTerm) || lastMessage.includes(searchTerm)) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
}

function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('button[class*="px-4 py-2 rounded-full"]');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Retirer la classe active de tous les boutons
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-green-900', 'text-green-200');
                btn.classList.add('text-gray-400');
            });
            
            // Ajouter la classe active au bouton cliqué
            button.classList.add('bg-green-900', 'text-green-200');
            button.classList.remove('text-gray-400');
            
            // Logique de filtrage selon le texte du bouton
            const filterType = button.textContent.trim();
            filterChats(filterType);
        });
    });
}

function filterChats(filterType) {
    const chatItems = document.querySelectorAll('.chat-item');
    
    chatItems.forEach(item => {
        const unreadBadge = item.querySelector('.bg-green-500');
        const hasUnread = unreadBadge !== null;
        
        switch (filterType) {
            case 'Non lues':
                item.style.display = hasUnread ? 'flex' : 'none';
                break;
            case 'Favoris':
                // Logique pour les favoris (à implémenter selon vos besoins)
                item.style.display = 'none'; // Temporaire
                break;
            case 'Groupes':
                // Logique pour les groupes (à implémenter selon vos besoins)
                item.style.display = 'none'; // Temporaire
                break;
            case 'Toutes':
            default:
                item.style.display = 'flex';
                break;
        }
    });
}

function setupNotificationBanner() {
    const notificationBanner = document.querySelector('.bg-green-900.p-4.m-3');
    const closeNotificationBtn = notificationBanner?.querySelector('button');
    
    if (closeNotificationBtn) {
        closeNotificationBtn.addEventListener('click', () => {
            notificationBanner.style.opacity = '0';
            notificationBanner.style.transform = 'translateY(-10px)';
            setTimeout(() => {
                notificationBanner.remove();
            }, 300);
        });
    }

    // Activer les notifications de bureau
    const enableNotificationsBtn = notificationBanner?.querySelector('.cursor-pointer');
    if (enableNotificationsBtn) {
        enableNotificationsBtn.addEventListener('click', async () => {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    new Notification('WhatsApp Web', {
                        body: 'Les notifications sont maintenant activées !',
                        icon: '/favicon.ico'
                    });
                    
                    // Masquer la bannière après activation
                    notificationBanner.style.opacity = '0';
                    setTimeout(() => notificationBanner.remove(), 300);
                }
            }
        });
    }
}

// Gestion des raccourcis clavier globaux
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K pour la recherche
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Rechercher ou démarrer une discussion"]');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    // Ctrl/Cmd + N pour nouveau chat (placeholder)
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        console.log('Nouveau chat - fonctionnalité à implémenter');
    }
    
    // Ctrl/Cmd + Shift + M pour couper/activer le micro (placeholder)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        console.log('Toggle micro - fonctionnalité à implémenter');
    }
});

// Gestion de la visibilité de la page pour optimiser les performances
document.addEventListener('visibilitychange', () => {
    if (chatManager) {
        if (document.hidden) {
            console.log('Page cachée - réduction de la fréquence de polling');
            // Réduire la fréquence de vérification des messages
        } else {
            console.log('Page visible - reprise du polling normal');
            // Reprendre la fréquence normale
        }
    }
});

// Gestion de la fermeture de la page
window.addEventListener('beforeunload', () => {
    if (chatManager) {
        chatManager.destroy();
    }
});

// Export pour les tests
export { chatManager };