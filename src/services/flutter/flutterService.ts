import * as vscode from 'vscode';
import { IFlutterService, IProcessManager } from '../../types';
import { CommandResult } from '../../models/command';
import { serviceContainer } from '../serviceContainer';

/**
 * Domain-specific service for interacting with the Flutter CLI.
 * Keeps business logic decoupled from low-level terminal process management.
 */
export class FlutterService implements IFlutterService {
    private get processManager(): IProcessManager {
        return serviceContainer.get<IProcessManager>('ProcessManager');
    }

    /**
     * Executes `flutter build apk`.
     */
    async buildApk(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.processManager.spawnCommand('flutter', ['build', 'apk'], { cancellationToken: token });
    }

    /**
     * Executes `flutter clean`.
     */
    async clean(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.processManager.spawnCommand('flutter', ['clean'], { cancellationToken: token });
    }

    /**
     * Executes `flutter pub get`.
     */
    async pubGet(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.processManager.spawnCommand('flutter', ['pub', 'get'], { cancellationToken: token });
    }
}
