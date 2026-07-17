import * as vscode from 'vscode';
import { ILogger } from '../../types';
import { serviceContainer } from '../../services/serviceContainer';

/**
 * Manages the Webview Panel for the Live Console.
 */
export class ConsoleWebview {
    public static currentPanel: ConsoleWebview | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    private _loggerListener?: vscode.Disposable;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;

        // Set initial HTML
        this._panel.webview.html = this.getHtmlForWebview();

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Listen for messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async (message) => {
                const logger = serviceContainer.get<ILogger>('Logger');
                switch (message.command) {
                    case 'clear':
                        logger.clear();
                        break;
                    case 'save':
                        await logger.exportLogs();
                        break;
                }
            },
            null,
            this._disposables
        );

        // Subscribe to Logger events to stream new logs
        const logger = serviceContainer.get<ILogger>('Logger');
        this._loggerListener = logger.onDidLog((logMessage) => {
            // Send the raw message to the webview JS
            this._panel.webview.postMessage({ type: 'log', data: logMessage });
        });

        // Hydrate webview with existing logs
        const existingLogs = logger.getLogBuffer();
        if (existingLogs.length > 0) {
            this._panel.webview.postMessage({ type: 'hydrate', data: existingLogs });
        }
    }

    /**
     * Renders or reveals the Live Console webview.
     */
    public static render(extensionUri: vscode.Uri) {
        if (ConsoleWebview.currentPanel) {
            ConsoleWebview.currentPanel._panel.reveal(vscode.ViewColumn.Two);
        } else {
            const panel = vscode.window.createWebviewPanel(
                'flutterConsole',
                'Flutter Console',
                vscode.ViewColumn.Two, // Open beside the editor by default
                {
                    enableScripts: true,
                    enableFindWidget: true, // Native search functionality
                    retainContextWhenHidden: true // Keep logs when tab is hidden
                }
            );

            ConsoleWebview.currentPanel = new ConsoleWebview(panel, extensionUri);
        }
    }

    private getHtmlForWebview(): string {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Live Console</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: var(--vscode-editor-font-family, monospace);
                    font-size: var(--vscode-editor-font-size, 13px);
                    color: var(--vscode-terminal-foreground);
                    background-color: var(--vscode-terminal-background);
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    overflow: hidden;
                }
                .toolbar {
                    display: flex;
                    padding: 8px 16px;
                    background-color: var(--vscode-editorGroupHeader-tabsBackground);
                    border-bottom: 1px solid var(--vscode-panel-border);
                    gap: 10px;
                }
                button {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    border: none;
                    padding: 4px 12px;
                    border-radius: 2px;
                    cursor: pointer;
                    font-size: 12px;
                }
                button:hover {
                    background-color: var(--vscode-button-secondaryHoverBackground);
                }
                .terminal-container {
                    flex-grow: 1;
                    padding: 10px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                .log-line {
                    margin: 2px 0;
                    line-height: 1.4;
                }
                .tag-info { color: var(--vscode-terminal-ansiCyan); }
                .tag-warn { color: var(--vscode-terminal-ansiYellow); }
                .tag-error { color: var(--vscode-terminal-ansiRed); }
                
                /* Simple CSS trick for auto-scroll toggle if we wanted one, 
                   but we'll use JS for robust auto-scroll */
            </style>
        </head>
        <body>
            <div class="toolbar" role="toolbar" aria-label="Console Actions">
                <button id="clearBtn" aria-label="Clear Console" tabindex="0">Clear</button>
                <button id="copyBtn" aria-label="Copy All Logs" tabindex="0">Copy All</button>
                <button id="saveBtn" aria-label="Save Logs to File" tabindex="0">Save Log</button>
                <div style="flex-grow: 1;"></div>
                <span style="font-size: 11px; opacity: 0.6; align-self: center;" aria-hidden="true">Ctrl+F to Search</span>
            </div>
            <div class="terminal-container" id="terminal" role="log" aria-live="polite"></div>

            <script>
                const vscode = acquireVsCodeApi();
                const terminal = document.getElementById('terminal');
                let autoScroll = true;

                // Detect if user scrolled up manually
                terminal.addEventListener('scroll', () => {
                    const isAtBottom = terminal.scrollHeight - terminal.clientHeight <= terminal.scrollTop + 5;
                    autoScroll = isAtBottom;
                });

                function appendLog(message) {
                    if (message === '__CLEAR__') {
                        terminal.innerHTML = '';
                        return;
                    }

                    const div = document.createElement('div');
                    div.className = 'log-line';
                    
                    // Simple parsing for colors based on our logger's format: [TIMESTAMP] [LEVEL] Message
                    let html = message
                        .replace(/&/g, "&amp;")
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;");
                        
                    if (html.includes('[INFO]')) {
                        html = html.replace('[INFO]', '<span class="tag-info">[INFO]</span>');
                    } else if (html.includes('[WARN]')) {
                        html = html.replace('[WARN]', '<span class="tag-warn">[WARN]</span>');
                    } else if (html.includes('[ERROR]')) {
                        html = html.replace('[ERROR]', '<span class="tag-error">[ERROR]</span>');
                    }

                    div.innerHTML = html;
                    terminal.appendChild(div);

                    if (autoScroll) {
                        terminal.scrollTop = terminal.scrollHeight;
                    }
                }

                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'log') {
                        appendLog(message.data);
                    } else if (message.type === 'hydrate') {
                        terminal.innerHTML = '';
                        message.data.forEach(log => appendLog(log));
                    }
                });

                document.getElementById('clearBtn').addEventListener('click', () => {
                    vscode.postMessage({ command: 'clear' });
                });

                document.getElementById('saveBtn').addEventListener('click', () => {
                    vscode.postMessage({ command: 'save' });
                });

                document.getElementById('copyBtn').addEventListener('click', () => {
                    navigator.clipboard.writeText(terminal.innerText).then(() => {
                        const btn = document.getElementById('copyBtn');
                        btn.innerText = 'Copied!';
                        setTimeout(() => btn.innerText = 'Copy All', 2000);
                    });
                });
            </script>
        </body>
        </html>`;
    }

    public dispose() {
        ConsoleWebview.currentPanel = undefined;

        if (this._loggerListener) {
            this._loggerListener.dispose();
        }

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
