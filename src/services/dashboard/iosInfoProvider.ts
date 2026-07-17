import * as vscode from 'vscode';

export interface IOSInfo {
    bundleId: string;
    version: string;
}

export class IOSInfoProvider {
    public async getInfo(cwd: string): Promise<IOSInfo> {
        let bundleId = 'Unknown';
        let version = 'Unknown';
        
        try {
            const pbxprojUri = vscode.Uri.joinPath(vscode.Uri.file(cwd), 'ios', 'Runner.xcodeproj', 'project.pbxproj');
            const data = await vscode.workspace.fs.readFile(pbxprojUri);
            const content = data.toString();
            const bundleMatch = content.match(/PRODUCT_BUNDLE_IDENTIFIER\s*=\s*([^;]+);/);
            if (bundleMatch) {
                bundleId = bundleMatch[1].replace(/['"]/g, '').trim();
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

        return { bundleId, version };
    }
}
