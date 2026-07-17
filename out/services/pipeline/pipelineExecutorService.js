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
exports.PipelineExecutorService = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const serviceContainer_1 = require("../serviceContainer");
class PipelineExecutorService {
    get flutterExecutionService() {
        return serviceContainer_1.serviceContainer.get('FlutterExecutionService');
    }
    get processManager() {
        return serviceContainer_1.serviceContainer.get('ProcessManager');
    }
    get logger() {
        return serviceContainer_1.serviceContainer.get('Logger');
    }
    async execute(pipeline, token) {
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
                    }
                    else {
                        // Shell command
                        const command = step.args[0];
                        const args = step.args.slice(1);
                        await this.processManager.spawnCommand(command, args, {
                            cwd: stepCwd,
                            cancellationToken: cancellationTokenSource.token
                        });
                    }
                    this.logger.info(`✓ Completed\n`);
                }
                catch (error) {
                    this.logger.error(`❌ Failed at step [${i + 1}/${totalSteps}]`);
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
exports.PipelineExecutorService = PipelineExecutorService;
//# sourceMappingURL=pipelineExecutorService.js.map