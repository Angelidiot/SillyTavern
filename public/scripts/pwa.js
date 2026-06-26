let deferredInstallPrompt = null;
let installPromptElement = null;

function isStandaloneDisplayMode() {
    const standaloneMediaQuery = window.matchMedia?.('(display-mode: standalone)');
    return Boolean(standaloneMediaQuery?.matches || navigator.standalone);
}

function removeInstallPrompt() {
    installPromptElement?.remove();
    installPromptElement = null;
}

function createInstallPrompt() {
    if (installPromptElement || !deferredInstallPrompt || isStandaloneDisplayMode()) {
        return;
    }

    const prompt = document.createElement('div');
    prompt.id = 'pwa_install_prompt';
    prompt.className = 'pwa-install-prompt';
    prompt.setAttribute('role', 'region');
    prompt.setAttribute('aria-label', 'Install SillyTavern');

    const installButton = document.createElement('button');
    installButton.id = 'pwa_install_button';
    installButton.type = 'button';
    installButton.className = 'menu_button pwa-install-button';
    installButton.title = 'Install SillyTavern';
    installButton.setAttribute('aria-label', 'Install SillyTavern');
    installButton.innerHTML = '<span class="fa-solid fa-download" aria-hidden="true"></span><span>Install</span>';

    const dismissButton = document.createElement('button');
    dismissButton.type = 'button';
    dismissButton.className = 'menu_button pwa-install-dismiss';
    dismissButton.title = 'Dismiss install prompt';
    dismissButton.setAttribute('aria-label', 'Dismiss install prompt');
    dismissButton.innerHTML = '<span class="fa-solid fa-xmark" aria-hidden="true"></span>';

    installButton.addEventListener('click', async () => {
        if (!deferredInstallPrompt) {
            removeInstallPrompt();
            return;
        }

        const promptEvent = deferredInstallPrompt;
        deferredInstallPrompt = null;
        removeInstallPrompt();

        try {
            await promptEvent.prompt();
            await promptEvent.userChoice?.catch(() => undefined);
        } catch (error) {
            console.warn('PWA install prompt failed:', error);
        }
    });

    dismissButton.addEventListener('click', () => {
        deferredInstallPrompt = null;
        removeInstallPrompt();
    });

    prompt.append(installButton, dismissButton);
    document.body.append(prompt);
    installPromptElement = prompt;
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js').catch(error => {
            console.warn('PWA service worker registration failed:', error);
        });
    });
}

window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();

    if (isStandaloneDisplayMode()) {
        deferredInstallPrompt = null;
        removeInstallPrompt();
        return;
    }

    deferredInstallPrompt = event;
    createInstallPrompt();
});

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    removeInstallPrompt();
});

window.matchMedia?.('(display-mode: standalone)')?.addEventListener?.('change', event => {
    if (event.matches) {
        deferredInstallPrompt = null;
        removeInstallPrompt();
    }
});
