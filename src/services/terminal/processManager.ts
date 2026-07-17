import * as cp from 'child_process';
import * as vscode from 'vscode';
import { ILogger, IProcessManager } from '../../types';
import { CommandOptions, CommandResult } from '../../models/command';
import { CommandCancelledError, CommandExecutionError } from '../../utils/errors';
import { serviceContainer } from '../serviceContainer';

/**
 * Manages spawning and tracking child processes.
 * Ensures output is streamed to the logger and handles cancellation gracefully.
 */
export class ProcessManager implements IProcessManager {
    private get logger(): ILogger {
        return serviceContainer.get<ILogger>('Logger');
    }

    /**
     * Spawns a shell command, capturing and streaming output.
     */
    async spawnCommand(command: string, args: string[], options?: CommandOptions): Promise<CommandResult> {
        return new Promise<CommandResult>((resolve, reject) => {
            const cwd = options?.cwd || (vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined);
            
            const fullCommand = `${command} ${args.join(' ')}`;
            this.logger.info(`> ${fullCommand}`);

            const childProcess = cp.spawn(command, args, {
                cwd,
                env: { ...process.env, ...options?.env },
                // Security Refactor: Removed shell: true to prevent injection. 
                // We assume 'flutter' is in the system PATH.
            });

            let stdout = '';
            let stderr = '';
            let isCancelled = false;

            // Handle Cancellation Token
            if (options?.cancellationToken) {
                options.cancellationToken.onCancellationRequested(() => {
                    isCancelled = true;
                    this.logger.warn(`Process cancelled: ${fullCommand}`);
                    // Ensure the entire process tree dies
                    // Note: In a robust cross-platform scenario, we might use the 'tree-kill' npm package.
                    // For this iteration, we use the standard kill.
                    childProcess.kill('SIGINT');
                    reject(new CommandCancelledError(`Cancelled: ${fullCommand}`));
                });
            }

            // Stream stdout
            childProcess.stdout.on('data', (data) => {
                const chunk = data.toString();
                stdout += chunk;
                // Append without newline if possible, but our logger interface assumes lines.
                // For a more advanced logger, we might implement `append` vs `appendLine`.
                // Here we just write chunks.
                this.logger.info(chunk.trimEnd());
            });

            // Stream stderr
            childProcess.stderr.on('data', (data) => {
                const chunk = data.toString();
                stderr += chunk;
                // Don't treat all stderr as an application error, it's just error stream data
                this.logger.warn(chunk.trimEnd());
            });

            childProcess.on('error', (error) => {
                if (isCancelled) return;
                this.logger.error(`Failed to start process: ${fullCommand}`, error);
                reject(error);
            });

            childProcess.on('close', (code) => {
                if (isCancelled) return;
                
                if (code !== 0) {
                    this.logger.error(`Process exited with code ${code}: ${fullCommand}`);
                    return reject(new CommandExecutionError(`Command failed: ${fullCommand}`, code, stdout, stderr));
                }

                this.logger.info(`Process completed successfully: ${fullCommand}`);
                resolve({
                    exitCode: code,
                    stdout,
                    stderr
                });
            });
        });
    }
}
