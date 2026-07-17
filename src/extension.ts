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
import { ILogger, IProcessManager, IWorkspaceService, IErrorAnalyzerService, IDashboardDataService, IFlutterExecutionService, IPipelineExecutorService } from './types';
import { ProcessManager } from './services/terminal/processManager';
import { FlutterExecutionService } from './services/flutter/flutterExecutionService';
import { FlutterService } from './services/flutter/flutterService';
import { WorkspaceService } from './services/workspace/workspaceService';
import { ErrorAnalyzerService } from './services/analyzer/errorAnalyzerService';
import { DashboardDataService } from './services/dashboard/dashboardDataService';
import { PipelineExecutorService } from './services/pipeline/pipelineExecutorService';
import { FlutterTreeProvider } from './providers/tree/flutterTreeProvider';
import { AnalysisWebview } from './providers/webview/analysisWebview';
import { PIPELINES, PIPELINE_STEPS } from './utils/pipelineSteps';

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
        const pipelineExecutorService = new PipelineExecutorService();
        const workspaceService = new WorkspaceService();
        const errorAnalyzerService = new ErrorAnalyzerService();
        const dashboardDataService = new DashboardDataService();
        
        // 2. Register Services in Dependency Injection Container
        serviceContainer.register<ILogger>('Logger', logger);
        serviceContainer.register<IProcessManager>('ProcessManager', processManager);
        serviceContainer.register<IFlutterExecutionService>('FlutterExecutionService', flutterExecutionService);
        serviceContainer.register<IPipelineExecutorService>('PipelineExecutorService', pipelineExecutorService);
        serviceContainer.register<IWorkspaceService>('WorkspaceService', workspaceService);
        serviceContainer.register<IErrorAnalyzerService>('ErrorAnalyzerService', errorAnalyzerService);
        serviceContainer.register<IDashboardDataService>('DashboardDataService', dashboardDataService);

        // Subscribe to real-time errors
        context.subscriptions.push(
            errorAnalyzerService.onDidDetectError((analysis) => {
                vscode.window.showErrorMessage(`❌ Issue Detected: ${analysis.problem}`);
                AnalysisWebview.render(analysis);
            })
        );

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
        // commandManager.registerCommand(context, new FlutterCommand(COMMANDS.RUN, PIPELINES.run));
        commandManager.registerCommand(context, new FlutterCommand(COMMANDS.BUILD_APK, PIPELINES.buildApk));
        commandManager.registerCommand(context, new FlutterCommand(COMMANDS.BUILD_IPA, PIPELINES.buildIpa));
        commandManager.registerCommand(context, new FlutterCommand(COMMANDS.BUILD_APPBUNDLE, PIPELINES.buildAppBundle));
        // commandManager.registerCommand(context, new FlutterCommand(COMMANDS.BUILD_WEB, PIPELINES.buildWeb));
        
        // Single-step commands registered as single-step pipelines
        commandManager.registerCommand(context, new FlutterCommand(COMMANDS.FLUTTER_CLEAN, { name: 'Flutter Clean', steps: [PIPELINE_STEPS.clean] }));
        commandManager.registerCommand(context, new FlutterCommand(COMMANDS.PUB_GET, { name: 'Pub Get', steps: [PIPELINE_STEPS.pubGet] }));
        // commandManager.registerCommand(context, new FlutterCommand(COMMANDS.PUB_UPGRADE, { name: 'Pub Upgrade', steps: [{ name: 'Upgrading packages...', commandType: 'flutter', args: ['pub', 'upgrade'] }] }));
        commandManager.registerCommand(context, new FlutterCommand(COMMANDS.DEVICES, { name: 'Devices', steps: [{ name: 'Fetching devices...', commandType: 'flutter', args: ['devices'] }] }));
        
        commandManager.registerCommand(context, new DoctorCommand(context.extensionUri));

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
