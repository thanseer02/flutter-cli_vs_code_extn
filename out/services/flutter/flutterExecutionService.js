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
exports.FlutterExecutionService = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const child_process = __importStar(require("child_process"));
const util_1 = require("util");
const serviceContainer_1 = require("../serviceContainer");
const exec = (0, util_1.promisify)(child_process.exec);
class FlutterExecutionService {
    get processManager() {
        return serviceContainer_1.serviceContainer.get('ProcessManager');
    }
    /**
     * Resolves the correct execution string (fvm flutter, custom path, or system flutter).
     */
    async resolveFlutterCommand(cwd) {
        // Priority 1: Check for FVM
        if (cwd) {
            try {
                const fvmConfigPath = vscode.Uri.joinPath(vscode.Uri.file(cwd), '.fvm', 'fvm_config.json');
                await vscode.workspace.fs.stat(fvmConfigPath);
                // If it exists and didn't throw, we use FVM
                return {
                    command: 'fvm',
                    args: ['flutter']
                };
            }
            catch {
                // No fvm config found, fall through
            }
        }
        // Priority 2: Custom SDK path in settings
        const config = vscode.workspace.getConfiguration('flutter-cli-assistant');
        const customPath = config.get('flutterSdkPath');
        if (customPath && customPath.trim().length > 0) {
            // Need to append 'bin/flutter' or just use the path if they pointed directly to the binary
            // Standardizing on pointing to the SDK root folder like the official extension
            const flutterBinary = process.platform === 'win32' ? 'flutter.bat' : 'flutter';
            return {
                command: path.join(customPath.trim(), 'bin', flutterBinary),
                args: []
            };
        }
        // Priority 3: System default
        return {
            command: 'flutter',
            args: []
        };
    }
    /**
     * Executes a flutter command using the ProcessManager (streaming to console).
     */
    async run(args, options) {
        const cwd = options?.cwd || (vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined);
        const resolved = await this.resolveFlutterCommand(cwd);
        const finalArgs = [...resolved.args, ...args];
        return this.processManager.spawnCommand(resolved.command, finalArgs, options);
    }
    /**
     * Executes a flutter command silently using child_process.exec.
     * Useful for quick data fetching (like flutter --version).
     */
    async runRaw(args, options) {
        const cwd = options?.cwd || (vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined);
        const resolved = await this.resolveFlutterCommand(cwd);
        const fullCommand = `${resolved.command} ${resolved.args.concat(args).join(' ')}`;
        return exec(fullCommand, { cwd, env: { ...process.env, ...options?.env } });
    }
    async resolveDartCommand(cwd) {
        // Priority 1: Check for FVM
        if (cwd) {
            try {
                const fvmConfigPath = vscode.Uri.joinPath(vscode.Uri.file(cwd), '.fvm', 'fvm_config.json');
                await vscode.workspace.fs.stat(fvmConfigPath);
                return {
                    command: 'fvm',
                    args: ['dart']
                };
            }
            catch { }
        }
        // Priority 2: Custom SDK path
        const config = vscode.workspace.getConfiguration('flutter-cli-assistant');
        const customPath = config.get('flutterSdkPath');
        if (customPath && customPath.trim().length > 0) {
            const dartBinary = process.platform === 'win32' ? 'dart.bat' : 'dart';
            return {
                command: path.join(customPath.trim(), 'bin', dartBinary),
                args: []
            };
        }
        // Priority 3: System default
        return {
            command: 'dart',
            args: []
        };
    }
    async runDart(args, options) {
        const cwd = options?.cwd || (vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined);
        const resolved = await this.resolveDartCommand(cwd);
        const finalArgs = [...resolved.args, ...args];
        return this.processManager.spawnCommand(resolved.command, finalArgs, options);
    }
    async runDartRaw(args, options) {
        const cwd = options?.cwd || (vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined);
        const resolved = await this.resolveDartCommand(cwd);
        const fullCommand = `${resolved.command} ${resolved.args.concat(args).join(' ')}`;
        return exec(fullCommand, { cwd, env: { ...process.env, ...options?.env } });
    }
}
exports.FlutterExecutionService = FlutterExecutionService;
//# sourceMappingURL=flutterExecutionService.js.map