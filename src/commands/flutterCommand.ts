import * as vscode from 'vscode';
import { ICommand, IFlutterService, ILogger } from '../types';
import { serviceContainer } from '../services/serviceContainer';

export type FlutterAction = 'run' | 'buildApk' | 'buildAppBundle' | 'buildWeb' | 'clean' | 'pubGet' | 'pubUpgrade' | 'doctor' | 'devices';

/**
 * A generic command to execute any Flutter Service method.
 */
export class FlutterCommand implements ICommand {
    constructor(
        public readonly id: string,
        private readonly action: FlutterAction,
        private readonly progressTitle: string
    ) {}

    async execute(): Promise<void> {
        const flutterService = serviceContainer.get<IFlutterService>('FlutterService');
        const logger = serviceContainer.get<ILogger>('Logger');
        
        // Always show the output channel when starting a command
        logger.show();

        // Use VS Code's progress UI in the bottom right corner
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: this.progressTitle,
            cancellable: true
        }, async (progress, token) => {
            try {
                await flutterService[this.action](token);
                vscode.window.showInformationMessage(`✅ ${this.progressTitle} completed successfully.`);
            } catch (error: any) {
                // If the error was a cancellation, we swallow it (or show a specific message)
                if (error.name === 'CommandCancelledError') {
                    vscode.window.showWarningMessage(`🛑 ${this.progressTitle} was cancelled.`);
                } else {
                    // It's a real failure
                    vscode.window.showErrorMessage(`❌ ${this.progressTitle} failed.`);
                }
            }
        });
    }
}
