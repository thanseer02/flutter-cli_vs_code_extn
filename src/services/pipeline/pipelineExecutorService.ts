import * as vscode from 'vscode';
import * as path from 'path';
import { IPipelineExecutorService, IFlutterExecutionService, IProcessManager, ILogger } from '../../types';
import { CommandPipeline } from '../../models/pipeline';
import { serviceContainer } from '../serviceContainer';

export class PipelineExecutorService implements IPipelineExecutorService {
    private get flutterExecutionService(): IFlutterExecutionService {
        return serviceContainer.get<IFlutterExecutionService>('FlutterExecutionService');
    }

    private get processManager(): IProcessManager {
        return serviceContainer.get<IProcessManager>('ProcessManager');
    }

    private get logger(): ILogger {
        return serviceContainer.get<ILogger>('Logger');
    }

    public async execute(pipeline: CommandPipeline, token?: vscode.CancellationToken): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const rootCwd = workspaceFolders ? workspaceFolders[0].uri.fsPath : undefined;

        this.logger.info(`\n--------------------------------`);
        this.logger.info(`Flutter Assistant`);
        this.logger.info(`--------------------------------`);
        this.logger.info(`Pipeline: ${pipeline.name}\n`);

        const startTime = Date.now();
        const totalSteps = pipeline.steps.length;

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: `Pipeline: ${pipeline.name}`,
            cancellable: true
        }, async (progress, builtinToken) => {
            
            // Link the provided token with the VS Code progress token
            const cancellationTokenSource = new vscode.CancellationTokenSource();
            if (token) {
                token.onCancellationRequested(() => cancellationTokenSource.cancel());
            }
            builtinToken.onCancellationRequested(() => cancellationTokenSource.cancel());

            for (let i = 0; i < totalSteps; i++) {
                if (cancellationTokenSource.token.isCancellationRequested) {
                    this.logger.warn(`Pipeline Cancelled at step [${i + 1}/${totalSteps}]`);
                    throw new Error('Pipeline Cancelled');
                }

                const step = pipeline.steps[i];
                
                // Update UI progress
                progress.report({
                    message: `Step ${i + 1}/${totalSteps}: ${step.name}`,
                    increment: (100 / totalSteps)
                });

                // Update Logger
                const commandStr = step.commandType === 'flutter' 
                    ? `flutter ${step.args.join(' ')}` 
                    : `${step.args.join(' ')}`;
                
                this.logger.info(`[${i + 1}/${totalSteps}] ${commandStr}`);

                // Determine working directory for this specific step
                let stepCwd = rootCwd;
                if (step.cwd && rootCwd) {
                    stepCwd = path.join(rootCwd, step.cwd);
                }

                try {
                    if (step.commandType === 'flutter') {
                        await this.flutterExecutionService.run(step.args, { 
                            cwd: stepCwd,
                            cancellationToken: cancellationTokenSource.token
                        });
                    } else {
                        // Shell command
                        const command = step.args[0];
                        const args = step.args.slice(1);
                        await this.processManager.spawnCommand(command, args, { 
                            cwd: stepCwd,
                            cancellationToken: cancellationTokenSource.token 
                        });
                    }
                    this.logger.info(`✓ Completed\n`);
                } catch (error: any) {
                    this.logger.error(`❌ Failed at step [${i + 1}/${totalSteps}]`);
                    
                    // Friendly CocoaPods check
                    if (step.commandType === 'shell' && step.args[0] === 'pod' && error.message && error.message.includes('ENOENT')) {
                        vscode.window.showErrorMessage('CocoaPods is not installed or not in your PATH. Please install it using: sudo gem install cocoapods');
                    }

                    throw error; // Abort pipeline
                }
            }
        });

        const elapsedMs = Date.now() - startTime;
        const minutes = Math.floor(elapsedMs / 60000);
        const seconds = Math.floor((elapsedMs % 60000) / 1000);
        const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

        this.logger.info(`✓ ${pipeline.name} Generated`);
        this.logger.info(`Total Time: ${timeStr}`);
        this.logger.info(`--------------------------------\n`);
    }
}
