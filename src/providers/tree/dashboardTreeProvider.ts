import * as vscode from 'vscode';
import { DashboardViewModel } from '../../services/dashboard/dashboardViewModel';

export class DashboardTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string | undefined,
        public readonly iconName: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
    ) {
        super(label, collapsibleState);
        this.description = description;
        this.iconPath = new vscode.ThemeIcon(iconName);
        this.tooltip = `${label}: ${description}`;
    }
}

export class DashboardTreeProvider implements vscode.TreeDataProvider<DashboardTreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<DashboardTreeItem | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private viewModel: DashboardViewModel) {
        this.viewModel.onDidChange(() => this.refresh());
    }

    getTreeItem(element: DashboardTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: DashboardTreeItem): Promise<DashboardTreeItem[]> {
        if (element) {
            return []; // No nested elements for now in Project view
        }

        const data = await this.viewModel.getData();
        const items: DashboardTreeItem[] = [];

        if (data.project) {
            items.push(new DashboardTreeItem('Project', data.project.projectName, 'project'));
        }

        if (data.versions) {
            const flutterLabel = data.versions.flutter.includes('fvm') ? `FVM ${data.versions.flutter.replace('fvm', '').trim()}` : data.versions.flutter;
            items.push(new DashboardTreeItem('Flutter', flutterLabel, 'device-mobile'));
            items.push(new DashboardTreeItem('Dart', data.versions.dart, 'code'));
        }

        if (data.android) {
            items.push(new DashboardTreeItem('Android Package', data.android.packageName, 'package'));
            items.push(new DashboardTreeItem('Android Version', data.android.version, 'versions'));
        }

        if (data.ios) {
            items.push(new DashboardTreeItem('iOS Bundle', data.ios.bundleId, 'package'));
            items.push(new DashboardTreeItem('iOS Version', data.ios.version, 'versions'));
        }

        if (data.flavors && data.flavors.length > 0 && data.flavors[0] !== 'None') {
            items.push(new DashboardTreeItem('Flavors', data.flavors.join(', '), 'symbol-color'));
        }

        if (data.apiUrls && data.apiUrls.length > 0) {
            items.push(new DashboardTreeItem('API Base URL', data.apiUrls[0], 'globe'));
            if (data.apiUrls.length > 1) {
                for (let i = 1; i < data.apiUrls.length; i++) {
                    items.push(new DashboardTreeItem(`API Base URL ${i+1}`, data.apiUrls[i], 'globe'));
                }
            }
        }

        return items;
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
}
