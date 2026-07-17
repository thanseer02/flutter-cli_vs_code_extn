import * as vscode from 'vscode';
import { ICommand, ILogger } from '../types';
import { COMMANDS } from '../constants';
import { serviceContainer } from '../services/serviceContainer';

/**
 * A basic Hello World command used to verify the extension is working.
 */
export class HelloWorldCommand implements ICommand {
    public readonly id = COMMANDS.HELLO_WORLD;

    async execute(): Promise<void> {
        // Retrieve logger from the service container
        const logger = serviceContainer.get<ILogger>('Logger');
        
        logger.info('Executing Hello World command.');
        logger.show();
        
        vscode.window.showInformationMessage('Hello World from Flutter CLI Assistant!');
    }
}
