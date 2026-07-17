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
exports.DashboardWebview = void 0;
const vscode = __importStar(require("vscode"));
class DashboardWebview {
    constructor(panel) {
        this._disposables = [];
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'runAction':
                    // Basic mapping of dashboard commands to our VS Code commands
                    if (message.action === 'build apk')
                        vscode.commands.executeCommand('flutter-cli-assistant.buildApk');
                    if (message.action === 'build ipa')
                        vscode.commands.executeCommand('flutter-cli-assistant.buildIpa');
                    if (message.action === 'pub get')
                        vscode.commands.executeCommand('flutter-cli-assistant.pubGet');
                    if (message.action === 'clean')
                        vscode.commands.executeCommand('flutter-cli-assistant.clean');
                    return;
            }
        }, null, this._disposables);
    }
    static render(data) {
        if (DashboardWebview.currentPanel) {
            DashboardWebview.currentPanel._panel.reveal(vscode.ViewColumn.One);
            DashboardWebview.currentPanel.updateHtml(data);
        }
        else {
            const panel = vscode.window.createWebviewPanel('flutterDashboard', 'Flutter Dashboard', vscode.ViewColumn.One, { enableScripts: true });
            DashboardWebview.currentPanel = new DashboardWebview(panel);
            DashboardWebview.currentPanel.updateHtml(data);
        }
    }
    updateHtml(data) {
        this._panel.webview.html = this.getHtmlForWebview(data);
    }
    getHtmlForWebview(data) {
        const codiconsUri = this._panel.webview.asWebviewUri(vscode.Uri.joinPath(vscode.extensions.getExtension('vscode.markdown-language-features').extensionUri, 'media', 'codicon.css'));
        const devicesHtml = data.devices.length > 0
            ? data.devices.map(d => `<div class="device-item"><i class="codicon codicon-${d.isEmulator ? 'vm' : 'device-mobile'}"></i> ${d.name} (${d.id})</div>`).join('')
            : '<div class="device-item">No devices connected</div>';
        const recentCommandsHtml = data.recentCommands
            .map(cmd => `<button class="action-btn" onclick="runAction('${cmd}')" aria-label="Run ${cmd}" tabindex="0">${cmd}</button>`)
            .join('');
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${codiconsUri}" rel="stylesheet" />
            <title>Flutter Dashboard</title>
            <style>
                body {
                    padding: 30px;
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-editor-foreground);
                    background-color: var(--vscode-editor-background);
                }
                .dashboard-header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    margin-bottom: 30px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding-bottom: 20px;
                }
                .header-title {
                    font-size: 2em;
                    font-weight: bold;
                    margin: 0;
                }
                .header-subtitle {
                    font-size: 1.1em;
                    opacity: 0.8;
                }
                .grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 20px;
                }
                .card {
                    background-color: var(--vscode-editorWidget-background);
                    border: 1px solid var(--vscode-widget-border);
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    display: flex;
                    flex-direction: column;
                }
                .card h3 {
                    margin-top: 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--vscode-symbolIcon-propertyForeground);
                    border-bottom: 1px solid var(--vscode-widget-border);
                    padding-bottom: 10px;
                }
                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px dashed var(--vscode-panel-border);
                }
                .stat-row:last-child {
                    border-bottom: none;
                }
                .stat-label {
                    opacity: 0.8;
                }
                .stat-value {
                    font-weight: bold;
                    color: var(--vscode-textLink-foreground);
                }
                .device-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px;
                    background-color: var(--vscode-list-hoverBackground);
                    border-radius: 4px;
                    margin-bottom: 8px;
                }
                .actions-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-top: 10px;
                }
                .action-btn {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: 500;
                    text-align: center;
                }
                .action-btn:hover, .action-btn:focus {
                    background-color: var(--vscode-button-hoverBackground);
                    outline: 1px solid var(--vscode-focusBorder);
                    outline-offset: 2px;
                }
            </style>
        </head>
        <body>
            <div class="dashboard-header">
                <i class="codicon codicon-dashboard" style="font-size: 3em; color: var(--vscode-symbolIcon-colorForeground);"></i>
                <div>
                    <h1 class="header-title">${data.projectName}</h1>
                    <div class="header-subtitle"><i class="codicon codicon-git-branch"></i> ${data.gitBranch}</div>
                </div>
            </div>

            <div class="grid">
                <!-- Environment Card -->
                <div class="card">
                    <h3><i class="codicon codicon-server-environment"></i> Environment</h3>
                    <div class="stat-row">
                        <span class="stat-label">Flutter SDK</span>
                        <span class="stat-value">${data.flutterVersion}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Dart SDK</span>
                        <span class="stat-value">${data.dartVersion}</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Dependencies</span>
                        <span class="stat-value">${data.dependenciesCount} packages</span>
                    </div>
                    <div class="stat-row">
                        <span class="stat-label">Last Build</span>
                        <span class="stat-value" style="color: var(--vscode-testing-iconPassed);">${data.latestBuildStatus}</span>
                    </div>
                </div>

                <!-- Devices Card -->
                <div class="card">
                    <h3><i class="codicon codicon-device-mobile"></i> Connected Devices</h3>
                    <div style="margin-top: 10px;">
                        ${devicesHtml}
                    </div>
                </div>

                <!-- Quick Actions Card -->
                <div class="card">
                    <h3><i class="codicon codicon-zap"></i> Quick Actions</h3>
                    <div class="actions-grid">
                        ${recentCommandsHtml}
                    </div>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                function runAction(actionName) {
                    vscode.postMessage({
                        command: 'runAction',
                        action: actionName
                    });
                }
            </script>
        </body>
        </html>`;
    }
    dispose() {
        DashboardWebview.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
exports.DashboardWebview = DashboardWebview;
//# sourceMappingURL=dashboardWebview.js.map