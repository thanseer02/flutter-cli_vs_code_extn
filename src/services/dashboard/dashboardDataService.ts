import * as vscode from 'vscode';
import * as child_process from 'child_process';
import { promisify } from 'util';
import { IDashboardDataService } from '../../types';
import { DashboardData } from '../../models/dashboard';

const exec = promisify(child_process.exec);

export class DashboardDataService implements IDashboardDataService {
    
    public async getDashboardData(): Promise<DashboardData> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const cwd = workspaceFolders ? workspaceFolders[0].uri.fsPath : undefined;

        if (!cwd) {
            throw new Error('No workspace folder open.');
        }

        // Run data fetching in parallel for speed
        const [
            projectName,
            dependenciesCount,
            gitBranch,
            versions,
            devices
        ] = await Promise.all([
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

    private async getProjectName(cwd: string): Promise<string> {
        try {
            const pubspecUri = vscode.Uri.joinPath(vscode.Uri.file(cwd), 'pubspec.yaml');
            const data = await vscode.workspace.fs.readFile(pubspecUri);
            const content = data.toString();
            const match = content.match(/^name:\s*(.+)$/m);
            return match ? match[1].trim() : 'Unknown';
        } catch {
            return 'Unknown';
        }
    }

    private async getDependenciesCount(cwd: string): Promise<number> {
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
        } catch {
            return 0;
        }
    }

    private async getGitBranch(cwd: string): Promise<string> {
        try {
            const { stdout } = await exec('git rev-parse --abbrev-ref HEAD', { cwd });
            return stdout.trim();
        } catch {
            return 'No Git';
        }
    }

    private async getFlutterVersions(cwd: string): Promise<{ flutter: string; dart: string }> {
        try {
            const { stdout } = await exec('flutter --version', { cwd });
            const flutterMatch = stdout.match(/Flutter\s+([^\s]+)/);
            const dartMatch = stdout.match(/Dart\s+([^\s]+)/);
            
            return {
                flutter: flutterMatch ? flutterMatch[1] : 'Unknown',
                dart: dartMatch ? dartMatch[1] : 'Unknown'
            };
        } catch {
            return { flutter: 'Unknown', dart: 'Unknown' };
        }
    }

    private async getDevices(cwd: string): Promise<{ name: string; id: string; isEmulator: boolean }[]> {
        try {
            const { stdout } = await exec('flutter devices --machine', { cwd });
            const devicesData = JSON.parse(stdout);
            
            return devicesData.map((d: any) => ({
                name: d.name,
                id: d.id,
                isEmulator: d.isEmulator
            }));
        } catch {
            return [];
        }
    }
}
