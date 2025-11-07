const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const util = require('util');

const execPromise = util.promisify(exec);
const app = express();
const PORT = 3000;

// Serve static files
app.use(express.static(__dirname));

// API endpoint to get GitHub token from gh CLI
app.get('/api/auth/token', async (req, res) => {
    try {
        // Get the token from gh CLI
        const { stdout, stderr } = await execPromise('gh auth token');

        if (stderr) {
            console.error('gh CLI stderr:', stderr);
        }

        const token = stdout.trim();

        if (!token) {
            return res.status(401).json({
                error: 'No token found. Please run "gh auth login" first.'
            });
        }

        res.json({ token });
    } catch (error) {
        console.error('Error getting token:', error);

        if (error.message.includes('gh: command not found')) {
            return res.status(500).json({
                error: 'GitHub CLI (gh) is not installed. Please install it from https://cli.github.com/'
            });
        }

        res.status(500).json({
            error: 'Failed to get GitHub token. Make sure you are logged in with "gh auth login".',
            details: error.message
        });
    }
});

// Check gh CLI authentication status
app.get('/api/auth/status', async (req, res) => {
    try {
        const { stdout } = await execPromise('gh auth status');
        res.json({ authenticated: true, status: stdout.trim() });
    } catch (error) {
        res.json({ authenticated: false, error: error.message });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════╗
║      GitHub Gist Editor is running!            ║
╚════════════════════════════════════════════════╝

🚀 Open your browser and navigate to:
   http://localhost:${PORT}

📝 Make sure you're logged in with GitHub CLI:
   gh auth login

Press Ctrl+C to stop the server.
    `);
});
