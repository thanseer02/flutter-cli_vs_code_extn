import * as vscode from 'vscode';
import { IFlutterService, IFlutterExecutionService } from '../../types';
import { CommandResult } from '../../models/command';
import { serviceContainer } from '../serviceContainer';

/**
 * Domain-specific service for interacting with the Flutter CLI.
 * Keeps business logic decoupled from low-level terminal process management.
 */
export class FlutterService implements IFlutterService {
    
    private get executionService(): IFlutterExecutionService {
        return serviceContainer.get<IFlutterExecutionService>('FlutterExecutionService');
    }

    /**
     * Executes `flutter build apk`.
     */
    async run(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.executionService.run(['run'], { cancellationToken: token });
    }

    async buildApk(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.executionService.run(['build', 'apk'], { cancellationToken: token });
    }

    async buildAppBundle(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.executionService.run(['build', 'appbundle'], { cancellationToken: token });
    }

    async buildWeb(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.executionService.run(['build', 'web'], { cancellationToken: token });
    }

    async clean(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.executionService.run(['clean'], { cancellationToken: token });
    }

    async pubGet(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.executionService.run(['pub', 'get'], { cancellationToken: token });
    }

    async pubUpgrade(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.executionService.run(['pub', 'upgrade'], { cancellationToken: token });
    }

    async doctor(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.executionService.run(['doctor'], { cancellationToken: token });
    }

    async devices(token?: vscode.CancellationToken): Promise<CommandResult> {
        return this.executionService.run(['devices'], { cancellationToken: token });
    }
}
