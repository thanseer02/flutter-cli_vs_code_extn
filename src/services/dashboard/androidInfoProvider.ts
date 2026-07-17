import * as vscode from 'vscode';

export interface AndroidInfo {
    packageName: string;
    version: string;
}

export class AndroidInfoProvider {
    public async getInfo(cwd: string): Promise<AndroidInfo> {
        let packageName = 'Unknown';
        let version = 'Unknown';
        
        try {
            const buildGradleUri = vscode.Uri.joinPath(vscode.Uri.file(cwd), 'android', 'app', 'build.gradle');
            const data = await vscode.workspace.fs.readFile(buildGradleUri);
            const content = data.toString();
            
            const applicationIdMatch = content.match(/applicationId\s+['"]([^'"]+)['"]/);
            if (applicationIdMatch) {
                packageName = applicationIdMatch[1];
            } else {
                const namespaceMatch = content.match(/namespace\s+['"]([^'"]+)['"]/);
                if (namespaceMatch) {
                    packageName = namespaceMatch[1];
                }
            }
        } catch {}

        try {
            const pubspecUri = vscode.Uri.joinPath(vscode.Uri.file(cwd), 'pubspec.yaml');
            const pubData = await vscode.workspace.fs.readFile(pubspecUri);
            const match = pubData.toString().match(/^version:\s*(.+)$/m);
            if (match) {
                version = match[1].trim();
            }
        } catch {}

        return { packageName, version };
    }
}
