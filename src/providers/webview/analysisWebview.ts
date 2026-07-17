import * as vscode from 'vscode';
import { ErrorAnalysis } from '../../models/analyzer';

export class AnalysisWebview {
    public static currentPanel: AnalysisWebview | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    }

    public static render(analysis: ErrorAnalysis) {
        if (AnalysisWebview.currentPanel) {
            AnalysisWebview.currentPanel._panel.reveal(vscode.ViewColumn.Beside);
            AnalysisWebview.currentPanel.updateHtml(analysis);
        } else {
            const panel = vscode.window.createWebviewPanel(
                'errorAnalysis',
                'Error Analysis',
                vscode.ViewColumn.Beside,
                { enableScripts: true }
            );

            AnalysisWebview.currentPanel = new AnalysisWebview(panel);
            AnalysisWebview.currentPanel.updateHtml(analysis);
        }
    }

    private updateHtml(analysis: ErrorAnalysis) {
        this._panel.webview.html = this.getHtmlForWebview(analysis);
    }

    private getHtmlForWebview(analysis: ErrorAnalysis): string {
        const fixesHtml = analysis.fixes.map(fix => `<li>${fix}</li>`).join('');
        const linksHtml = analysis.links.length > 0 
            ? `<h3>📚 Documentation</h3><ul>${analysis.links.map(link => `<li><a href="${link}">${link}</a></li>`).join('')}</ul>`
            : '';

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                    ⚠️ Issue Detected: ${analysis.problem}
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
        </body>
        </html>`;
    }

    public dispose() {
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
