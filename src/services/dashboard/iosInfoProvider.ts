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
            const plistUri = vscode.Uri.joinPath(vscode.Uri.file(cwd), 'ios', 'Runner', 'Info.plist');
            const data = await vscode.workspace.fs.readFile(plistUri);
            const content = data.toString();
            
            const shortVersionMatch = content.match(/<key>CFBundleShortVersionString<\/key>\s*<string>([^<]+)<\/string>/);
            const versionMatch = content.match(/<key>CFBundleVersion<\/key>\s*<string>([^<]+)<\/string>/);
            if (shortVersionMatch && versionMatch) {
                // If it contains variables like $(FLUTTER_BUILD_NAME), we fallback to pubspec
                if (!shortVersionMatch[1].includes('$')) {
                    version = `${shortVersionMatch[1]} (${versionMatch[1]})`;
                }
            }
        } catch {}

        if (version === 'Unknown') {
            try {
                const pubspecUri = vscode.Uri.joinPath(vscode.Uri.file(cwd), 'pubspec.yaml');
                const pubData = await vscode.workspace.fs.readFile(pubspecUri);
                const match = pubData.toString().match(/^version:\s*([\d\.]+)\+(\d+)$/m);
                if (match) {
                    version = `${match[1]} (${match[2]})`;
                } else {
                    const matchSimple = pubData.toString().match(/^version:\s*(.+)$/m);
                    if (matchSimple) {
                        version = matchSimple[1].trim();
                    }
                }
            } catch {}
        }

        return { bundleId, version };
    }
}
