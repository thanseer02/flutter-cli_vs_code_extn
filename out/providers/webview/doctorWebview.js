"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorWebview = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Manages the Webview Panel for Flutter Doctor.
 */
class DoctorWebview {
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        // Listen for when the panel is disposed
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }
    /**
     * Renders or updates the Webview panel with the latest parsed data.
     */
    static render(extensionUri, data) {
        if (DoctorWebview.currentPanel) {
            // If we already have a panel, show it and update its HTML
            DoctorWebview.currentPanel._panel.reveal(vscode.ViewColumn.One);
            DoctorWebview.currentPanel.updateHtml(data);
        }
        else {
            // Create a new panel
            const panel = vscode.window.createWebviewPanel('flutterDoctor', 'Flutter Doctor', vscode.ViewColumn.One, {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            });
            DoctorWebview.currentPanel = new DoctorWebview(panel, extensionUri);
            DoctorWebview.currentPanel.updateHtml(data);
        }
    }
    /**
     * Updates the webview HTML content based on parsed data.
     */
    updateHtml(categories) {
        this._panel.webview.html = this.getHtmlForWebview(categories);
    }
    getHtmlForWebview(categories) {
        // We use VS Code's Codicons and CSS variables for native styling
        const webview = this._panel.webview;
        const codiconsUri = webview.asWebviewUri(vscode.Uri.joinPath(vscode.extensions.getExtension('vscode.markdown-language-features').extensionUri, 'media', 'codicon.css'));
        const getIconForCategory = (title) => {
            const t = title.toLowerCase();
            if (t.includes('flutter'))
                return 'heart'; // using heart for flutter
            if (t.includes('android'))
                return 'device-mobile';
            if (t.includes('chrome'))
                return 'browser';
            if (t.includes('xcode'))
                return 'device-desktop';
            if (t.includes('device'))
                return 'vm-active';
            if (t.includes('network'))
                return 'globe';
            return 'info';
        };
        const getStatusIcon = (status) => {
            if (status === 'success')
                return '<span class="status-icon success"><i class="codicon codicon-check"></i></span>';
            if (status === 'warning')
                return '<span class="status-icon warning"><i class="codicon codicon-warning"></i></span>';
            return '<span class="status-icon error"><i class="codicon codicon-error"></i></span>';
        };
        const getStatusColor = (status) => {
            if (status === 'success')
                return 'var(--vscode-testing-iconPassed)';
            if (status === 'warning')
                return 'var(--vscode-problemsWarningIcon-foreground)';
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
                let formattedDetail = detail;
                if (detail.startsWith('!') || detail.startsWith('✗') || detail.startsWith('x')) {
                    formattedDetail = `<span style="color: ${color}; font-weight: bold;">${detail}</span>`;
                }
                detailsHtml += `<li>${formattedDetail}</li>`;
            }
            cardsHtml += `
                <div class="card" style="border-left: 4px solid ${color};">
                    <div class="card-header">
                        ${statusHtml}
                        <i class="codicon codicon-${icon} category-icon"></i>
                        <span class="category-title">${category.title}</span>
                    </div>
                    ${detailsHtml ? `<ul class="details-list">${detailsHtml}</ul>` : ''}
                </div>
            `;
        }
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                    margin-right: 8px;
                    font-size: 1.2em;
                    color: var(--vscode-foreground);
                    opacity: 0.8;
                }
                .category-title {
                    flex-grow: 1;
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
        </body>
        </html>`;
    }
    dispose() {
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
exports.DoctorWebview = DoctorWebview;
//# sourceMappingURL=doctorWebview.js.map