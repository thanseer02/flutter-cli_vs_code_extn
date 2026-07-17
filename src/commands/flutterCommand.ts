import * as vscode from 'vscode';
import { ICommand, ILogger, IErrorAnalyzerService, IPipelineExecutorService } from '../types';
import { serviceContainer } from '../services/serviceContainer';
import { CommandExecutionError } from '../utils/errors';
import { AnalysisWebview } from '../providers/webview/analysisWebview';
import { CommandPipeline } from '../models/pipeline';

/**
 * A generic command to execute a Flutter Build Pipeline.
 */
export class FlutterCommand implements ICommand {
    constructor(
        public readonly id: string,
        private readonly pipeline: CommandPipeline
    ) {}

    async execute(): Promise<void> {
        const executor = serviceContainer.get<IPipelineExecutorService>('PipelineExecutorService');
        const logger = serviceContainer.get<ILogger>('Logger');
        
        // Always show the output channel when starting a command
        logger.show();

        try {
            await executor.execute(this.pipeline);
            vscode.window.showInformationMessage(`✅ ${this.pipeline.name} completed successfully.`);
        } catch (error: any) {
            // Check if it's a known cancellation
            if (error.message === 'Pipeline Cancelled' || error.name === 'CommandCancelledError') {
                vscode.window.showWarningMessage(`🛑 ${this.pipeline.name} was cancelled.`);
                return;
            }

            // If it's a CommandExecutionError, real-time analyzer likely already caught it.
            // We just notify failure generically here.
            vscode.window.showErrorMessage(`❌ ${this.pipeline.name} failed.`);
        }
    }
}
