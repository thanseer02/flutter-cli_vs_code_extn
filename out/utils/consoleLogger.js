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
exports.ConsoleLogger = void 0;
const vscode = __importStar(require("vscode"));
/**
 * A logger that stores logs in a buffer and broadcasts them via an EventEmitter.
 * This is meant to back the Console Webview, which will subscribe to these events.
 */
class ConsoleLogger {
    constructor() {
        this.logBuffer = [];
        this._onDidLog = new vscode.EventEmitter();
        this.onDidLog = this._onDidLog.event;
    }
    /**
     * Formats the log message with a timestamp and log level.
     */
    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] ${message}`;
    }
    append(message) {
        this.logBuffer.push(message);
        // Broadcast the raw formatted string to any listeners (like the Webview)
        this._onDidLog.fire(message);
        // Limit buffer size to prevent memory leaks (e.g. max 10000 lines)
        if (this.logBuffer.length > 10000) {
            this.logBuffer.shift();
        }
    }
    info(message) {
        this.append(this.formatMessage('INFO', message));
    }
    warn(message) {
        this.append(this.formatMessage('WARN', message));
    }
    error(message, error) {
        this.append(this.formatMessage('ERROR', message));
        if (error) {
            const errorStr = error.toString();
            this.append(errorStr);
            if (error.stack) {
                this.append(error.stack);
            }
        }
    }
    debug(message) {
        this.append(this.formatMessage('DEBUG', message));
    }
    /**
     * Triggers the Show Logs command which will focus the Console Webview.
     */
    show() {
        vscode.commands.executeCommand('flutter-cli-assistant.showLogs');
    }
    /**
     * Clears the internal log buffer and notifies listeners.
     */
    clear() {
        this.logBuffer = [];
        this._onDidLog.fire('__CLEAR__');
        this.info('Logs cleared.');
    }
    getLogBuffer() {
        return this.logBuffer;
    }
    /**
     * Exports the log buffer to a file selected by the user.
     */
    async exportLogs() {
        if (this.logBuffer.length === 0) {
            vscode.window.showInformationMessage('No logs to export.');
            return;
        }
        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.Uri.file('flutter_assistant_logs.txt'),
            filters: {
                'Text Files': ['txt'],
                'All Files': ['*']
            },
            title: 'Export Flutter Assistant Logs'
        });
        if (uri) {
            try {
                const content = this.logBuffer.join('\n');
                await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
                vscode.window.showInformationMessage('Logs exported successfully.');
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to export logs: ${error.message}`);
            }
        }
    }
}
exports.ConsoleLogger = ConsoleLogger;
//# sourceMappingURL=consoleLogger.js.map