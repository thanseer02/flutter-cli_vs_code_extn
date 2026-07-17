import * as vscode from 'vscode';
import { ILogger } from '../types';
import { CHANNELS } from '../constants';

/**
 * Logger implementation that writes to a VS Code OutputChannel.
 * This class wraps VS Code's OutputChannel to provide a standardized logging interface.
 */
export class OutputChannelLogger implements ILogger {
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel(CHANNELS.MAIN_OUTPUT);
    }

    /**
     * Formats the log message with a timestamp and log level.
     */
    private formatMessage(level: string, message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] ${message}`;
    }

    info(message: string): void {
        this.outputChannel.appendLine(this.formatMessage('INFO', message));
    }

    warn(message: string): void {
        this.outputChannel.appendLine(this.formatMessage('WARN', message));
    }

    error(message: string, error?: any): void {
        this.outputChannel.appendLine(this.formatMessage('ERROR', message));
        if (error) {
            this.outputChannel.appendLine(error.toString());
            if (error.stack) {
                this.outputChannel.appendLine(error.stack);
            }
        }
    }

    debug(message: string): void {
        // In a real extension, we might check a setting to see if debug logging is enabled.
        this.outputChannel.appendLine(this.formatMessage('DEBUG', message));
    }

    /**
     * Brings the Output Channel to the foreground in the VS Code UI.
     */
    show(): void {
        this.outputChannel.show();
    }
}
