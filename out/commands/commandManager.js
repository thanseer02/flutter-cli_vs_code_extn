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
exports.CommandManager = void 0;
const vscode = __importStar(require("vscode"));
/**
 * Manages the registration and lifecycle of all VS Code commands exposed by the extension.
 */
class CommandManager {
    constructor() {
        this.commands = new Map();
    }
    /**
     * Registers a command with VS Code.
     * Overrides any existing command with the same ID.
     */
    registerCommand(context, command) {
        // Unregister if already exists
        this.unregisterCommand(command.id);
        const disposable = vscode.commands.registerCommand(command.id, async (...args) => {
            try {
                await command.execute(...args);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Error executing command ${command.id}: ${error.message}`);
            }
        });
        this.commands.set(command.id, disposable);
        context.subscriptions.push(disposable);
    }
    /**
     * Unregisters a command if it was previously registered.
     */
    unregisterCommand(commandId) {
        const command = this.commands.get(commandId);
        if (command) {
            command.dispose();
            this.commands.delete(commandId);
        }
    }
    /**
     * Disposes all registered commands.
     */
    dispose() {
        this.commands.forEach(command => command.dispose());
        this.commands.clear();
    }
}
exports.CommandManager = CommandManager;
//# sourceMappingURL=commandManager.js.map