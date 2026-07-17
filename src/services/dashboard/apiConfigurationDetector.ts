import * as vscode from 'vscode';

export class ApiConfigurationDetector {
    public async detect(cwd: string): Promise<string[]> {
        const urls: string[] = [];

        try {
            const envUri = vscode.Uri.joinPath(vscode.Uri.file(cwd), '.env');
            try {
                const data = await vscode.workspace.fs.readFile(envUri);
                const content = data.toString();
                const match = content.match(/^(?:BASE_URL|API_URL)\s*=\s*(.+)$/im);
                if (match) {
                    urls.push(match[1].replace(/['"]/g, '').trim());
                }
            } catch {}
            
            if (urls.length === 0) {
                const files = await vscode.workspace.findFiles(new vscode.RelativePattern(cwd, 'lib/**/{*constants*,*config*,*api*,*env*,main}.dart'), null, 20);
                for (const file of files) {
                    const data = await vscode.workspace.fs.readFile(file);
                    const content = data.toString();
                    const match = content.match(/(?:baseUrl|BASE_URL|apiUrl|API_URL|apiBaseUrl|backendUrl|serverUrl)\s*[:=]\s*['"](http[^'"]+)['"]/i);
                    if (match) {
                        urls.push(match[1].trim());
                    }
                }
            }
        } catch {}
        
        return urls.length > 0 ? urls : ['Not Found'];
    }
}
