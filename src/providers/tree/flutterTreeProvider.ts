import * as vscode from 'vscode';
import { COMMANDS } from '../../constants';

export class FlutterSidebarItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly commandId: string,
        public readonly iconName: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        
        // Use a built-in VS Code ThemeIcon (Octicons)
        this.iconPath = new vscode.ThemeIcon(iconName);
        
        this.command = {
            command: commandId,
            title: label,
        };
    }
}

/**
 * Provides the data for the Flutter Assistant sidebar view.
 */
export class FlutterTreeProvider implements vscode.TreeDataProvider<FlutterSidebarItem> {
    
    // An event to signal that the tree data has changed.
    private _onDidChangeTreeData = new vscode.EventEmitter<FlutterSidebarItem | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    /**
     * Called by VS Code to get the UI representation of a node.
     */
    getTreeItem(element: FlutterSidebarItem): vscode.TreeItem {
        return element;
    }

    /**
     * Called by VS Code to get the children of a node.
     * Since our sidebar is a flat list of commands, we only return items when element is undefined (root).
     */
    getChildren(element?: FlutterSidebarItem): Thenable<FlutterSidebarItem[]> {
        if (element) {
            // No nested items
            return Promise.resolve([]);
        }

        const items: FlutterSidebarItem[] = [
            new FlutterSidebarItem('Dashboard', COMMANDS.SHOW_DASHBOARD, 'dashboard'),
            // new FlutterSidebarItem('▶ Run', COMMANDS.RUN, 'play'),
            new FlutterSidebarItem('📦 Build APK', COMMANDS.BUILD_APK, 'package'),
            new FlutterSidebarItem('📦 Build App Bundle', COMMANDS.BUILD_APPBUNDLE, 'package')
        ];
        
        if (process.platform === 'darwin') {
            items.push(new FlutterSidebarItem('🍎 Build IPA', COMMANDS.BUILD_IPA, 'package'));
        }

        items.push(
            // new FlutterSidebarItem('🌐 Build Web', COMMANDS.BUILD_WEB, 'globe'),
            new FlutterSidebarItem('🧹 Clean', COMMANDS.FLUTTER_CLEAN, 'trash'),
            new FlutterSidebarItem('📥 Pub Get', COMMANDS.PUB_GET, 'cloud-download'),
            // new FlutterSidebarItem('⬆ Pub Upgrade', COMMANDS.PUB_UPGRADE, 'arrow-up'),
            new FlutterSidebarItem('🔍 Doctor', COMMANDS.DOCTOR, 'pulse'),
            new FlutterSidebarItem('📱 Devices', COMMANDS.DEVICES, 'device-mobile'),
            new FlutterSidebarItem('📄 Logs', COMMANDS.SHOW_LOGS, 'output')
        );

        return Promise.resolve(items);
    }

    /**
     * Call this to refresh the view programmatically.
     */
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}
