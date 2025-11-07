# GitHub Gist Editor

A local web application for editing your GitHub Gists with a beautiful markdown editor. Features automatic authentication via GitHub CLI and a clean, modern interface powered by EasyMDE.

## Features

- 📝 Beautiful markdown editor with live preview
- 🔐 Automatic authentication via GitHub CLI
- 📂 Browse and select from all your gists
- 💾 Save changes directly to GitHub
- 🎨 Clean, modern UI
- ⚡ Fast and lightweight
- 🌐 Runs completely locally

## Prerequisites

1. **Node.js** (version 14 or higher)
   - [Download Node.js](https://nodejs.org/)

2. **GitHub CLI** (recommended for easiest setup)
   - [Install GitHub CLI](https://cli.github.com/)
   - After installation, authenticate with: `gh auth login`

## Installation

1. Clone or download this repository
2. Navigate to the `gist-editor` directory
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Open your browser:**
   - Navigate to `http://localhost:3000`

3. **Authenticate:**
   - If you have GitHub CLI installed and authenticated, the app will automatically use it
   - Alternatively, click the Settings button and use a GitHub Personal Access Token

4. **Load your gists:**
   - Click "Load Gists" to fetch all your GitHub gists
   - Click on a file name to open it in the editor

5. **Edit and save:**
   - Make your changes in the markdown editor
   - Click "Save" to update the gist on GitHub

## Authentication Methods

### Method 1: GitHub CLI (Recommended)

This is the easiest method:

1. Install GitHub CLI: https://cli.github.com/
2. Run `gh auth login` and follow the prompts
3. Start the app with `npm start`
4. The app will automatically use your GitHub CLI authentication

### Method 2: Personal Access Token

If you prefer not to use GitHub CLI:

1. Create a Personal Access Token:
   - Go to https://github.com/settings/tokens/new?scopes=gist
   - Give it the `gist` scope
   - Copy the token

2. In the app:
   - Click the Settings button
   - Paste your token in the "Personal Access Token" field
   - Click "Save Token"

## Keyboard Shortcuts

The markdown editor supports various keyboard shortcuts:

- **Bold**: `Cmd/Ctrl + B`
- **Italic**: `Cmd/Ctrl + I`
- **Preview**: `Cmd/Ctrl + P`
- **Toggle Side-by-side**: `F9`
- **Toggle Fullscreen**: `F11`

## Project Structure

```
gist-editor/
├── index.html      # Main HTML file
├── styles.css      # Custom styles
├── app.js          # Frontend JavaScript
├── server.js       # Express server
├── package.json    # Node.js dependencies
└── README.md       # This file
```

## Troubleshooting

### "gh: command not found"

Make sure GitHub CLI is installed and available in your PATH. Try running `gh --version` in your terminal.

### "Failed to get GitHub token"

If using GitHub CLI, make sure you're authenticated:
```bash
gh auth status
```

If not authenticated, run:
```bash
gh auth login
```

### Cannot connect to localhost:3000

Make sure the server is running and port 3000 is not being used by another application. You can change the port in `server.js` if needed.

### CORS errors

This app must be run through the Node.js server (not by opening index.html directly) to avoid CORS issues with the GitHub API.

## Technology Stack

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Markdown Editor**: [EasyMDE](https://github.com/Ionaru/easy-markdown-editor)
- **Backend**: Node.js, Express
- **API**: GitHub REST API v3

## License

MIT

## Contributing

Feel free to submit issues and pull requests!
