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
exports.AnalysisWebview = void 0;
const vscode = __importStar(require("vscode"));
const nonce_1 = require("../../utils/nonce");
class AnalysisWebview {
    constructor(panel) {
        this._disposables = [];
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }
    static render(analysis) {
        if (AnalysisWebview.currentPanel) {
            AnalysisWebview.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
            AnalysisWebview.currentPanel.updateHtml(analysis);
        }
        else {
            const panel = vscode.window.createWebviewPanel('errorAnalysis', 'Error Analysis', vscode.ViewColumn.Beside, { enableScripts: true });
            AnalysisWebview.currentPanel = new AnalysisWebview(panel);
            AnalysisWebview.currentPanel.updateHtml(analysis);
        }
    }
    updateHtml(analysis) {
        this._panel.webview.html = this.getHtmlForWebview(analysis);
    }
    getHtmlForWebview(analysis) {
        const nonce = (0, nonce_1.getNonce)();
        // Strict sanitization of user output could be implemented here using an HTML sanitizer,
        // but for now we enforce CSP which prevents execution of injected scripts.
        const fixesHtml = analysis.fixes.map(fix => `<li>${this.escapeHtml(fix)}</li>`).join('');
        const linksHtml = analysis.links.length > 0
            ? `<h3>📚 Documentation</h3><ul>${analysis.links.map(link => `<li><a href="${this.escapeHtml(link)}">${this.escapeHtml(link)}</a></li>`).join('')}</ul>`
            : '';
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${this._panel.webview.cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
            <title>Error Analysis</title>
            <style>
                body {
                    padding: 20px;
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                    line-height: 1.5;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                }
                .problem-header {
                    background-color: var(--vscode-problemsErrorIcon-foreground);
                    color: white;
                    padding: 12px 20px;
                    border-radius: 6px;
                    font-size: 1.2em;
                    font-weight: bold;
                    margin-bottom: 20px;
                }
                .section {
                    background-color: var(--vscode-editorWidget-background);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: 6px;
                    padding: 20px;
                    margin-bottom: 20px;
                }
                h3 {
                    margin-top: 0;
                    color: var(--vscode-symbolIcon-propertyForeground);
                }
                ul {
                    margin-bottom: 0;
                }
                li {
                    margin-bottom: 8px;
                }
                a {
                    color: var(--vscode-textLink-foreground);
                    text-decoration: none;
                }
                a:hover {
                    text-decoration: underline;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="problem-header">
                    ⚠️ Issue Detected: ${this.escapeHtml(analysis.problem)}
                </div>
                
                <div class="section">
                    <h3>💡 Explanation</h3>
                    <p>${analysis.explanation}</p>
                </div>

                <div class="section">
                    <h3>🛠️ Recommended Fixes</h3>
                    <ul>
                        ${fixesHtml}
                    </ul>
                </div>

                ${linksHtml ? `<div class="section">${linksHtml}</div>` : ''}
                </div>
            </div>
            <script nonce="${nonce}">
                // No inline logic allowed for production grade security without nonce
            </script>
        </body>
        </html>`;
    }
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
    dispose() {
        AnalysisWebview.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
exports.AnalysisWebview = AnalysisWebview;
//# sourceMappingURL=analysisWebview.js.map