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
/**
 * A generic command to execute a Flutter Build Pipeline.
 */
class FlutterCommand {
    constructor(id, pipeline) {
        this.id = id;
        this.pipeline = pipeline;
    }
    async execute() {
        const executor = serviceContainer_1.serviceContainer.get('PipelineExecutorService');
        const logger = serviceContainer_1.serviceContainer.get('Logger');
        // Always show the output channel when starting a command
        logger.show();
        try {
            await executor.execute(this.pipeline);
            vscode.window.showInformationMessage(`✅ ${this.pipeline.name} completed successfully.`);
        }
        catch (error) {
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
exports.FlutterCommand = FlutterCommand;
//# sourceMappingURL=flutterCommand.js.map