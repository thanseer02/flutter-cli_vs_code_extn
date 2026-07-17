import { ICommand, ILogger } from '../types';
import { COMMANDS } from '../constants';
import { serviceContainer } from '../services/serviceContainer';

/**
 * Command to clear the Output Channel logs.
 */
export class ClearLogsCommand implements ICommand {
    public readonly id = COMMANDS.CLEAR_LOGS;

    async execute(): Promise<void> {
        const logger = serviceContainer.get<ILogger>('Logger');
        logger.clear();
    }
}
