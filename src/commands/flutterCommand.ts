import * as vscode from 'vscode';
import { ICommand, IFlutterService, ILogger, IErrorAnalyzerService } from '../types';
import { serviceContainer } from '../services/serviceContainer';
import { CommandExecutionError } from '../utils/errors';
import { AnalysisWebview } from '../providers/webview/analysisWebview';

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
                // Check if it's a known cancellation
                if (error.name === 'CommandCancelledError') {
                    vscode.window.showWarningMessage(`🛑 ${this.progressTitle} was cancelled.`);
                    return;
                }

                // If it's a CommandExecutionError, we have stdout/stderr to analyze
                if (error instanceof CommandExecutionError) {
                    const analyzer = serviceContainer.get<IErrorAnalyzerService>('ErrorAnalyzerService');
                    // Combine stdout and stderr since some tools write errors to stdout
                    const rawLogs = `${error.stdout}\n${error.stderr}`;
                    const analysis = analyzer.analyze(rawLogs);

                    if (analysis) {
                        vscode.window.showErrorMessage(`❌ ${this.progressTitle} failed: ${analysis.problem}`);
                        AnalysisWebview.render(analysis);
                        return;
                    }
                }

                // Fallback for unknown errors
                vscode.window.showErrorMessage(`❌ ${this.progressTitle} failed.`);
            }
        });
    }
}
