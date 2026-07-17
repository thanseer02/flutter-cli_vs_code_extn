import * as vscode from 'vscode';
import { ICommand } from '../types';
import { COMMANDS } from '../constants';
import { ConsoleWebview } from '../providers/webview/consoleWebview';

/**
 * Command to show the Live Console Webview.
 */
export class ShowLogsCommand implements ICommand {
    public readonly id = COMMANDS.SHOW_LOGS;

    constructor(private readonly extensionUri: vscode.Uri) {}

    async execute(): Promise<void> {
        ConsoleWebview.render(this.extensionUri);
    }
}
