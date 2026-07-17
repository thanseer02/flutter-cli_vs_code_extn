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
exports.ProcessManager = void 0;
const cp = __importStar(require("child_process"));
const vscode = __importStar(require("vscode"));
const treeKill = require("tree-kill");
const errors_1 = require("../../utils/errors");
const serviceContainer_1 = require("../serviceContainer");
/**
 * Manages spawning and tracking child processes.
 * Ensures output is streamed to the logger and handles cancellation gracefully.
 */
class ProcessManager {
    get logger() {
        return serviceContainer_1.serviceContainer.get('Logger');
    }
    /**
     * Spawns a shell command, capturing and streaming output.
     */
    async spawnCommand(command, args, options) {
        return new Promise((resolve, reject) => {
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
            const stdoutBuffer = [];
            const stderrBuffer = [];
            const appendToBuffer = (buffer, chunk) => {
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (buffer.length >= maxLogLines)
                        buffer.shift();
                    buffer.push(line);
                }
            };
            let isCancelled = false;
            let timeoutHandle;
            const cleanup = () => {
                if (timeoutHandle)
                    clearTimeout(timeoutHandle);
            };
            const doKill = (reason) => {
                if (isCancelled)
                    return;
                isCancelled = true;
                this.logger.warn(`Process terminating: ${reason}`);
                if (childProcess.pid) {
                    treeKill(childProcess.pid, 'SIGKILL', (err) => {
                        if (err)
                            this.logger.error(`Failed to kill process tree: ${err.message}`, err);
                    });
                }
                cleanup();
                reject(new errors_1.CommandCancelledError(`Terminated: ${reason}`));
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
                if (isCancelled)
                    return;
                this.logger.error(`Failed to start process: ${fullCommand}`, error);
                reject(error);
            });
            childProcess.on('close', (code) => {
                cleanup();
                if (isCancelled)
                    return;
                const finalStdout = stdoutBuffer.join('\n');
                const finalStderr = stderrBuffer.join('\n');
                if (code !== 0) {
                    this.logger.error(`Process exited with code ${code}: ${fullCommand}`);
                    return reject(new errors_1.CommandExecutionError(`Command failed: ${fullCommand}`, code, finalStdout, finalStderr));
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
exports.ProcessManager = ProcessManager;
//# sourceMappingURL=processManager.js.map