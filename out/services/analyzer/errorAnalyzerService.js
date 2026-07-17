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
exports.ErrorAnalyzerService = void 0;
const vscode = __importStar(require("vscode"));
const errorRules_1 = require("./errorRules");
const serviceContainer_1 = require("../serviceContainer");
/**
 * Service responsible for taking raw terminal output (stdout/stderr)
 * in real-time and analyzing it to find known errors.
 */
class ErrorAnalyzerService {
    constructor() {
        this._onDidDetectError = new vscode.EventEmitter();
        this.onDidDetectError = this._onDidDetectError.event;
        this._disposables = [];
        const logger = serviceContainer_1.serviceContainer.get('Logger');
        this.attachToLogger(logger);
    }
    attachToLogger(logger) {
        if (this._logger === logger) {
            return;
        }
        this._logger = logger;
        this._disposables.forEach(disposable => disposable.dispose());
        this._disposables = [];
        this._disposables.push(logger.onDidLog((logChunk) => {
            this.analyzeChunk(logChunk);
        }));
    }
    analyzeChunk(chunk) {
        // Quick short-circuit if no obvious error indicators are present to save CPU
        const lowerChunk = chunk.toLowerCase();
        if (!lowerChunk.includes('error') && !lowerChunk.includes('exception') && !lowerChunk.includes('failed')) {
            return;
        }
        for (const rule of errorRules_1.errorRules) {
            const match = chunk.match(rule.pattern);
            if (match) {
                const analysis = rule.analyze(match);
                this._onDidDetectError.fire(analysis);
                return; // Fire for the first match
            }
        }
    }
    /**
     * Legacy analyze method, still useful for bulk post-mortem if needed.
     */
    analyze(rawLogs) {
        for (const rule of errorRules_1.errorRules) {
            const match = rawLogs.match(rule.pattern);
            if (match) {
                return rule.analyze(match);
            }
        }
        return null;
    }
    dispose() {
        this._onDidDetectError.dispose();
        this._disposables.forEach(d => d.dispose());
    }
}
exports.ErrorAnalyzerService = ErrorAnalyzerService;
//# sourceMappingURL=errorAnalyzerService.js.map