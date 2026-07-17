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
    async run(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.processManager.spawnCommand('flutter', ['run'], { cancellationToken: token });
    }

    async buildApk(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.processManager.spawnCommand('flutter', ['build', 'apk'], { cancellationToken: token });
    }

    async buildAppBundle(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.processManager.spawnCommand('flutter', ['build', 'appbundle'], { cancellationToken: token });
    }

    async buildWeb(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.processManager.spawnCommand('flutter', ['build', 'web'], { cancellationToken: token });
    }

    async clean(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.processManager.spawnCommand('flutter', ['clean'], { cancellationToken: token });
    }

    async pubGet(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.processManager.spawnCommand('flutter', ['pub', 'get'], { cancellationToken: token });
    }

    async pubUpgrade(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.processManager.spawnCommand('flutter', ['pub', 'upgrade'], { cancellationToken: token });
    }

    async doctor(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.processManager.spawnCommand('flutter', ['doctor'], { cancellationToken: token });
    }

    async devices(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.processManager.spawnCommand('flutter', ['devices'], { cancellationToken: token });
    }
}
