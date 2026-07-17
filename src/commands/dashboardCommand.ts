import * as vscode from 'vscode';
import { ICommand, IDashboardDataService } from '../types';
import { COMMANDS } from '../constants';
import { serviceContainer } from '../services/serviceContainer';
import { DashboardWebview } from '../providers/webview/dashboardWebview';

export class DashboardCommand implements ICommand {
    public readonly id = COMMANDS.SHOW_DASHBOARD;

    async execute(): Promise<void> {
        const dashboardService = serviceContainer.get<IDashboardDataService>('DashboardDataService');

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Loading Dashboard Data...',
            cancellable: false
        }, async () => {
            try {
                const data = await dashboardService.getDashboardData();
                DashboardWebview.render(data);
            } catch (error: any) {
                vscode.window.showErrorMessage(`Failed to load Dashboard: ${error.message}`);
            }
        });
    }
}
