"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorCommand = void 0;
const vscode = __importStar(require("vscode"));
const constants_1 = require("../constants");
const serviceContainer_1 = require("../services/serviceContainer");
const doctorParser_1 = require("../utils/doctorParser");
const doctorWebview_1 = require("../providers/webview/doctorWebview");
/**
 * Command to execute Flutter Doctor, parse the output, and display it in a Webview.
 */
class DoctorCommand {
    constructor(extensionUri) {
        this.extensionUri = extensionUri;
        this.id = constants_1.COMMANDS.DOCTOR;
    }
    async execute() {
        const flutterService = serviceContainer_1.serviceContainer.get('FlutterService');
        const logger = serviceContainer_1.serviceContainer.get('Logger');
        logger.info('Running Flutter Doctor...');
        logger.show();
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Flutter Doctor',
            cancellable: true
        }, async (progress, token) => {
            try {
                // Pass '-v' (verbose) to doctor if you want even more details to parse, 
                // but standard doctor output is usually sufficient for summary.
                const result = await flutterService.doctor(token);
                // Parse the stdout
                const categories = doctorParser_1.DoctorParser.parse(result.stdout);
                // If nothing was parsed (unexpected output), just show the output channel
                if (categories.length === 0) {
                    vscode.window.showWarningMessage('Flutter Doctor completed, but no standard output could be parsed.');
                    return;
                }
                // Render the Webview Panel
                doctorWebview_1.DoctorWebview.render(this.extensionUri, categories);
                vscode.window.showInformationMessage('✅ Flutter Doctor completed.');
            }
            catch (error) {
                if (error.name === 'CommandCancelledError') {
                    vscode.window.showWarningMessage('🛑 Flutter Doctor was cancelled.');
                }
                else {
                    vscode.window.showErrorMessage('❌ Flutter Doctor failed. Check the output logs.');
                }
            }
        });
    }
}
exports.DoctorCommand = DoctorCommand;
//# sourceMappingURL=doctorCommand.js.map