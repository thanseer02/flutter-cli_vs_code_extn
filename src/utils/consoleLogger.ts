import * as vscode from 'vscode';
import { ILogger } from '../types';

/**
 * A logger that stores logs in a buffer and broadcasts them via an EventEmitter.
 * This is meant to back the Console Webview, which will subscribe to these events.
 */
export class ConsoleLogger implements ILogger {
    private logBuffer: string[] = [];
    
    private _onDidLog = new vscode.EventEmitter<string>();
    public readonly onDidLog = this._onDidLog.event;

    /**
     * Formats the log message with a timestamp and log level.
     */
    private formatMessage(level: string, message: string): string {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level}] ${message}`;
    }

    private append(message: string): void {
        this.logBuffer.push(message);
        
        // Broadcast the raw formatted string to any listeners (like the Webview)
        this._onDidLog.fire(message);

        // Limit buffer size to prevent memory leaks (e.g. max 10000 lines)
        if (this.logBuffer.length > 10000) {
            this.logBuffer.shift();
        }
    }

    info(message: string): void {
        this.append(this.formatMessage('INFO', message));
    }

    warn(message: string): void {
        this.append(this.formatMessage('WARN', message));
    }

    error(message: string, error?: any): void {
        this.append(this.formatMessage('ERROR', message));
        if (error) {
            const errorStr = error.toString();
            this.append(errorStr);
            
            if (error.stack) {
                this.append(error.stack);
            }
        }
    }

    debug(message: string): void {
        this.append(this.formatMessage('DEBUG', message));
    }

    /**
     * Triggers the Show Logs command which will focus the Console Webview.
     */
    show(): void {
        vscode.commands.executeCommand('flutter-cli-assistant.showLogs');
    }

    /**
     * Clears the internal log buffer and notifies listeners.
     */
    clear(): void {
        this.logBuffer = [];
        this._onDidLog.fire('__CLEAR__');
        this.info('Logs cleared.');
    }

    getLogBuffer(): string[] {
        return this.logBuffer;
    }

    /**
     * Exports the log buffer to a file selected by the user.
     */
    async exportLogs(): Promise<void> {
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
            } catch (error: any) {
                vscode.window.showErrorMessage(`Failed to export logs: ${error.message}`);
            }
        }
    }
}
