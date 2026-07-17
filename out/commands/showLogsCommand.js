"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShowLogsCommand = void 0;
const constants_1 = require("../constants");
const consoleWebview_1 = require("../providers/webview/consoleWebview");
/**
 * Command to show the Live Console Webview.
 */
class ShowLogsCommand {
    constructor(extensionUri) {
        this.extensionUri = extensionUri;
        this.id = constants_1.COMMANDS.SHOW_LOGS;
    }
    async execute() {
        consoleWebview_1.ConsoleWebview.render(this.extensionUri);
    }
}
exports.ShowLogsCommand = ShowLogsCommand;
//# sourceMappingURL=showLogsCommand.js.map