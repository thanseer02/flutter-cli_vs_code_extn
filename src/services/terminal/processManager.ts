import * as cp from 'child_process';
import * as vscode from 'vscode';
import treeKill = require('tree-kill');
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

            // Use Ring Buffers to prevent OOM on massive logs. 
            // 5000 lines max for the final output string.
            const maxLogLines = 5000;
            const stdoutBuffer: string[] = [];
            const stderrBuffer: string[] = [];
            
            const appendToBuffer = (buffer: string[], chunk: string) => {
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (buffer.length >= maxLogLines) buffer.shift();
                    buffer.push(line);
                }
            };

            let isCancelled = false;
            let timeoutHandle: NodeJS.Timeout | undefined;

            const cleanup = () => {
                if (timeoutHandle) clearTimeout(timeoutHandle);
            };

            const doKill = (reason: string) => {
                if (isCancelled) return;
                isCancelled = true;
                this.logger.warn(`Process terminating: ${reason}`);
                if (childProcess.pid) {
                    treeKill(childProcess.pid, 'SIGKILL', (err?: Error) => {
                        if (err) this.logger.error(`Failed to kill process tree: ${err.message}`, err);
                    });
                }
                cleanup();
                reject(new CommandCancelledError(`Terminated: ${reason}`));
            };

            if (options?.timeoutMs) {
                timeoutHandle = setTimeout(() => {
                    doKill(`Timeout of ${options.timeoutMs}ms exceeded`);
                }, options.timeoutMs);
            }

            // Handle Cancellation Token
            if (options?.cancellationToken) {
                options.cancellationToken.onCancellationRequested(() => {
                    doKill('User cancelled');
                });
            }

            // Stream stdout
            childProcess.stdout.on('data', (data) => {
                const chunk = data.toString();
                appendToBuffer(stdoutBuffer, chunk);
                this.logger.info(chunk.trimEnd());
            });

            // Stream stderr
            childProcess.stderr.on('data', (data) => {
                const chunk = data.toString();
                appendToBuffer(stderrBuffer, chunk);
                this.logger.warn(chunk.trimEnd());
            });

            childProcess.on('error', (error) => {
                cleanup();
                if (isCancelled) return;
                this.logger.error(`Failed to start process: ${fullCommand}`, error);
                reject(error);
            });

            childProcess.on('close', (code) => {
                cleanup();
                if (isCancelled) return;
                
                const finalStdout = stdoutBuffer.join('\n');
                const finalStderr = stderrBuffer.join('\n');
                
                if (code !== 0) {
                    this.logger.error(`Process exited with code ${code}: ${fullCommand}`);
                    return reject(new CommandExecutionError(`Command failed: ${fullCommand}`, code, finalStdout, finalStderr));
                }

                this.logger.info(`Process completed successfully: ${fullCommand}`);
                resolve({
                    exitCode: code,
                    stdout: finalStdout,
                    stderr: finalStderr
                });
            });
        });
    }
}
