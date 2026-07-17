import * as vscode from 'vscode';

export interface ProjectInfo {
    projectName: string;
    dependenciesCount: number;
}

export class ProjectInfoService {
    public async getProjectInfo(cwd: string): Promise<ProjectInfo> {
        const pubspecUri = vscode.Uri.joinPath(vscode.Uri.file(cwd), 'pubspec.yaml');
        try {
            const data = await vscode.workspace.fs.readFile(pubspecUri);
            const content = data.toString();
            
            const nameMatch = content.match(/^name:\s*(.+)$/m);
            const projectName = nameMatch ? nameMatch[1].trim() : 'Unknown';

            const depsMatch = content.match(/dependencies:([\s\S]*?)dev_dependencies:/);
            let dependenciesCount = 0;
            if (depsMatch) {
                const depsBlock = depsMatch[1];
                const deps = depsBlock.split('\n').filter(line => line.trim().startsWith('^') || line.includes(':'));
                dependenciesCount = deps.length;
            }

            return { projectName, dependenciesCount };
        } catch {
            return { projectName: 'Unknown', dependenciesCount: 0 };
        }
    }
}
