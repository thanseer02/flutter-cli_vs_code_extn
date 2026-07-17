import * as vscode from 'vscode';
import { DoctorCategory } from '../../models/doctor';
import { getNonce } from '../../utils/nonce';

/**
 * Manages the Webview Panel for Flutter Doctor.
 */
export class DoctorWebview {
    public static currentPanel: DoctorWebview | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;

        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    /**
     * Renders or updates the Webview panel with the latest parsed data.
     */
    public static render(extensionUri: vscode.Uri, data: DoctorCategory[]) {
        if (DoctorWebview.currentPanel) {
            // If we already have a panel, show it and update its HTML
            DoctorWebview.currentPanel._panel.reveal(vscode.ViewColumn.One);
            DoctorWebview.currentPanel.updateHtml(data);
        } else {
            // Create a new panel
            const panel = vscode.window.createWebviewPanel(
                'flutterDoctor',
                'Flutter Doctor',
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
                }
            );

            DoctorWebview.currentPanel = new DoctorWebview(panel, extensionUri);
            DoctorWebview.currentPanel.updateHtml(data);
        }
    }

    /**
     * Updates the webview HTML content based on parsed data.
     */
    private updateHtml(categories: DoctorCategory[]) {
        this._panel.webview.html = this.getHtmlForWebview(categories);
    }

    private getHtmlForWebview(categories: DoctorCategory[]): string {
        // We use VS Code's Codicons and CSS variables for native styling
        const webview = this._panel.webview;
        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(
            vscode.extensions.getExtension('vscode.markdown-language-features')!.extensionUri,
            'media',
            'codicon.css'
        ));

        const getIconForCategory = (title: string): string => {
            const t = title.toLowerCase();
            if (t.includes('flutter')) return 'heart'; // using heart for flutter
            if (t.includes('android')) return 'device-mobile';
            if (t.includes('chrome')) return 'browser';
            if (t.includes('xcode')) return 'device-desktop';
            if (t.includes('device')) return 'vm-active';
            if (t.includes('network')) return 'globe';
            return 'info';
        };

        const getStatusIcon = (status: string): string => {
            if (status === 'success') return '<span class="status-icon success"><i class="codicon codicon-check"></i></span>';
            if (status === 'warning') return '<span class="status-icon warning"><i class="codicon codicon-warning"></i></span>';
            return '<span class="status-icon error"><i class="codicon codicon-error"></i></span>';
        };

        const getStatusColor = (status: string): string => {
            if (status === 'success') return 'var(--vscode-testing-iconPassed)';
            if (status === 'warning') return 'var(--vscode-problemsWarningIcon-foreground)';
            return 'var(--vscode-problemsErrorIcon-foreground)';
        };

        let cardsHtml = '';
        
        for (const category of categories) {
            const icon = getIconForCategory(category.title);
            const statusHtml = getStatusIcon(category.status);
            const color = getStatusColor(category.status);

            let detailsHtml = '';
            for (const detail of category.details) {
                // Highlight warnings/errors in the text if they start with ! or x
                let formattedDetail = this.escapeHtml(detail);
                if (detail.startsWith('!') || detail.startsWith('✗') || detail.startsWith('x')) {
                    formattedDetail = `<span style="color: ${color}; font-weight: bold;">${this.escapeHtml(detail)}</span>`;
                }
                detailsHtml += `<li>${formattedDetail}</li>`;
            }

            cardsHtml += `
                <div class="card" style="border-left: 4px solid ${color};">
                    <div class="card-header">
                        ${statusHtml}
                        <h2 class="card-title">${this.escapeHtml(category.title)}</h2>
                        <i class="codicon codicon-${icon} category-icon" style="color: ${color}; opacity: 0.5;"></i>
                    </div>
                    <ul class="details-list">
                        ${detailsHtml}
                    </ul>
                </div>
            `;
        }

        const nonce = getNonce();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this._panel.webview.cspSource} 'unsafe-inline'; font-src ${this._panel.webview.cspSource}; script-src 'nonce-${nonce}';">
            <link href="${codiconsUri}" rel="stylesheet" />
            <title>Flutter Doctor</title>
            <style>
                body {
                    padding: 20px;
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                }
                h1 {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }
                .card-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 16px;
                }
                .card {
                    background-color: var(--vscode-editorWidget-background);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: 6px;
                    padding: 16px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    font-size: 1.1em;
                    font-weight: 600;
                    margin-bottom: 12px;
                }
                .status-icon {
                    margin-right: 12px;
                    font-size: 1.2em;
                }
                .status-icon.success { color: var(--vscode-testing-iconPassed); }
                .status-icon.warning { color: var(--vscode-problemsWarningIcon-foreground); }
                .status-icon.error { color: var(--vscode-problemsErrorIcon-foreground); }
                
                .category-icon {
                    margin-left: auto;
                    font-size: 1.2em;
                }
                .card-title {
                    margin: 0;
                    font-size: 1em;
                }
                .details-list {
                    list-style-type: none;
                    padding-left: 0;
                    margin: 0;
                    font-size: 0.95em;
                    opacity: 0.9;
                }
                .details-list li {
                    margin-bottom: 6px;
                    line-height: 1.4;
                    position: relative;
                    padding-left: 20px;
                }
                .details-list li::before {
                    content: "•";
                    position: absolute;
                    left: 4px;
                    color: var(--vscode-textLink-foreground);
                }
            </style>
        </head>
        <body>
            <h1><i class="codicon codicon-pulse" style="font-size: 1.5em; color: var(--vscode-symbolIcon-propertyForeground);"></i> Flutter Doctor Summary</h1>
            <div class="card-container">
                ${cardsHtml}
            </div>
            <script nonce="${nonce}">
                // No inline logic allowed for production grade security without nonce
            </script>
        </body>
        </html>`;
    }

    private escapeHtml(unsafe: string): string {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    public dispose() {
        DoctorWebview.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
