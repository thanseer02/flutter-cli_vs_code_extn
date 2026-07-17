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
exports.OutputChannelLogger = void 0;
const vscode = __importStar(require("vscode"));
const constants_1 = require("../constants");
/**
 * Logger implementation that writes to a VS Code OutputChannel.
 * This class wraps VS Code's OutputChannel to provide a standardized logging interface.
 * It also maintains an in-memory buffer of logs for exporting.
 */
class OutputChannelLogger {
    constructor() {
        this.logBuffer = [];
        this.outputChannel = vscode.window.createOutputChannel(constants_1.CHANNELS.MAIN_OUTPUT);
    }
    /**
     * Formats the log message with a timestamp and log level.
     */
    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] ${message}`;
    }
    append(message) {
        this.outputChannel.appendLine(message);
        this.logBuffer.push(message);
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
            this.outputChannel.appendLine(errorStr);
            this.logBuffer.push(errorStr);
            if (error.stack) {
                this.outputChannel.appendLine(error.stack);
                this.logBuffer.push(error.stack);
            }
        }
    }
    debug(message) {
        this.append(this.formatMessage('DEBUG', message));
    }
    /**
     * Brings the Output Channel to the foreground in the VS Code UI.
     */
    show() {
        this.outputChannel.show();
    }
    /**
     * Clears the Output Channel and the internal log buffer.
     */
    clear() {
        this.outputChannel.clear();
        this.logBuffer = [];
        this.info('Logs cleared.');
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
exports.OutputChannelLogger = OutputChannelLogger;
//# sourceMappingURL=logger.js.map