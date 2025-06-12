const apiUrl = import.meta.env.VITE_API_URL || '/api';

class ChatManager {
    constructor() {
        this.currentUser = null;
        this.currentChat = null;
        this.chats = [];
        this.users = [];
        this.messages = [];
        this.messagePollingInterval = null;
    }

    async init() {
        try {
            // Vérifier l'authentification
            const { checkAuth } = await import('./auth.js');
            const session = await checkAuth();
            if (!session) return;

            this.currentUser = session;
            console.log('Utilisateur connecté:', this.currentUser);
            
            await this.loadInitialData();
            this.setupEventListeners();
            this.startMessagePolling();
        } catch (error) {
            console.error('Erreur lors de l\'initialisation:', error);
        }
    }

    async loadInitialData() {
        try {
            // Charger les utilisateurs (comptes de connexion)
            const usersResponse = await fetch(`${apiUrl}/users`);
            const users = await usersResponse.json();

            // Créer des profils d'affichage enrichis
            this.users = users.map(user => ({
                ...user,
                name: this.getUserDisplayName(user.id),
                avatar: this.getUserAvatar(user.id),
                status: this.getUserStatus(user.id),
                lastSeen: this.getUserLastSeen(user.id),
                isOnline: this.getUserOnlineStatus(user.id)
            }));

            // Charger les chats de l'utilisateur connecté
            const chatsResponse = await fetch(`${apiUrl}/chats`);
            const allChats = await chatsResponse.json();
            this.chats = allChats.filter(chat => 
                chat.participants.includes(this.currentUser.userId)
            );

            // Charger tous les messages
            const messagesResponse = await fetch(`${apiUrl}/messages`);
            this.messages = await messagesResponse.json();

            console.log('Données chargées:', {
                users: this.users.length,
                chats: this.chats.length,
                messages: this.messages.length
            });

            this.renderChatList();
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        }
    }

    // Méthodes pour générer les profils d'affichage
    getUserDisplayName(userId) {
        const names = {
            '9c08': 'BACHIR IIR🇸🇳⚫ (vous)',
            '1981': 'Fatoumata Ba',
            'a3f2': 'LeX🍻⚫🔥',
            '5c8b': '❤️Lil Sis ❤️'
        };
        return names[userId] || `Utilisateur ${userId}`;
    }

    getUserAvatar(userId) {
        const avatars = {
            '9c08': 'https://randomuser.me/api/portraits/men/1.jpg',
            '1981': 'https://randomuser.me/api/portraits/women/2.jpg',
            'a3f2': 'https://randomuser.me/api/portraits/men/3.jpg',
            '5c8b': 'https://randomuser.me/api/portraits/women/4.jpg'
        };
        return avatars[userId] || 'https://randomuser.me/api/portraits/lego/1.jpg';
    }

    getUserStatus(userId) {
        const statuses = {
            '9c08': 'Salut ! J\'utilise WhatsApp.',
            '1981': 'Disponible 💚',
            'a3f2': 'Occupé 🔥',
            '5c8b': 'En réunion 📚'
        };
        return statuses[userId] || 'Salut ! J\'utilise WhatsApp.';
    }

    getUserLastSeen(userId) {
        const lastSeenTimes = {
            '9c08': new Date().toISOString(),
            '1981': '2024-01-15T16:45:00Z',
            'a3f2': '2024-01-15T16:25:00Z',
            '5c8b': '2024-01-15T16:43:00Z'
        };
        return lastSeenTimes[userId] || new Date().toISOString();
    }

    getUserOnlineStatus(userId) {
        const onlineStatuses = {
            '9c08': true,
            '1981': false,
            'a3f2': false,
            '5c8b': false
        };
        return onlineStatuses[userId] || false;
    }

    renderChatList() {
        const chatListContainer = document.querySelector('#sidebarChats .flex-1.overflow-y-auto');
        if (!chatListContainer) return;

        // Garder les éléments existants (Archives)
        const archiveElement = chatListContainer.querySelector('.px-10.py-3');
        
        // Vider le container mais garder les archives
        chatListContainer.innerHTML = '';
        if (archiveElement) {
            chatListContainer.appendChild(archiveElement);
        }

        // Trier les chats par dernier message
        const sortedChats = [...this.chats].sort((a, b) => {
            const timeA = new Date(a.lastMessage?.timestamp || a.createdAt);
            const timeB = new Date(b.lastMessage?.timestamp || b.createdAt);
            return timeB - timeA;
        });

        sortedChats.forEach(chat => {
            const otherUserId = chat.participants.find(id => id !== this.currentUser.userId);
            const otherUser = this.users.find(user => user.id === otherUserId);
            
            if (!otherUser) return;

            const chatElement = this.createChatElement(chat, otherUser);
            chatListContainer.appendChild(chatElement);
        });
    }

    createChatElement(chat, user) {
        const div = document.createElement('div');
        div.className = 'flex items-center p-3 hover:bg-gray-700 cursor-pointer border-gray-600 chat-item transition-colors duration-200';
        div.dataset.chatId = chat.id;
        div.dataset.userId = user.id;

        const lastMessageTime = chat.lastMessage ? 
            this.formatTime(chat.lastMessage.timestamp) : '';
        
        const unreadBadge = chat.unreadCount > 0 ? 
            `<div class="bg-green-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">${chat.unreadCount}</div>` : '';

        const onlineIndicator = user.isOnline ? 
            '<span class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></span>' : '';

        div.innerHTML = `
            <div class="relative w-12 h-12 rounded-full flex-shrink-0 mr-3 overflow-hidden">
                <img src="${user.avatar}" alt="${user.name}" class="w-full h-full object-cover">
                ${onlineIndicator}
            </div>
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                    <div class="text-white font-medium text-sm truncate">${user.name}</div>
                    <div class="text-gray-400 text-xs">${lastMessageTime}</div>
                </div>
                <div class="flex items-center justify-between mt-1">
                    <div class="text-gray-400 text-sm truncate">
                        ${chat.lastMessage ? this.formatLastMessage(chat.lastMessage) : 'Aucun message'}
                    </div>
                    ${unreadBadge}
                </div>
            </div>
        `;

        div.addEventListener('click', () => this.openChat(chat.id));
        return div;
    }

    async openChat(chatId) {
        try {
            this.currentChat = this.chats.find(chat => chat.id === chatId);
            if (!this.currentChat) return;

            const otherUserId = this.currentChat.participants.find(id => id !== this.currentUser.userId);
            const otherUser = this.users.find(user => user.id === otherUserId);
            
            if (!otherUser) return;

            console.log('Ouverture du chat:', chatId, 'avec', otherUser.name);

            // Masquer l'écran d'accueil et afficher le chat
            document.getElementById('noChatSelected').classList.add('hidden');
            document.getElementById('chatArea').classList.remove('hidden');

            // Mettre à jour l'en-tête du chat
            this.updateChatHeader(otherUser);

            // Charger et afficher les messages
            await this.loadChatMessages(chatId);

            // Marquer le chat comme actif
            this.markChatAsActive(chatId);

            // Marquer les messages comme lus
            await this.markMessagesAsRead(chatId);

        } catch (error) {
            console.error('Erreur lors de l\'ouverture du chat:', error);
        }
    }

    updateChatHeader(user) {
        document.getElementById('chatAvatar').src = user.avatar;
        document.getElementById('chatName').textContent = user.name;
        
        const statusText = user.isOnline ? 
            'En ligne' : 
            `Vu ${this.formatLastSeen(user.lastSeen)}`;
        
        document.getElementById('chatStatus').textContent = statusText;
        document.getElementById('chatStatus').className = user.isOnline ? 
            'text-green-400 text-sm' : 'text-gray-400 text-sm';
    }

    async loadChatMessages(chatId) {
        try {
            const chatMessages = this.messages.filter(msg => msg.chatId === chatId);
            chatMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            console.log(`Messages chargés pour le chat ${chatId}:`, chatMessages.length);
            this.renderMessages(chatMessages);
            this.scrollToBottom();
        } catch (error) {
            console.error('Erreur lors du chargement des messages:', error);
        }
    }

    renderMessages(messages) {
        const container = document.getElementById('messagesContainer');
        if (!container) {
            console.error('Container de messages non trouvé');
            return;
        }
        
        container.innerHTML = '';

        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            container.appendChild(messageElement);
        });
    }

    createMessageElement(message) {
        const isOwn = message.senderId === this.currentUser.userId;
        const sender = this.users.find(user => user.id === message.senderId);
        
        const div = document.createElement('div');
        div.className = `flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`;

        const messageTime = this.formatTime(message.timestamp);
        const statusIcon = isOwn ? this.getStatusIcon(message.status) : '';

        div.innerHTML = `
            <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                isOwn 
                    ? 'bg-green-500 text-white rounded-br-sm' 
                    : 'bg-gray-700 text-white rounded-bl-sm'
            }">
                ${message.type === 'audio' ? 
                    `<div class="flex items-center space-x-2">
                        <i class="fas fa-play text-sm cursor-pointer hover:text-gray-200"></i>
                        <div class="flex-1 h-1 bg-gray-300 rounded"></div>
                        <span class="text-xs">${message.content}</span>
                    </div>` :
                    `<p class="text-sm break-words">${message.content}</p>`
                }
                <div class="flex items-center justify-end mt-1 space-x-1">
                    <span class="text-xs opacity-70">${messageTime}</span>
                    ${statusIcon}
                </div>
            </div>
        `;

        return div;
    }

    getStatusIcon(status) {
        switch (status) {
            case 'sent':
                return '<i class="fas fa-check text-xs opacity-70"></i>';
            case 'delivered':
                return '<i class="fas fa-check-double text-xs opacity-70"></i>';
            case 'read':
                return '<i class="fas fa-check-double text-xs text-blue-400"></i>';
            default:
                return '<i class="fas fa-clock text-xs opacity-70"></i>';
        }
    }

    markChatAsActive(chatId) {
        // Retirer la classe active de tous les chats
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('bg-gray-700');
        });

        // Ajouter la classe active au chat sélectionné
        const activeChat = document.querySelector(`[data-chat-id="${chatId}"]`);
        if (activeChat) {
            activeChat.classList.add('bg-gray-700');
        }
    }

    async markMessagesAsRead(chatId) {
        try {
            const unreadMessages = this.messages.filter(msg => 
                msg.chatId === chatId && 
                msg.senderId !== this.currentUser.userId && 
                msg.status !== 'read'
            );

            for (const message of unreadMessages) {
                await fetch(`${apiUrl}/messages/${message.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'read' })
                });
                
                // Mettre à jour localement
                message.status = 'read';
            }

            // Mettre à jour le compteur non lu
            const chat = this.chats.find(c => c.id === chatId);
            if (chat && chat.unreadCount > 0) {
                chat.unreadCount = 0;
                
                // Mettre à jour sur le serveur
                await fetch(`${apiUrl}/chats/${chatId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ unreadCount: 0 })
                });
                
                this.renderChatList();
            }
        } catch (error) {
            console.error('Erreur lors du marquage des messages comme lus:', error);
        }
    }

    async sendMessage(content, type = 'text') {
        if (!this.currentChat || !content.trim()) return;

        try {
            const message = {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                chatId: this.currentChat.id,
                senderId: this.currentUser.userId,
                content: content.trim(),
                type: type,
                timestamp: new Date().toISOString(),
                status: 'sending'
            };

            console.log('Envoi du message:', message);

            // Ajouter le message localement pour un affichage immédiat
            this.messages.push(message);
            this.renderMessages(this.messages.filter(msg => msg.chatId === this.currentChat.id));
            this.scrollToBottom();

            // Envoyer au serveur
            const response = await fetch(`${apiUrl}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(message)
            });

            if (response.ok) {
                // Mettre à jour le statut
                message.status = 'sent';
                
                // Mettre à jour le dernier message du chat
                this.currentChat.lastMessage = {
                    id: message.id,
                    content: message.content,
                    senderId: message.senderId,
                    timestamp: message.timestamp,
                    type: message.type
                };

                // Mettre à jour le chat sur le serveur
                await fetch(`${apiUrl}/chats/${this.currentChat.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lastMessage: this.currentChat.lastMessage })
                });

                // Rafraîchir l'affichage
                this.renderChatList();
                this.renderMessages(this.messages.filter(msg => msg.chatId === this.currentChat.id));
                
                console.log('Message envoyé avec succès');
            } else {
                throw new Error('Erreur lors de l\'envoi du message');
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi du message:', error);
            // Marquer le message comme échoué
            const failedMessage = this.messages.find(msg => msg.id === message.id);
            if (failedMessage) {
                failedMessage.status = 'failed';
                this.renderMessages(this.messages.filter(msg => msg.chatId === this.currentChat.id));
            }
        }
    }

    setupEventListeners() {
        // Envoi de message
        const sendButton = document.getElementById('sendButton');
        const messageInput = document.getElementById('messageInput');

        if (sendButton && messageInput) {
            sendButton.addEventListener('click', () => {
                const content = messageInput.value;
                if (content.trim()) {
                    this.sendMessage(content);
                    messageInput.value = '';
                }
            });

            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const content = messageInput.value;
                    if (content.trim()) {
                        this.sendMessage(content);
                        messageInput.value = '';
                    }
                }
            });

            // Auto-resize du textarea
            messageInput.addEventListener('input', function() {
                this.style.height = 'auto';
                this.style.height = this.scrollHeight + 'px';
            });
        }

        // Fermer le chat (retour à l'écran d'accueil)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentChat) {
                this.closeChat();
            }
        });
    }

    closeChat() {
        this.currentChat = null;
        document.getElementById('chatArea').classList.add('hidden');
        document.getElementById('noChatSelected').classList.remove('hidden');
        
        // Retirer la classe active de tous les chats
        document.querySelectorAll('.chat-item').forEach(item => {
            item.classList.remove('bg-gray-700');
        });
        
        console.log('Chat fermé');
    }

    startMessagePolling() {
        // Vérifier les nouveaux messages toutes les 3 secondes
        this.messagePollingInterval = setInterval(async () => {
            await this.checkForNewMessages();
        }, 3000);
        
        console.log('Polling des messages démarré');
    }

    async checkForNewMessages() {
        try {
            const response = await fetch(`${apiUrl}/messages`);
            const serverMessages = await response.json();
            
            const newMessages = serverMessages.filter(serverMsg => 
                !this.messages.find(localMsg => localMsg.id === serverMsg.id)
            );

            if (newMessages.length > 0) {
                console.log('Nouveaux messages détectés:', newMessages.length);
                
                this.messages.push(...newMessages);
                
                // Si on est dans un chat, rafraîchir les messages
                if (this.currentChat) {
                    const currentChatMessages = this.messages.filter(msg => 
                        msg.chatId === this.currentChat.id
                    );
                    this.renderMessages(currentChatMessages);
                    this.scrollToBottom();
                }

                // Mettre à jour la liste des chats
                await this.refreshChats();
                
                // Afficher une notification pour les nouveaux messages
                this.showNotification(newMessages);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification des nouveaux messages:', error);
        }
    }

    async refreshChats() {
        try {
            const chatsResponse = await fetch(`${apiUrl}/chats`);
            const allChats = await chatsResponse.json();
            this.chats = allChats.filter(chat => 
                chat.participants.includes(this.currentUser.userId)
            );
            this.renderChatList();
        } catch (error) {
            console.error('Erreur lors du rafraîchissement des chats:', error);
        }
    }

    showNotification(newMessages) {
        if (!('Notification' in window)) return;

        newMessages.forEach(message => {
            if (message.senderId !== this.currentUser.userId) {
                const sender = this.users.find(user => user.id === message.senderId);
                if (sender && Notification.permission === 'granted') {
                    const notification = new Notification(`Nouveau message de ${sender.name}`, {
                        body: message.type === 'audio' ? '🔊 Message vocal' : message.content,
                        icon: sender.avatar,
                        tag: message.chatId
                    });
                    
                    // Fermer automatiquement après 5 secondes
                    setTimeout(() => notification.close(), 5000);
                }
            }
        });
    }

    scrollToBottom() {
        const container = document.getElementById('messagesContainer');
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    formatLastSeen(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'à l\'instant';
        if (diffInMinutes < 60) return `il y a ${diffInMinutes}min`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `il y a ${diffInHours}h`;
        
        return date.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit' 
        });
    }

    formatLastMessage(message) {
        const prefix = message.senderId === this.currentUser.userId ? '✓ ' : '';
        
        if (message.type === 'audio') {
            return `${prefix}🔇 ${message.content}`;
        }
        
        const maxLength = 30;
        const content = message.content.length > maxLength ? 
            message.content.substring(0, maxLength) + '...' : 
            message.content;
            
        return `${prefix}${content}`;
    }

    destroy() {
        if (this.messagePollingInterval) {
            clearInterval(this.messagePollingInterval);
            console.log('Polling des messages arrêté');
        }
    }
}

// Export pour utilisation
export default ChatManager;