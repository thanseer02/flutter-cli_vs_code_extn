import * as vscode from 'vscode';
import { ILogger, IWorkspaceService } from '../../types';
import { serviceContainer } from '../serviceContainer';

/**
 * Service responsible for analyzing the VS Code workspace to determine
 * if the current folder is a valid Flutter project.
 */
export class WorkspaceService implements IWorkspaceService {
    private _isFlutterProject: boolean = false;
    private _onDidChangeProjectState = new vscode.EventEmitter<boolean>();
    
    public readonly onDidChangeProjectState = this._onDidChangeProjectState.event;

    constructor() {
        // Listen for workspace folder changes
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            this.validateWorkspace();
        });
    }

    public get isFlutterProject(): boolean {
        return this._isFlutterProject;
    }

    private get logger(): ILogger {
        return serviceContainer.get<ILogger>('Logger');
    }

    /**
     * Checks the workspace for Flutter-specific files and folders.
     */
    async validateWorkspace(): Promise<boolean> {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
            this.setProjectState(false);
            return false;
        }

        const rootUri = folders[0].uri;
        let isFlutter = true;

        const requiredPaths = [
            'pubspec.yaml',
            'lib',
            'android',
            'ios'
        ];

        for (const path of requiredPaths) {
            const fileUri = vscode.Uri.joinPath(rootUri, path);
            try {
                await vscode.workspace.fs.stat(fileUri);
            } catch (error) {
                // If stat throws, the file/folder does not exist
                isFlutter = false;
                break;
            }
        }

        this.setProjectState(isFlutter);

        if (!isFlutter) {
            this.logger.warn('Current workspace is not a standard Flutter project. Missing pubspec.yaml, lib/, android/, or ios/.');
        } else {
            this.logger.info('Flutter project detected successfully.');
        }

        return isFlutter;
    }

    /**
     * Updates the internal state, fires the event, and sets a VS Code context key.
     */
    private setProjectState(isFlutter: boolean) {
        if (this._isFlutterProject !== isFlutter) {
            this._isFlutterProject = isFlutter;
            this._onDidChangeProjectState.fire(isFlutter);
            
            // Set context key so we can use it in package.json to conditionally show UI
            vscode.commands.executeCommand('setContext', 'flutter-cli-assistant.isFlutterProject', isFlutter);
        }
    }
}
