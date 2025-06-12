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

    // NOUVELLE FONCTIONNALITÉ : Gestion du clic sur l'icône "nouvelle discussion"
    const newChatIcon = document.getElementById('newChatIcon');
    const sidebarContainer = document.querySelector('#sidebarChats');
    
    console.log("Icône nouvelle discussion:", newChatIcon);
    console.log("Sidebar container:", sidebarContainer);
    
    if (newChatIcon && sidebarContainer) {
        newChatIcon.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log("Clic sur l'icône nouvelle discussion");
            
            // Remplacer le contenu de la sidebar par la page nouvelle discussion
            sidebarContainer.innerHTML = createNewChatInterface();
            
            // Ajouter les event listeners pour la nouvelle interface
            setupNewChatInterface();
        });
    } else {
        console.error("Icône nouvelle discussion ou sidebar container non trouvé !");
    }

    // FONCTIONNALITÉ EXISTANTE : Gestion des clics sur les chats
    const chatItems = document.querySelectorAll('.flex.items-center.p-3.hover\\:bg-gray-700.cursor-pointer.border-gray-600');
    const mainContent = document.querySelector('.flex-1.bg-gray-800.flex.items-center.justify-center');

    console.log("Chats trouvés:", chatItems.length);
    console.log("Zone principale:", mainContent);

    if (chatItems.length > 0 && mainContent) {
        chatItems.forEach((chatItem, index) => {
            chatItem.addEventListener('click', () => {
                console.log(`Clic sur le chat ${index + 1}`);
                
                // Récupérer les informations du chat cliqué
                const chatName = chatItem.querySelector('.text-white.font-medium.text-sm.truncate')?.textContent || 'Contact';
                const chatAvatar = chatItem.querySelector('img')?.src || null;
                const chatBgColor = chatItem.querySelector('.rounded-full')?.classList.toString().match(/bg-\w+-\d+/)?.[0] || 'bg-gray-600';
                
                // Remplacer le contenu principal par la zone de chat
                mainContent.innerHTML = createChatInterface(chatName, chatAvatar, chatBgColor);
                
                // Ajouter les event listeners pour la nouvelle interface
                setupChatInterface();
            });
        });
    }

    function createNewChatInterface() {
        return `
            <!-- Header -->
            <div class="flex items-center p-4 bg-gray-800">
                <i class="fas fa-arrow-left text-gray-300 text-xl mr-4 cursor-pointer" id="backToChats"></i>
                <h1 class="text-lg font-medium text-gray-200">Nouvelle discussion</h1>
            </div>

            <!-- Search Bar -->
            <div class="px-4 py-3">
                <div class="relative">
                    <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
                    <input type="text" id="contactSearch" placeholder="Rechercher un nom ou un numéro"
                            class="w-full bg-gray-800 text-gray-300 pl-10 pr-4 py-2 rounded-lg placeholder-gray-500 text-sm border-none focus:outline-none focus:ring-1 focus:ring-green-500">
                </div>
            </div>

            <!-- Action Items -->
            <div class="px-4">
                <!-- Nouveau groupe -->
                <div class="flex items-center py-3 cursor-pointer hover:bg-gray-800 rounded-lg px-2" id="newGroup">
                    <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                        <i class="fas fa-users text-white text-sm"></i>
                    </div>
                    <span class="text-gray-200 text-base">Nouveau groupe</span>
                </div>

                <!-- Nouveau contact -->
                <div class="flex items-center py-3 cursor-pointer hover:bg-gray-800 rounded-lg px-2" id="newContact">
                    <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                        <i class="fas fa-user-plus text-white text-sm"></i>
                    </div>
                    <span class="text-gray-200 text-base">Nouveau contact</span>
                </div>

                <!-- Nouvelle communauté -->
                <div class="flex items-center py-3 cursor-pointer hover:bg-gray-800 rounded-lg px-2" id="newCommunity">
                    <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-4">
                        <i class="fas fa-users text-white text-sm"></i>
                    </div>
                    <span class="text-gray-200 text-base">Nouvelle communauté</span>
                </div>
            </div>

            <!-- Contacts Section -->
            <div class="px-4 mt-6 flex-1 overflow-y-auto">
                <h2 class="text-gray-400 text-sm font-medium mb-4">Contacts sur WhatsApp</h2>
                
                <!-- Contact Item - Vous -->
                <div class="flex items-center py-2 cursor-pointer hover:bg-gray-800 rounded-lg px-2" data-contact="BACHIR IIR💻🏠 (vous)">
                    <div class="w-10 h-10 rounded-full overflow-hidden mr-4">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face"
                              alt="Profile" class="w-full h-full object-cover">
                    </div>
                    <div class="flex-1">
                        <div class="text-gray-200 text-base">BACHIR IIR💻🏠 (vous)</div>
                        <div class="text-gray-400 text-sm">Envoyez-vous un message</div>
                    </div>
                </div>

                <!-- Contacts supplémentaires -->
                <div class="flex items-center py-2 cursor-pointer hover:bg-gray-800 rounded-lg px-2" data-contact="Fatoumata Ba">
                    <div class="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center mr-4">
                        <i class="fas fa-user text-white text-sm"></i>
                    </div>
                    <div class="flex-1">
                        <div class="text-gray-200 text-base">Fatoumata Ba</div>
                        <div class="text-gray-400 text-sm">+221 77 123 45 67</div>
                    </div>
                </div>

                <div class="flex items-center py-2 cursor-pointer hover:bg-gray-800 rounded-lg px-2" data-contact="LeX🍻⚫🔥">
                    <div class="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-4">
                        <i class="fas fa-user text-white text-sm"></i>
                    </div>
                    <div class="flex-1">
                        <div class="text-gray-200 text-base">LeX🍻⚫🔥</div>
                        <div class="text-gray-400 text-sm">+221 77 987 65 43</div>
                    </div>
                </div>
            </div>

            <!-- Bottom Section -->
            <div class="px-4 py-4">
                <div class="text-gray-500 text-sm">#</div>
            </div>
        `;
    }

    function setupNewChatInterface() {
        // Bouton retour
        const backButton = document.getElementById('backToChats');
        if (backButton) {
            backButton.addEventListener('click', () => {
                console.log("Retour aux chats");
                // Recharger la page pour revenir à l'état initial
                window.location.reload();
            });
        }

        // Recherche de contacts
        const searchInput = document.getElementById('contactSearch');
        const contactItems = document.querySelectorAll('[data-contact]');
        
        if (searchInput && contactItems.length > 0) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                
                contactItems.forEach(item => {
                    const contactName = item.getAttribute('data-contact').toLowerCase();
                    if (contactName.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        }

        // Clic sur un contact pour démarrer une conversation
        contactItems.forEach(item => {
            item.addEventListener('click', () => {
                const contactName = item.getAttribute('data-contact');
                const contactAvatar = item.querySelector('img')?.src || null;
                const contactBgColor = item.querySelector('.rounded-full')?.classList.toString().match(/bg-\w+-\d+/)?.[0] || 'bg-gray-600';
                
                console.log(`Démarrer conversation avec: ${contactName}`);
                
                // Revenir à la vue des chats et ouvrir la conversation
                window.location.reload();
                
                // Note: Dans une vraie application, vous pourriez vouloir :
                // 1. Sauvegarder l'état dans localStorage
                // 2. Utiliser un système de routing
                // 3. Gérer l'état de l'application de manière plus sophistiquée
            });
        });

        // Actions pour nouveau groupe, contact, communauté
        const newGroupBtn = document.getElementById('newGroup');
        const newContactBtn = document.getElementById('newContact');
        const newCommunityBtn = document.getElementById('newCommunity');

        if (newGroupBtn) {
            newGroupBtn.addEventListener('click', () => {
                alert('Fonctionnalité "Nouveau groupe" à implémenter');
            });
        }

        if (newContactBtn) {
            newContactBtn.addEventListener('click', () => {
                alert('Fonctionnalité "Nouveau contact" à implémenter');
            });
        }

        if (newCommunityBtn) {
            newCommunityBtn.addEventListener('click', () => {
                alert('Fonctionnalité "Nouvelle communauté" à implémenter');
            });
        }
    }

    function createChatInterface(contactName, avatarSrc, bgColor) {
        return `
            <div class="flex-1 flex flex-col h-full">
                <!-- Chat Header -->
                <div class="bg-gray-800 p-3 flex items-center justify-between border-b border-gray-700">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 ${bgColor} rounded-full flex items-center justify-center overflow-hidden">
                            ${avatarSrc ? 
                                `<img src="${avatarSrc}" alt="Profile" class="w-full h-full object-cover">` : 
                                `<i class="fas fa-user text-gray-400"></i>`
                            }
                        </div>
                        <div>
                            <div class="text-white text-sm font-medium">${contactName}</div>
                            <div class="text-gray-400 text-xs">cliquez ici pour les informations du contact</div>
                        </div>
                    </div>
                    <div class="flex space-x-2">
                        <div class="p-2 rounded-full hover:bg-gray-600 cursor-pointer">
                            <i class="fas fa-search text-gray-400 text-sm"></i>
                        </div>
                        <div class="p-2 rounded-full hover:bg-gray-600 cursor-pointer">
                            <i class="fas fa-ellipsis-v text-gray-400 text-sm"></i>
                        </div>
                    </div>
                </div>

                <!-- Messages Area -->
                <div class="flex-1 bg-gray-900 overflow-y-auto relative">
                    <div class="p-6 space-y-4">
                        <!-- Day Separator -->
                        <div class="flex justify-center my-6">
                            <div class="bg-gray-800 bg-opacity-80 text-gray-400 text-xs px-3 py-1.5 rounded-xl">Aujourd'hui</div>
                        </div>

                        <!-- Message d'exemple -->
                        <div class="flex justify-start">
                            <div class="max-w-xs">
                                <div class="bg-gray-700 rounded-lg p-3 relative">
                                    <div class="absolute top-0 -left-2 w-0 h-0 border-r-8 border-r-gray-700 border-t-8 border-t-transparent"></div>
                                    <div class="text-white text-sm">Salut ! Comment ça va ?</div>
                                </div>
                                <div class="flex justify-start items-center mt-1">
                                    <span class="text-gray-500 text-xs">10:30</span>
                                </div>
                            </div>
                        </div>

                        <!-- Message envoyé -->
                        <div class="flex justify-end">
                            <div class="max-w-xs">
                                <div class="bg-green-600 rounded-lg p-3 relative">
                                    <div class="absolute top-0 -right-2 w-0 h-0 border-l-8 border-l-green-600 border-t-8 border-t-transparent"></div>
                                    <div class="text-white text-sm">Salut ! Ça va bien, merci ! Et toi ?</div>
                                </div>
                                <div class="flex justify-end items-center mt-1">
                                    <span class="text-gray-500 text-xs">10:32</span>
                                    <i class="fas fa-check-double text-blue-400 text-sm ml-1"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Message Input Area -->
                <div class="bg-gray-800 p-4 border-t border-gray-700">
                    <div class="flex items-center space-x-3">
                        <div class="p-2 rounded-full hover:bg-gray-600 cursor-pointer">
                            <i class="fas fa-plus text-gray-400 text-lg"></i>
                        </div>
                        <div class="flex-1 relative">
                            <div class="bg-gray-700 rounded-lg px-4 py-3 flex items-center">
                                <input 
                                    type="text" 
                                    id="messageInput"
                                    placeholder="Entrez un message"
                                    class="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-400"
                                >
                                <i class="fas fa-face-smile text-gray-400 text-lg cursor-pointer hover:text-gray-300 ml-3"></i>
                            </div>
                        </div>
                        <div class="p-2 rounded-full hover:bg-gray-600 cursor-pointer" id="sendButton">
                            <i class="fas fa-paper-plane text-gray-400 text-lg"></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function setupChatInterface() {
        const messageInput = document.getElementById('messageInput');
        const sendButton = document.getElementById('sendButton');
        const messagesArea = document.querySelector('.flex-1.bg-gray-900.overflow-y-auto .p-6.space-y-4');

        if (messageInput && sendButton && messagesArea) {
            function sendMessage() {
                const messageText = messageInput.value.trim();
                if (messageText) {
                    // Créer le nouveau message
                    const messageElement = document.createElement('div');
                    messageElement.className = 'flex justify-end';
                    messageElement.innerHTML = `
                        <div class="max-w-xs">
                            <div class="bg-green-600 rounded-lg p-3 relative">
                                <div class="absolute top-0 -right-2 w-0 h-0 border-l-8 border-l-green-600 border-t-8 border-t-transparent"></div>
                                <div class="text-white text-sm">${messageText}</div>
                            </div>
                            <div class="flex justify-end items-center mt-1">
                                <span class="text-gray-500 text-xs">${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</span>
                                <i class="fas fa-check text-gray-400 text-sm ml-1"></i>
                            </div>
                        </div>
                    `;
                    
                    // Ajouter le message à la zone de messages
                    messagesArea.appendChild(messageElement);
                    
                    // Vider l'input
                    messageInput.value = '';
                    
                    // Scroll vers le bas
                    messagesArea.parentElement.scrollTop = messagesArea.parentElement.scrollHeight;
                }
            }

            // Event listener pour le bouton d'envoi
            sendButton.addEventListener('click', sendMessage);

            // Event listener pour la touche Entrée
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
        }
    }
});