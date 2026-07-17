import * as vscode from 'vscode';
import * as child_process from 'child_process';
import { promisify } from 'util';
import { IDashboardDataService, IFlutterExecutionService } from '../../types';
import { DashboardData } from '../../models/dashboard';
import { serviceContainer } from '../serviceContainer';

const exec = promisify(child_process.exec);

export class DashboardDataService implements IDashboardDataService {
    
    private get executionService(): IFlutterExecutionService {
        return serviceContainer.get<IFlutterExecutionService>('FlutterExecutionService');
    }

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
            devices,
            appVersion,
            bundleName,
            baseUrl
        ] = await Promise.all([
            this.getProjectName(cwd),
            this.getDependenciesCount(cwd),
            this.getGitBranch(cwd),
            this.getFlutterVersions(cwd),
            this.getDevices(cwd),
            this.getAppVersion(cwd),
            this.getBundleName(cwd),
            this.getBaseUrl(cwd)
        ]);

        return {
            projectName,
            dependenciesCount,
            gitBranch,
            flutterVersion: versions.flutter,
            dartVersion: versions.dart,
            androidVersion: appVersion,
            iosVersion: appVersion,
            baseUrl,
            bundleName,
            devices,
            // For now, we stub these out. In a real production app, we would use 
            // context.workspaceState to store and retrieve these arrays across sessions.
            recentCommands: ['build apk', 'build ipa', 'pub get', 'clean'],
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

    private async getAppVersion(cwd: string): Promise<string> {
        try {
            const pubspecUri = vscode.Uri.joinPath(vscode.Uri.file(cwd), 'pubspec.yaml');
            const data = await vscode.workspace.fs.readFile(pubspecUri);
            const content = data.toString();
            const match = content.match(/^version:\s*(.+)$/m);
            return match ? match[1].trim() : 'Unknown';
        } catch {
            return 'Unknown';
        }
    }

    private async getBundleName(cwd: string): Promise<string> {
        try {
            const buildGradleUri = vscode.Uri.joinPath(vscode.Uri.file(cwd), 'android', 'app', 'build.gradle');
            const data = await vscode.workspace.fs.readFile(buildGradleUri);
            const content = data.toString();
            const applicationIdMatch = content.match(/applicationId\s+['"]([^'"]+)['"]/);
            if (applicationIdMatch) {
                return applicationIdMatch[1];
            }
            const namespaceMatch = content.match(/namespace\s+['"]([^'"]+)['"]/);
            if (namespaceMatch) {
                return namespaceMatch[1];
            }
        } catch {}
        
        try {
            const pbxprojUri = vscode.Uri.joinPath(vscode.Uri.file(cwd), 'ios', 'Runner.xcodeproj', 'project.pbxproj');
            const data = await vscode.workspace.fs.readFile(pbxprojUri);
            const content = data.toString();
            const bundleMatch = content.match(/PRODUCT_BUNDLE_IDENTIFIER\s*=\s*([^;]+);/);
            if (bundleMatch) {
                return bundleMatch[1].replace(/['"]/g, '').trim();
            }
        } catch {}

        return 'Unknown';
    }

    private async getBaseUrl(cwd: string): Promise<string> {
        try {
            const envUri = vscode.Uri.joinPath(vscode.Uri.file(cwd), '.env');
            try {
                const data = await vscode.workspace.fs.readFile(envUri);
                const content = data.toString();
                const match = content.match(/^(?:BASE_URL|API_URL)\s*=\s*(.+)$/im);
                if (match) {
                    return match[1].replace(/['"]/g, '').trim();
                }
            } catch {}
            
            const files = await vscode.workspace.findFiles(new vscode.RelativePattern(cwd, 'lib/**/{*constants*,*config*,*api*,*env*,main}.dart'), null, 20);
            for (const file of files) {
                const data = await vscode.workspace.fs.readFile(file);
                const content = data.toString();
                const match = content.match(/(?:baseUrl|BASE_URL|apiUrl|API_URL)\s*[:=]\s*['"](http[^'"]+)['"]/i);
                if (match) {
                    return match[1].trim();
                }
            }
        } catch {}
        
        return 'Not Found (Define in .env)';
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
            const { stdout } = await this.executionService.runRaw(['--version'], { cwd });
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
            const { stdout } = await this.executionService.runRaw(['devices', '--machine'], { cwd });
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
