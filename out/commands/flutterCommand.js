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
exports.FlutterCommand = void 0;
const vscode = __importStar(require("vscode"));
const serviceContainer_1 = require("../services/serviceContainer");
const errors_1 = require("../utils/errors");
const analysisWebview_1 = require("../providers/webview/analysisWebview");
/**
 * A generic command to execute any Flutter Service method.
 */
class FlutterCommand {
    constructor(id, action, progressTitle) {
        this.id = id;
        this.action = action;
        this.progressTitle = progressTitle;
    }
    async execute() {
        const flutterService = serviceContainer_1.serviceContainer.get('FlutterService');
        const logger = serviceContainer_1.serviceContainer.get('Logger');
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
            }
            catch (error) {
                // Check if it's a known cancellation
                if (error.name === 'CommandCancelledError') {
                    vscode.window.showWarningMessage(`🛑 ${this.progressTitle} was cancelled.`);
                    return;
                }
                // If it's a CommandExecutionError, we have stdout/stderr to analyze
                if (error instanceof errors_1.CommandExecutionError) {
                    const analyzer = serviceContainer_1.serviceContainer.get('ErrorAnalyzerService');
                    // Combine stdout and stderr since some tools write errors to stdout
                    const rawLogs = `${error.stdout}\n${error.stderr}`;
                    const analysis = analyzer.analyze(rawLogs);
                    if (analysis) {
                        vscode.window.showErrorMessage(`❌ ${this.progressTitle} failed: ${analysis.problem}`);
                        analysisWebview_1.AnalysisWebview.render(analysis);
                        return;
                    }
                }
                // Fallback for unknown errors
                vscode.window.showErrorMessage(`❌ ${this.progressTitle} failed.`);
            }
        });
    }
}
exports.FlutterCommand = FlutterCommand;
//# sourceMappingURL=flutterCommand.js.map