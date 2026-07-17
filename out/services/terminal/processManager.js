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
                shell: true, // Use shell to resolve paths correctly (e.g., flutter in PATH)
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
                    reject(new errors_1.CommandCancelledError(`Cancelled: ${fullCommand}`));
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
                if (isCancelled)
                    return;
                this.logger.error(`Failed to start process: ${fullCommand}`, error);
                reject(error);
            });
            childProcess.on('close', (code) => {
                if (isCancelled)
                    return;
                if (code !== 0) {
                    this.logger.error(`Process exited with code ${code}: ${fullCommand}`);
                    return reject(new errors_1.CommandExecutionError(`Command failed: ${fullCommand}`, code, stdout, stderr));
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
exports.ProcessManager = ProcessManager;
//# sourceMappingURL=processManager.js.map