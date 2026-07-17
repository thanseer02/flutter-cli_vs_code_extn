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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const consoleLogger_1 = require("./utils/consoleLogger");
const serviceContainer_1 = require("./services/serviceContainer");
const commandManager_1 = require("./commands/commandManager");
const helloWorldCommand_1 = require("./commands/helloWorldCommand");
const clearLogsCommand_1 = require("./commands/clearLogsCommand");
const exportLogsCommand_1 = require("./commands/exportLogsCommand");
const showLogsCommand_1 = require("./commands/showLogsCommand");
const doctorCommand_1 = require("./commands/doctorCommand");
const dashboardCommand_1 = require("./commands/dashboardCommand");
const flutterCommand_1 = require("./commands/flutterCommand");
const constants_1 = require("./constants");
const processManager_1 = require("./services/terminal/processManager");
const flutterExecutionService_1 = require("./services/flutter/flutterExecutionService");
const workspaceService_1 = require("./services/workspace/workspaceService");
const errorAnalyzerService_1 = require("./services/analyzer/errorAnalyzerService");
const dashboardDataService_1 = require("./services/dashboard/dashboardDataService");
const pipelineExecutorService_1 = require("./services/pipeline/pipelineExecutorService");
const flutterTreeProvider_1 = require("./providers/tree/flutterTreeProvider");
const pipelineSteps_1 = require("./utils/pipelineSteps");
/**
 * This method is called when your extension is activated.
 * The extension is activated the very first time the command is executed.
 */
function activate(context) {
    console.log('Activating "flutter-cli-assistant"...');
    try {
        // 1. Initialize Core Services
        const logger = new consoleLogger_1.ConsoleLogger();
        const processManager = new processManager_1.ProcessManager();
        const flutterExecutionService = new flutterExecutionService_1.FlutterExecutionService();
        const pipelineExecutorService = new pipelineExecutorService_1.PipelineExecutorService();
        const workspaceService = new workspaceService_1.WorkspaceService();
        const errorAnalyzerService = new errorAnalyzerService_1.ErrorAnalyzerService();
        const dashboardDataService = new dashboardDataService_1.DashboardDataService();
        // 2. Register Services in Dependency Injection Container
        serviceContainer_1.serviceContainer.register('Logger', logger);
        serviceContainer_1.serviceContainer.register('ProcessManager', processManager);
        serviceContainer_1.serviceContainer.register('FlutterExecutionService', flutterExecutionService);
        serviceContainer_1.serviceContainer.register('PipelineExecutorService', pipelineExecutorService);
        serviceContainer_1.serviceContainer.register('WorkspaceService', workspaceService);
        serviceContainer_1.serviceContainer.register('ErrorAnalyzerService', errorAnalyzerService);
        serviceContainer_1.serviceContainer.register('DashboardDataService', dashboardDataService);
        logger.info('Flutter CLI Assistant is starting up...');
        // 3. Validate Workspace
        workspaceService.validateWorkspace();
        // 4. Initialize Command Manager
        const commandManager = new commandManager_1.CommandManager();
        context.subscriptions.push(commandManager);
        // 5. Register Commands
        commandManager.registerCommand(context, new helloWorldCommand_1.HelloWorldCommand());
        commandManager.registerCommand(context, new clearLogsCommand_1.ClearLogsCommand());
        commandManager.registerCommand(context, new exportLogsCommand_1.ExportLogsCommand());
        commandManager.registerCommand(context, new showLogsCommand_1.ShowLogsCommand(context.extensionUri));
        commandManager.registerCommand(context, new dashboardCommand_1.DashboardCommand());
        // Register generic Flutter commands
        commandManager.registerCommand(context, new flutterCommand_1.FlutterCommand(constants_1.COMMANDS.RUN, pipelineSteps_1.PIPELINES.run));
        commandManager.registerCommand(context, new flutterCommand_1.FlutterCommand(constants_1.COMMANDS.BUILD_APK, pipelineSteps_1.PIPELINES.buildApk));
        commandManager.registerCommand(context, new flutterCommand_1.FlutterCommand(constants_1.COMMANDS.BUILD_IPA, pipelineSteps_1.PIPELINES.buildIpa));
        commandManager.registerCommand(context, new flutterCommand_1.FlutterCommand(constants_1.COMMANDS.BUILD_APPBUNDLE, pipelineSteps_1.PIPELINES.buildAppBundle));
        commandManager.registerCommand(context, new flutterCommand_1.FlutterCommand(constants_1.COMMANDS.BUILD_WEB, pipelineSteps_1.PIPELINES.buildWeb));
        // Single-step commands registered as single-step pipelines
        commandManager.registerCommand(context, new flutterCommand_1.FlutterCommand(constants_1.COMMANDS.FLUTTER_CLEAN, { name: 'Flutter Clean', steps: [pipelineSteps_1.PIPELINE_STEPS.clean] }));
        commandManager.registerCommand(context, new flutterCommand_1.FlutterCommand(constants_1.COMMANDS.PUB_GET, { name: 'Pub Get', steps: [pipelineSteps_1.PIPELINE_STEPS.pubGet] }));
        commandManager.registerCommand(context, new flutterCommand_1.FlutterCommand(constants_1.COMMANDS.PUB_UPGRADE, { name: 'Pub Upgrade', steps: [{ name: 'Upgrading packages...', commandType: 'flutter', args: ['pub', 'upgrade'] }] }));
        commandManager.registerCommand(context, new flutterCommand_1.FlutterCommand(constants_1.COMMANDS.DEVICES, { name: 'Devices', steps: [{ name: 'Fetching devices...', commandType: 'flutter', args: ['devices'] }] }));
        commandManager.registerCommand(context, new doctorCommand_1.DoctorCommand(context.extensionUri));
        // 6. Register Sidebar Tree Provider
        const flutterTreeProvider = new flutterTreeProvider_1.FlutterTreeProvider();
        vscode.window.registerTreeDataProvider('flutter-cli-assistant.sidebar', flutterTreeProvider);
        // Re-render tree when workspace state changes (optional, but good practice)
        workspaceService.onDidChangeProjectState(() => {
            flutterTreeProvider.refresh();
        });
        logger.info('Flutter CLI Assistant activated successfully.');
    }
    catch (error) {
        console.error('Failed to activate Flutter CLI Assistant', error);
        vscode.window.showErrorMessage(`Flutter CLI Assistant activation failed: ${error.message}`);
    }
}
/**
 * This method is called when your extension is deactivated.
 * Clean up resources here.
 */
function deactivate() {
    console.log('Deactivating "flutter-cli-assistant"...');
    // If we have long running processes, kill them here.
}
//# sourceMappingURL=extension.js.map