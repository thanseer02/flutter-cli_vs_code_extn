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
exports.WorkspaceService = void 0;
const vscode = __importStar(require("vscode"));
const serviceContainer_1 = require("../serviceContainer");
/**
 * Service responsible for analyzing the VS Code workspace to determine
 * if the current folder is a valid Flutter project.
 */
class WorkspaceService {
    constructor() {
        this._isFlutterProject = false;
        this._onDidChangeProjectState = new vscode.EventEmitter();
        this.onDidChangeProjectState = this._onDidChangeProjectState.event;
        // Listen for workspace folder changes
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            this.validateWorkspace();
        });
    }
    get isFlutterProject() {
        return this._isFlutterProject;
    }
    get logger() {
        return serviceContainer_1.serviceContainer.get('Logger');
    }
    /**
     * Checks the workspace for Flutter-specific files and folders.
     */
    async validateWorkspace() {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
            this.setProjectState(false);
            return false;
        }
        const rootUri = folders[0].uri;
        let isFlutter = true;
        const requiredPaths = [
            'pubspec.yaml',
            'lib',
            'android',
            'ios'
        ];
        for (const path of requiredPaths) {
            const fileUri = vscode.Uri.joinPath(rootUri, path);
            try {
                await vscode.workspace.fs.stat(fileUri);
            }
            catch (error) {
                // If stat throws, the file/folder does not exist
                isFlutter = false;
                break;
            }
        }
        this.setProjectState(isFlutter);
        if (!isFlutter) {
            this.logger.warn('Current workspace is not a standard Flutter project. Missing pubspec.yaml, lib/, android/, or ios/.');
        }
        else {
            this.logger.info('Flutter project detected successfully.');
        }
        return isFlutter;
    }
    /**
     * Updates the internal state, fires the event, and sets a VS Code context key.
     */
    setProjectState(isFlutter) {
        if (this._isFlutterProject !== isFlutter) {
            this._isFlutterProject = isFlutter;
            this._onDidChangeProjectState.fire(isFlutter);
            // Set context key so we can use it in package.json to conditionally show UI
            vscode.commands.executeCommand('setContext', 'flutter-cli-assistant.isFlutterProject', isFlutter);
        }
    }
}
exports.WorkspaceService = WorkspaceService;
//# sourceMappingURL=workspaceService.js.map