import * as vscode from 'vscode';
import { ConsoleLogger } from './utils/consoleLogger';
import { serviceContainer } from './services/serviceContainer';
import { CommandManager } from './commands/commandManager';
import { HelloWorldCommand } from './commands/helloWorldCommand';
import { ClearLogsCommand } from './commands/clearLogsCommand';
import { ExportLogsCommand } from './commands/exportLogsCommand';
import { ShowLogsCommand } from './commands/showLogsCommand';
import { DoctorCommand } from './commands/doctorCommand';
import { DashboardCommand } from './commands/dashboardCommand';
import { FlutterCommand } from './commands/flutterCommand';
import { COMMANDS } from './constants';
import { ILogger, IProcessManager, IFlutterService, IWorkspaceService, IErrorAnalyzerService, IDashboardDataService, IFlutterExecutionService } from './types';
import { ProcessManager } from './services/terminal/processManager';
import { FlutterExecutionService } from './services/flutter/flutterExecutionService';
import { FlutterService } from './services/flutter/flutterService';
import { WorkspaceService } from './services/workspace/workspaceService';
import { ErrorAnalyzerService } from './services/analyzer/errorAnalyzerService';
import { DashboardDataService } from './services/dashboard/dashboardDataService';
import { FlutterTreeProvider } from './providers/tree/flutterTreeProvider';

/**
 * This method is called when your extension is activated.
 * The extension is activated the very first time the command is executed.
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Activating "flutter-cli-assistant"...');

    try {
        // 1. Initialize Core Services
        const logger = new ConsoleLogger();
        const processManager = new ProcessManager();
        const flutterExecutionService = new FlutterExecutionService();
        const flutterService = new FlutterService();
        const workspaceService = new WorkspaceService();
        const errorAnalyzerService = new ErrorAnalyzerService();
        const dashboardDataService = new DashboardDataService();
        
        // 2. Register Services in Dependency Injection Container
        serviceContainer.register<ILogger>('Logger', logger);
        serviceContainer.register<IProcessManager>('ProcessManager', processManager);
        serviceContainer.register<IFlutterExecutionService>('FlutterExecutionService', flutterExecutionService);
        serviceContainer.register<IFlutterService>('FlutterService', flutterService);
        serviceContainer.register<IWorkspaceService>('WorkspaceService', workspaceService);
        serviceContainer.register<IErrorAnalyzerService>('ErrorAnalyzerService', errorAnalyzerService);
        serviceContainer.register<IDashboardDataService>('DashboardDataService', dashboardDataService);

        logger.info('Flutter CLI Assistant is starting up...');
        
        // 3. Validate Workspace
        workspaceService.validateWorkspace();

        // 4. Initialize Command Manager
        const commandManager = new CommandManager();
        context.subscriptions.push(commandManager);

        // 5. Register Commands
        commandManager.registerCommand(context, new HelloWorldCommand());
        commandManager.registerCommand(context, new ClearLogsCommand());
        commandManager.registerCommand(context, new ExportLogsCommand());
        commandManager.registerCommand(context, new ShowLogsCommand(context.extensionUri));
        commandManager.registerCommand(context, new DashboardCommand());
        
        // Register generic Flutter commands
        commandManager.registerCommand(context, new FlutterCommand(COMMANDS.RUN, 'run', 'Flutter Run'));
        commandManager.registerCommand(context, new FlutterCommand(COMMANDS.BUILD_APK, 'buildApk', 'Building APK'));
        commandManager.registerCommand(context, new FlutterCommand(COMMANDS.BUILD_APPBUNDLE, 'buildAppBundle', 'Building AppBundle'));
        commandManager.registerCommand(context, new FlutterCommand(COMMANDS.BUILD_WEB, 'buildWeb', 'Building Web'));
        commandManager.registerCommand(context, new FlutterCommand(COMMANDS.FLUTTER_CLEAN, 'clean', 'Flutter Clean'));
        commandManager.registerCommand(context, new FlutterCommand(COMMANDS.PUB_GET, 'pubGet', 'Pub Get'));
        commandManager.registerCommand(context, new FlutterCommand(COMMANDS.PUB_UPGRADE, 'pubUpgrade', 'Pub Upgrade'));
        commandManager.registerCommand(context, new DoctorCommand(context.extensionUri));
        commandManager.registerCommand(context, new FlutterCommand(COMMANDS.DEVICES, 'devices', 'Flutter Devices'));

        // 6. Register Sidebar Tree Provider
        const flutterTreeProvider = new FlutterTreeProvider();
        vscode.window.registerTreeDataProvider('flutter-cli-assistant.sidebar', flutterTreeProvider);
        
        // Re-render tree when workspace state changes (optional, but good practice)
        workspaceService.onDidChangeProjectState(() => {
            flutterTreeProvider.refresh();
        });

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
