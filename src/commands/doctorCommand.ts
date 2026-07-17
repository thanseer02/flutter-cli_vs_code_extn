import * as vscode from 'vscode';
import { ICommand, IFlutterService, ILogger } from '../types';
import { COMMANDS } from '../constants';
import { serviceContainer } from '../services/serviceContainer';
import { DoctorParser } from '../utils/doctorParser';
import { DoctorWebview } from '../providers/webview/doctorWebview';

/**
 * Command to execute Flutter Doctor, parse the output, and display it in a Webview.
 */
export class DoctorCommand implements ICommand {
    public readonly id = COMMANDS.DOCTOR;

    constructor(private readonly extensionUri: vscode.Uri) {}

    async execute(): Promise<void> {
        const flutterService = serviceContainer.get<IFlutterService>('FlutterService');
        const logger = serviceContainer.get<ILogger>('Logger');

        logger.info('Running Flutter Doctor...');
        logger.show();

        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Flutter Doctor',
            cancellable: true
        }, async (progress, token) => {
            try {
                // Pass '-v' (verbose) to doctor if you want even more details to parse, 
                // but standard doctor output is usually sufficient for summary.
                const result = await flutterService.doctor(token);

                // Parse the stdout
                const categories = DoctorParser.parse(result.stdout);

                // If nothing was parsed (unexpected output), just show the output channel
                if (categories.length === 0) {
                    vscode.window.showWarningMessage('Flutter Doctor completed, but no standard output could be parsed.');
                    return;
                }

                // Render the Webview Panel
                DoctorWebview.render(this.extensionUri, categories);

                vscode.window.showInformationMessage('✅ Flutter Doctor completed.');
            } catch (error: any) {
                if (error.name === 'CommandCancelledError') {
                    vscode.window.showWarningMessage('🛑 Flutter Doctor was cancelled.');
                } else {
                    vscode.window.showErrorMessage('❌ Flutter Doctor failed. Check the output logs.');
                }
            }
        });
    }
}
