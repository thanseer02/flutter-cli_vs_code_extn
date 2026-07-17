"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowLogsCommand = void 0;
const constants_1 = require("../constants");
const serviceContainer_1 = require("../services/serviceContainer");
/**
 * Command to show the Output Channel logs.
 */
class ShowLogsCommand {
    constructor() {
        this.id = constants_1.COMMANDS.SHOW_LOGS;
    }
    async execute() {
        const logger = serviceContainer_1.serviceContainer.get('Logger');
        logger.show();
    }
}
exports.ShowLogsCommand = ShowLogsCommand;
//# sourceMappingURL=showLogsCommand.js.map