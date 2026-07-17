import { ICommand, ILogger } from '../types';
import { COMMANDS } from '../constants';
import { serviceContainer } from '../services/serviceContainer';

/**
 * Command to show the Output Channel logs.
 */
export class ShowLogsCommand implements ICommand {
    public readonly id = COMMANDS.SHOW_LOGS;

    async execute(): Promise<void> {
        const logger = serviceContainer.get<ILogger>('Logger');
        logger.show();
    }
}
