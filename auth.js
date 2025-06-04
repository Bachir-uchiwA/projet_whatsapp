export async function checkAuth() {
    // Récupérer l'ID de session depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('sessionId');

    if (!sessionId) {
        window.location.href = '/';
        return null;
    }

    try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        if (!response.ok) {
            throw new Error('Session invalide');
        }

        const session = await response.json();
        
        // Vérifier si la session n'est pas expirée (ex: 24h)
        const sessionDate = new Date(session.createdAt);
        const now = new Date();
        if (now - sessionDate > 24 * 60 * 60 * 1000) {
            // Supprimer la session expirée
            await fetch(`/api/sessions/${sessionId}`, {
                method: 'DELETE'
            });
            window.location.href = '/';
            return null;
        }

        return session;
    } catch (error) {
        console.error('Erreur de vérification de session:', error);
        window.location.href = '/';
        return null;
    }
}