import * as vscode from 'vscode';
import { ICommand } from '../types';

/**
 * Manages the registration and lifecycle of all VS Code commands exposed by the extension.
 */
export class CommandManager {
    private commands: Map<string, vscode.Disposable> = new Map();

    /**
     * Registers a command with VS Code.
     * Overrides any existing command with the same ID.
     */
    registerCommand(context: vscode.ExtensionContext, command: ICommand): void {
        // Unregister if already exists
        this.unregisterCommand(command.id);

        const disposable = vscode.commands.registerCommand(command.id, async (...args: any[]) => {
            try {
                await command.execute(...args);
            } catch (error: any) {
                vscode.window.showErrorMessage(`Error executing command ${command.id}: ${error.message}`);
            }
        });

        this.commands.set(command.id, disposable);
        context.subscriptions.push(disposable);
    }

    /**
     * Unregisters a command if it was previously registered.
     */
    unregisterCommand(commandId: string): void {
        const command = this.commands.get(commandId);
        if (command) {
            command.dispose();
            this.commands.delete(commandId);
        }
    }

    /**
     * Disposes all registered commands.
     */
    dispose(): void {
        this.commands.forEach(command => command.dispose());
        this.commands.clear();
    }
}
