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
exports.DashboardDataService = void 0;
const vscode = __importStar(require("vscode"));
const child_process = __importStar(require("child_process"));
const util_1 = require("util");
const serviceContainer_1 = require("../serviceContainer");
const exec = (0, util_1.promisify)(child_process.exec);
class DashboardDataService {
    get executionService() {
        return serviceContainer_1.serviceContainer.get('FlutterExecutionService');
    }
    async getDashboardData() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const cwd = workspaceFolders ? workspaceFolders[0].uri.fsPath : undefined;
        if (!cwd) {
            throw new Error('No workspace folder open.');
        }
        // Run data fetching in parallel for speed
        const [projectName, dependenciesCount, gitBranch, versions, devices] = await Promise.all([
            this.getProjectName(cwd),
            this.getDependenciesCount(cwd),
            this.getGitBranch(cwd),
            this.getFlutterVersions(cwd),
            this.getDevices(cwd)
        ]);
        return {
            projectName,
            dependenciesCount,
            gitBranch,
            flutterVersion: versions.flutter,
            dartVersion: versions.dart,
            devices,
            // For now, we stub these out. In a real production app, we would use 
            // context.workspaceState to store and retrieve these arrays across sessions.
            recentCommands: ['build apk', 'pub get', 'clean'],
            latestBuildStatus: 'idle'
        };
    }
    async getProjectName(cwd) {
        try {
            const pubspecUri = vscode.Uri.joinPath(vscode.Uri.file(cwd), 'pubspec.yaml');
            const data = await vscode.workspace.fs.readFile(pubspecUri);
            const content = data.toString();
            const match = content.match(/^name:\s*(.+)$/m);
            return match ? match[1].trim() : 'Unknown';
        }
        catch {
            return 'Unknown';
        }
    }
    async getDependenciesCount(cwd) {
        try {
            const pubspecUri = vscode.Uri.joinPath(vscode.Uri.file(cwd), 'pubspec.yaml');
            const data = await vscode.workspace.fs.readFile(pubspecUri);
            const content = data.toString();
            // Very naive way: count lines under dependencies: until dev_dependencies: or empty line
            const match = content.match(/dependencies:([\s\S]*?)dev_dependencies:/);
            if (match) {
                const depsBlock = match[1];
                const deps = depsBlock.split('\n').filter(line => line.trim().startsWith('^') || line.includes(':'));
                // Just a rough estimate for the UI
                return deps.length;
            }
            return 0;
        }
        catch {
            return 0;
        }
    }
    async getGitBranch(cwd) {
        try {
            const { stdout } = await exec('git rev-parse --abbrev-ref HEAD', { cwd });
            return stdout.trim();
        }
        catch {
            return 'No Git';
        }
    }
    async getFlutterVersions(cwd) {
        try {
            const { stdout } = await this.executionService.runRaw(['--version'], { cwd });
            const flutterMatch = stdout.match(/Flutter\s+([^\s]+)/);
            const dartMatch = stdout.match(/Dart\s+([^\s]+)/);
            return {
                flutter: flutterMatch ? flutterMatch[1] : 'Unknown',
                dart: dartMatch ? dartMatch[1] : 'Unknown'
            };
        }
        catch {
            return { flutter: 'Unknown', dart: 'Unknown' };
        }
    }
    async getDevices(cwd) {
        try {
            const { stdout } = await this.executionService.runRaw(['devices', '--machine'], { cwd });
            const devicesData = JSON.parse(stdout);
            return devicesData.map((d) => ({
                name: d.name,
                id: d.id,
                isEmulator: d.isEmulator
            }));
        }
        catch {
            return [];
        }
    }
}
exports.DashboardDataService = DashboardDataService;
//# sourceMappingURL=dashboardDataService.js.map