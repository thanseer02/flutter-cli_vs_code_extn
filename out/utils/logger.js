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
 */
class OutputChannelLogger {
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel(constants_1.CHANNELS.MAIN_OUTPUT);
    }
    /**
     * Formats the log message with a timestamp and log level.
     */
    formatMessage(level, message) {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] ${message}`;
    }
    info(message) {
        this.outputChannel.appendLine(this.formatMessage('INFO', message));
    }
    warn(message) {
        this.outputChannel.appendLine(this.formatMessage('WARN', message));
    }
    error(message, error) {
        this.outputChannel.appendLine(this.formatMessage('ERROR', message));
        if (error) {
            this.outputChannel.appendLine(error.toString());
            if (error.stack) {
                this.outputChannel.appendLine(error.stack);
            }
        }
    }
    debug(message) {
        // In a real extension, we might check a setting to see if debug logging is enabled.
        this.outputChannel.appendLine(this.formatMessage('DEBUG', message));
    }
    /**
     * Brings the Output Channel to the foreground in the VS Code UI.
     */
    show() {
        this.outputChannel.show();
    }
}
exports.OutputChannelLogger = OutputChannelLogger;
//# sourceMappingURL=logger.js.map