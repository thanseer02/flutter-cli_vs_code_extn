import * as vscode from 'vscode';
import { ILogger } from '../types';
import { CHANNELS } from '../constants';

/**
 * Logger implementation that writes to a VS Code OutputChannel.
 * This class wraps VS Code's OutputChannel to provide a standardized logging interface.
 * It also maintains an in-memory buffer of logs for exporting.
 */
export class OutputChannelLogger implements ILogger {
    private outputChannel: vscode.OutputChannel;
    private logBuffer: string[] = [];

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

    private append(message: string): void {
        this.outputChannel.appendLine(message);
        this.logBuffer.push(message);
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
            this.outputChannel.appendLine(errorStr);
            this.logBuffer.push(errorStr);
            
            if (error.stack) {
                this.outputChannel.appendLine(error.stack);
                this.logBuffer.push(error.stack);
            }
        }
    }

    debug(message: string): void {
        this.append(this.formatMessage('DEBUG', message));
    }

    /**
     * Brings the Output Channel to the foreground in the VS Code UI.
     */
    show(): void {
        this.outputChannel.show();
    }

    /**
     * Clears the Output Channel and the internal log buffer.
     */
    clear(): void {
        this.outputChannel.clear();
        this.logBuffer = [];
        this.info('Logs cleared.');
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
