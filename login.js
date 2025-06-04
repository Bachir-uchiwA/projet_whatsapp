import { countryRules } from './countries.js';

// Gestionnaire du formulaire de connexion
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const phone = document.getElementById('phone').value.trim();
    const country = document.getElementById('country').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const messageDiv = document.getElementById('message');
    
    // Récupération des règles du pays sélectionné
    const rule = countryRules[country];
    
    // Validation du format du numéro selon le pays
    if (!rule.regex.test(phone)) {
        showMessage(
            `Numéro invalide pour ${rule.name}. Exemple: ${rule.example}`,
            'error'
        );
        return;
    }
    
    // Animation du bouton pendant la connexion
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Connexion en cours...';
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-75', 'cursor-not-allowed');
    
    try {
        const response = await fetch(`/api/users?phone=${phone}&country=${country}`);
        
        if (!response.ok) {
            throw new Error('Erreur de réseau');
        }
        
        const users = await response.json();
        
        if (users.length === 0) {
            showMessage("Ce numéro n'existe pas dans la base pour ce pays.", 'error');
            return;
        }

        // Création d'une session
        const sessionResponse = await fetch('/api/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: users[0].id,
                phone: phone,
                country: country,
                createdAt: new Date().toISOString()
            })
        });

        if (!sessionResponse.ok) {
            throw new Error('Erreur lors de la création de la session');
        }

        const session = await sessionResponse.json();
        
        // Authentification réussie
        showMessage('Connexion réussie ! Redirection...', 'success');
        
        // Attendre un peu pour que l'utilisateur voie le message de succès
        setTimeout(() => {
            window.location.href = `chat.html?sessionId=${session.id}`;
        }, 1500);
        
    } catch (error) {
        console.error('Erreur de connexion:', error);
        showMessage('Erreur de connexion au serveur. Veuillez réessayer.', 'error');
    } finally {
        // Restauration du bouton après un délai
        setTimeout(() => {
            submitBtn.innerHTML = originalBtnContent;
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');
        }, 2000);
    }
});

// Fonction d'affichage des messages
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    
    // Configuration des styles selon le type de message
    const styles = {
        error: 'bg-red-500/20 text-red-400 border-red-500/30',
        success: 'bg-green-500/20 text-green-400 border-green-500/30',
        info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
    };
    
    // Application du style et du contenu
    messageDiv.textContent = text;
    messageDiv.className = `mt-6 text-center p-4 rounded-xl border transition-all duration-300 ${styles[type] || styles.info}`;
    messageDiv.classList.remove('hidden');
    
    // Animation d'apparition
    messageDiv.style.opacity = '0';
    messageDiv.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        messageDiv.style.opacity = '1';
        messageDiv.style.transform = 'translateY(0)';
    }, 10);
    
    // Masquage automatique après 5 secondes pour les messages d'erreur
    if (type === 'error') {
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                messageDiv.classList.add('hidden');
            }, 300);
        }, 5000);
    }
}

// Gestion des événements supplémentaires
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phone');
    const countrySelect = document.getElementById('country');
    
    // Mise à jour du placeholder selon le pays sélectionné
    countrySelect.addEventListener('change', function() {
        const selectedCountry = this.value;
        const rule = countryRules[selectedCountry];
        
        if (rule) {
            phoneInput.placeholder = `Ex: ${rule.example}`;
            phoneInput.setAttribute('pattern', rule.regex.source);
        }
    });
    
    // Formatage automatique du numéro de téléphone (optionnel)
    phoneInput.addEventListener('input', function() {
        // Suppression des caractères non numériques
        let value = this.value.replace(/\D/g, '');
        
        // Limitation de la longueur selon le pays (optionnel)
        const selectedCountry = countrySelect.value;
        const rule = countryRules[selectedCountry];
        
        if (rule && rule.maxLength) {
            value = value.substring(0, rule.maxLength);
        }
        
        this.value = value;
    });
    
    // Validation en temps réel
    phoneInput.addEventListener('blur', function() {
        const phone = this.value.trim();
        const country = countrySelect.value;
        const rule = countryRules[country];
        
        if (phone && !rule.regex.test(phone)) {
            this.classList.add('border-red-500', 'focus:ring-red-500');
            this.classList.remove('border-slate-600', 'focus:ring-whatsapp-green');
        } else {
            this.classList.remove('border-red-500', 'focus:ring-red-500');
            this.classList.add('border-slate-600', 'focus:ring-whatsapp-green');
        }
    });
    
    // Initialisation du placeholder
    const initialRule = countryRules[countrySelect.value];
    if (initialRule) {
        phoneInput.placeholder = `Ex: ${initialRule.example}`;
    }
});

// Gestion des raccourcis clavier
document.addEventListener('keydown', function(e) {
    // Soumettre avec Ctrl+Enter
    if (e.ctrlKey && e.key === 'Enter') {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
    
    // Effacer le message avec Escape
    if (e.key === 'Escape') {
        const messageDiv = document.getElementById('message');
        if (!messageDiv.classList.contains('hidden')) {
            messageDiv.style.opacity = '0';
            setTimeout(() => {
                messageDiv.classList.add('hidden');
            }, 300);
        }
    }
});

// Export pour les tests (optionnel)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { showMessage };
}