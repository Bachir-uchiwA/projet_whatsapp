const apiUrl = import.meta.env.VITE_API_URL || '/api';

export async function checkAuth() {
    // Get session ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');

    if (!sessionId) {
        console.log('Aucun sessionId trouvé, redirection vers la page de connexion');
        window.location.href = '/';
        return null;
    }

    try {
        console.log('Vérification de la session:', sessionId);
        
        const response = await fetch(`${apiUrl}/sessions/${sessionId}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Session non trouvée');
            }
            throw new Error('Erreur lors de la vérification de la session');
        }

        const session = await response.json();
        console.log('Session trouvée:', session);
        
        // Check if session is expired (24h)
        const sessionDate = new Date(session.createdAt);
        const now = new Date();
        const diff = now - sessionDate;
        const hours = Math.floor(diff / 1000 / 60 / 60);
        
        if (hours > 24) {
            console.log('Session expirée, suppression...');
            // Delete expired session (seulement en local)
            if (!window.location.hostname.endsWith('vercel.app')) {
                await fetch(`${apiUrl}/sessions/${sessionId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
            throw new Error('Session expirée');
        }

        console.log('Session valide, utilisateur authentifié');
        return session;

    } catch (error) {
        console.error('Erreur de vérification de session:', error);
        
        // Afficher un message d'erreur temporaire
        showAuthError(error.message);
        
        // Redirect to login page after delay
        setTimeout(() => {
            window.location.href = '/';
        }, 2000);
        
        return null;
    }
}

function showAuthError(message) {
    // Créer un message d'erreur temporaire
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    errorDiv.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Animation d'apparition
    setTimeout(() => {
        errorDiv.style.transform = 'translateX(0)';
        errorDiv.style.opacity = '1';
    }, 100);
    
    // Suppression automatique
    setTimeout(() => {
        errorDiv.style.transform = 'translateX(100%)';
        errorDiv.style.opacity = '0';
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 300);
    }, 1500);
}

// Fonction utilitaire pour obtenir l'ID utilisateur depuis la session
export function getCurrentUserId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('userId');
}

// Fonction pour vérifier si l'utilisateur est connecté (sans redirection)
export async function isAuthenticated() {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');
    
    if (!sessionId) return false;
    
    try {
        const response = await fetch(`${apiUrl}/sessions/${sessionId}`, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        return response.ok;
    } catch (error) {
        return false;
    }
}