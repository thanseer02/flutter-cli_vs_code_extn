"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportLogsCommand = void 0;
const constants_1 = require("../constants");
const serviceContainer_1 = require("../services/serviceContainer");
/**
 * Command to export the Output Channel logs to a text file.
 */
class ExportLogsCommand {
    constructor() {
        this.id = constants_1.COMMANDS.EXPORT_LOGS;
    }
    async execute() {
        const logger = serviceContainer_1.serviceContainer.get('Logger');
        await logger.exportLogs();
    }
}
exports.ExportLogsCommand = ExportLogsCommand;
//# sourceMappingURL=exportLogsCommand.js.map