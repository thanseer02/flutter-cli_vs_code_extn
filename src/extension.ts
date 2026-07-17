import * as vscode from 'vscode';
import { OutputChannelLogger } from './utils/logger';
import { serviceContainer } from './services/serviceContainer';
import { CommandManager } from './commands/commandManager';
import { HelloWorldCommand } from './commands/helloWorldCommand';
import { ClearLogsCommand } from './commands/clearLogsCommand';
import { ExportLogsCommand } from './commands/exportLogsCommand';
import { ILogger, IProcessManager, IFlutterService } from './types';
import { ProcessManager } from './services/terminal/processManager';
import { FlutterService } from './services/flutter/flutterService';

/**
 * This method is called when your extension is activated.
 * The extension is activated the very first time the command is executed.
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Activating "flutter-cli-assistant"...');

    try {
        // 1. Initialize Core Services
        const logger = new OutputChannelLogger();
        const processManager = new ProcessManager();
        const flutterService = new FlutterService();
        
        // 2. Register Services in Dependency Injection Container
        serviceContainer.register<ILogger>('Logger', logger);
        serviceContainer.register<IProcessManager>('ProcessManager', processManager);
        serviceContainer.register<IFlutterService>('FlutterService', flutterService);

        logger.info('Flutter CLI Assistant is starting up...');

        // 3. Initialize Command Manager
        const commandManager = new CommandManager();
        context.subscriptions.push(commandManager);

        // 4. Register Commands
        commandManager.registerCommand(context, new HelloWorldCommand());
        commandManager.registerCommand(context, new ClearLogsCommand());
        commandManager.registerCommand(context, new ExportLogsCommand());

        logger.info('Flutter CLI Assistant activated successfully.');
    } catch (error: any) {
        console.error('Failed to activate Flutter CLI Assistant', error);
        vscode.window.showErrorMessage(`Flutter CLI Assistant activation failed: ${error.message}`);
    }
}

/**
 * This method is called when your extension is deactivated.
 * Clean up resources here.
 */
export function deactivate() {
    console.log('Deactivating "flutter-cli-assistant"...');
    // If we have long running processes, kill them here.
}
