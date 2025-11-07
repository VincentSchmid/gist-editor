// GitHub Gist Editor Application
class GistEditor {
    constructor() {
        this.token = localStorage.getItem('github_token') || '';
        this.currentGist = null;
        this.currentFile = null;
        this.editor = null;

        this.init();
    }

    async init() {
        this.setupEditor();
        this.setupEventListeners();
        this.initTheme();

        // Try to get token from gh CLI
        await this.getTokenFromGhCli();
    }

    setupEditor() {
        this.editor = new EasyMDE({
            element: document.getElementById('editor'),
            spellChecker: false,
            autosave: {
                enabled: false
            },
            status: ['lines', 'words', 'cursor'],
            toolbar: [
                'bold', 'italic', 'heading', '|',
                'quote', 'unordered-list', 'ordered-list', '|',
                'link', 'image', 'code', '|',
                'preview', 'side-by-side', 'fullscreen', '|',
                'guide'
            ],
            // Enable code folding for markdown headings
            CodeMirrorOptions: {
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
                lineNumbers: true,
                foldOptions: {
                    widget: "↔"
                }
            }
        });
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Settings
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('saveTokenBtn').addEventListener('click', () => this.saveToken());
        document.getElementById('refreshTokenBtn').addEventListener('click', () => this.getTokenFromGhCli());
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.hideSettings());

        // Gist loading
        document.getElementById('loadGistsBtn').addEventListener('click', () => this.loadGists());
        document.getElementById('closeGistPanelBtn').addEventListener('click', () => this.hideGistPanel());

        // Editor
        document.getElementById('saveBtn').addEventListener('click', () => this.saveGist());
        document.getElementById('closeEditorBtn').addEventListener('click', () => this.closeEditor());
    }

    // Theme Management
    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const body = document.body;
        const themeIcon = document.querySelector('.theme-icon');

        if (savedTheme === 'dark') {
            body.classList.add('dark-theme');
            themeIcon.textContent = '☀️';
        } else {
            body.classList.remove('dark-theme');
            themeIcon.textContent = '🌙';
        }
    }

    toggleTheme() {
        const body = document.body;
        const themeIcon = document.querySelector('.theme-icon');
        const isDark = body.classList.contains('dark-theme');

        if (isDark) {
            body.classList.remove('dark-theme');
            themeIcon.textContent = '🌙';
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.add('dark-theme');
            themeIcon.textContent = '☀️';
            localStorage.setItem('theme', 'dark');
        }
    }

    // Settings Management
    showSettings() {
        const panel = document.getElementById('settingsPanel');
        panel.classList.remove('hidden');
        document.getElementById('tokenInput').value = this.token;
    }

    hideSettings() {
        document.getElementById('settingsPanel').classList.add('hidden');
    }

    saveToken() {
        const token = document.getElementById('tokenInput').value.trim();
        if (!token) {
            this.showMessage('Please enter a valid token', 'error');
            return;
        }

        this.token = token;
        localStorage.setItem('github_token', token);
        this.showMessage('Token saved successfully!', 'success');
        this.hideSettings();
    }

    async getTokenFromGhCli() {
        try {
            const response = await fetch('/api/auth/token');
            const data = await response.json();

            if (response.ok && data.token) {
                this.token = data.token;
                localStorage.setItem('github_token', data.token);
                this.showMessage('Authenticated via GitHub CLI', 'success');
            } else {
                throw new Error(data.error || 'Failed to get token');
            }
        } catch (error) {
            console.error('Error getting token from gh CLI:', error);

            // Fallback to stored token or show settings
            if (!this.token) {
                this.showMessage('Please authenticate with GitHub CLI or enter token manually', 'error');
                this.showSettings();
            }
        }
    }

    // Gist Management
    async loadGists() {
        if (!this.token) {
            this.showMessage('Please set your GitHub token first', 'error');
            this.showSettings();
            return;
        }

        try {
            this.showMessage('Loading gists...', 'info');

            const response = await fetch('https://api.github.com/gists', {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to load gists: ${response.statusText}`);
            }

            const gists = await response.json();
            this.displayGists(gists);

        } catch (error) {
            this.showMessage(`Error: ${error.message}`, 'error');
            console.error('Error loading gists:', error);
        }
    }

    displayGists(gists) {
        const gistList = document.getElementById('gistList');
        gistList.innerHTML = '';

        if (gists.length === 0) {
            gistList.innerHTML = '<p>No gists found.</p>';
            document.getElementById('gistPanel').classList.remove('hidden');
            return;
        }

        gists.forEach(gist => {
            const gistItem = document.createElement('div');
            gistItem.className = 'gist-item';

            const description = gist.description || 'No description';
            const fileCount = Object.keys(gist.files).length;
            const created = new Date(gist.created_at).toLocaleDateString();

            let filesHtml = '<div class="gist-files">';
            Object.keys(gist.files).forEach(fileName => {
                const file = gist.files[fileName];
                filesHtml += `<div class="gist-file" data-gist-id="${gist.id}" data-file-name="${fileName}">${fileName} (${file.language || 'text'})</div>`;
            });
            filesHtml += '</div>';

            gistItem.innerHTML = `
                <h3>${description}</h3>
                <p>${fileCount} file${fileCount > 1 ? 's' : ''} • Created ${created}</p>
                <div class="gist-meta">ID: ${gist.id}</div>
                ${filesHtml}
            `;

            gistList.appendChild(gistItem);
        });

        // Add click listeners to files
        document.querySelectorAll('.gist-file').forEach(fileEl => {
            fileEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const gistId = fileEl.getAttribute('data-gist-id');
                const fileName = fileEl.getAttribute('data-file-name');
                this.loadGist(gistId, fileName);
            });
        });

        document.getElementById('gistPanel').classList.remove('hidden');
        this.showMessage(`Loaded ${gists.length} gist${gists.length > 1 ? 's' : ''}`, 'success');
    }

    hideGistPanel() {
        document.getElementById('gistPanel').classList.add('hidden');
    }

    async loadGist(gistId, fileName) {
        try {
            this.showMessage('Loading gist...', 'info');

            const response = await fetch(`https://api.github.com/gists/${gistId}`, {
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to load gist: ${response.statusText}`);
            }

            const gist = await response.json();
            this.currentGist = gist;
            this.currentFile = fileName;

            const file = gist.files[fileName];
            if (!file) {
                throw new Error(`File ${fileName} not found in gist`);
            }

            // Load content into editor
            this.editor.value(file.content);

            // Update UI
            document.getElementById('gistTitle').textContent = gist.description || 'Untitled Gist';
            document.getElementById('gistFilename').textContent = fileName;
            document.getElementById('editorSection').classList.remove('hidden');
            this.hideGistPanel();

            this.showMessage('Gist loaded successfully!', 'success');

        } catch (error) {
            this.showMessage(`Error: ${error.message}`, 'error');
            console.error('Error loading gist:', error);
        }
    }

    async saveGist() {
        if (!this.currentGist || !this.currentFile) {
            this.showMessage('No gist loaded', 'error');
            return;
        }

        try {
            this.showMessage('Saving...', 'info');

            const content = this.editor.value();

            // Prepare the update payload
            const payload = {
                files: {
                    [this.currentFile]: {
                        content: content
                    }
                }
            };

            const response = await fetch(`https://api.github.com/gists/${this.currentGist.id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Failed to save gist: ${response.statusText}`);
            }

            const updatedGist = await response.json();
            this.currentGist = updatedGist;

            this.showMessage('Gist saved successfully!', 'success');

        } catch (error) {
            this.showMessage(`Error: ${error.message}`, 'error');
            console.error('Error saving gist:', error);
        }
    }

    closeEditor() {
        if (confirm('Close editor? Any unsaved changes will be lost.')) {
            this.currentGist = null;
            this.currentFile = null;
            this.editor.value('');
            document.getElementById('editorSection').classList.add('hidden');
        }
    }

    // UI Helpers
    showMessage(message, type = 'info') {
        const statusEl = document.getElementById('statusMessage');
        statusEl.textContent = message;
        statusEl.className = `status-message ${type}`;
        statusEl.classList.remove('hidden');

        // Auto-hide after 3 seconds
        setTimeout(() => {
            statusEl.classList.add('hidden');
        }, 3000);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new GistEditor();
});
