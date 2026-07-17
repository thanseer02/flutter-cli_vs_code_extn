import * as vscode from 'vscode';
import { COMMANDS } from '../../constants';

export class FlutterSidebarItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly iconName: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly commandId?: string,
        public readonly children?: FlutterSidebarItem[]
    ) {
        super(label, collapsibleState);
        
        this.iconPath = new vscode.ThemeIcon(iconName);
        
        if (commandId) {
            this.command = {
                command: commandId,
                title: label,
            };
        }
    }
}

/**
 * Provides the data for the Flutter Assistant sidebar view.
 */
export class FlutterTreeProvider implements vscode.TreeDataProvider<FlutterSidebarItem> {
    
    private _onDidChangeTreeData = new vscode.EventEmitter<FlutterSidebarItem | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    getTreeItem(element: FlutterSidebarItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: FlutterSidebarItem): Thenable<FlutterSidebarItem[]> {
        if (element) {
            return Promise.resolve(element.children || []);
        }

        const items: FlutterSidebarItem[] = [
            new FlutterSidebarItem('Dashboard', 'layout', vscode.TreeItemCollapsibleState.None, COMMANDS.SHOW_DASHBOARD),
            new FlutterSidebarItem('Build APK', 'archive', vscode.TreeItemCollapsibleState.None, COMMANDS.BUILD_APK),
            new FlutterSidebarItem('Build App Bundle', 'package', vscode.TreeItemCollapsibleState.None, COMMANDS.BUILD_APPBUNDLE)
        ];
        
        if (process.platform === 'darwin') {
            items.push(new FlutterSidebarItem('Build IPA', 'device-mobile', vscode.TreeItemCollapsibleState.None, COMMANDS.BUILD_IPA));
        }

        items.push(
            new FlutterSidebarItem('Clean', 'clear-all', vscode.TreeItemCollapsibleState.None, COMMANDS.FLUTTER_CLEAN),
            new FlutterSidebarItem('Pub Get', 'repo-pull', vscode.TreeItemCollapsibleState.None, COMMANDS.PUB_GET),
            new FlutterSidebarItem('Doctor', 'heart', vscode.TreeItemCollapsibleState.None, COMMANDS.DOCTOR),
            new FlutterSidebarItem('Devices', 'vm', vscode.TreeItemCollapsibleState.None, COMMANDS.DEVICES),
            new FlutterSidebarItem('Logs', 'terminal', vscode.TreeItemCollapsibleState.None, COMMANDS.SHOW_LOGS),
            
            // Code Generation Folder
            new FlutterSidebarItem('Code Generation', 'puzzle', vscode.TreeItemCollapsibleState.Expanded, undefined, [
                new FlutterSidebarItem('Generate JSON Serializable', 'file-code', vscode.TreeItemCollapsibleState.None, COMMANDS.GENERATE_JSON_SERIALIZABLE)
            ])
        );

        return Promise.resolve(items);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}
