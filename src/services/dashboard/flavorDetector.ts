import * as vscode from 'vscode';

export class FlavorDetector {
    public async detect(cwd: string): Promise<string[]> {
        const flavors: string[] = [];
        try {
            const buildGradleUri = vscode.Uri.joinPath(vscode.Uri.file(cwd), 'android', 'app', 'build.gradle');
            const data = await vscode.workspace.fs.readFile(buildGradleUri);
            const content = data.toString();
            
            // Simple heuristic to detect flavor names inside productFlavors block
            const flavorsMatch = content.match(/productFlavors\s*{([^}]+)}/);
            if (flavorsMatch) {
                const block = flavorsMatch[1];
                // Match word followed by { 
                const regex = /([a-zA-Z0-9_]+)\s*{/g;
                let match;
                while ((match = regex.exec(block)) !== null) {
                    flavors.push(match[1]);
                }
            }
        } catch {}
        
        return flavors.length > 0 ? flavors : ['None'];
    }
}
