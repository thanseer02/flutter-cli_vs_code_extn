import { ICommand, ILogger } from '../types';
import { COMMANDS } from '../constants';
import { serviceContainer } from '../services/serviceContainer';

/**
 * Command to export the Output Channel logs to a text file.
 */
export class ExportLogsCommand implements ICommand {
    public readonly id = COMMANDS.EXPORT_LOGS;

    async execute(): Promise<void> {
        const logger = serviceContainer.get<ILogger>('Logger');
        await logger.exportLogs();
    }
}
