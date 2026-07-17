"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearLogsCommand = void 0;
const constants_1 = require("../constants");
const serviceContainer_1 = require("../services/serviceContainer");
/**
 * Command to clear the Output Channel logs.
 */
class ClearLogsCommand {
    constructor() {
        this.id = constants_1.COMMANDS.CLEAR_LOGS;
    }
    async execute() {
        const logger = serviceContainer_1.serviceContainer.get('Logger');
        logger.clear();
    }
}
exports.ClearLogsCommand = ClearLogsCommand;
//# sourceMappingURL=clearLogsCommand.js.map