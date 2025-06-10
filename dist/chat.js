// JS principal pour la page chat (nécessaire pour éviter l'erreur MIME lors du déploiement Vercel)
// Ajoute ici ton code JS spécifique à la page chat si besoin.

console.log("chat.js chargé !");

document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM entièrement chargé !");
    const settingsIcon = document.getElementById('settingsIcon');
    const sidebarChats = document.getElementById('sidebarChats');
    const sidebarSettings = document.getElementById('sidebarSettings');
    const sidebarChatIcon = document.getElementById('sidebarChatIcon');

    console.log("settingsIcon:", settingsIcon);
    console.log("sidebarChats:", sidebarChats);
    console.log("sidebarSettings:", sidebarSettings);
    console.log("sidebarChatIcon:", sidebarChatIcon);

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
});

export {};
