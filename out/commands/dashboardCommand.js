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
exports.DashboardCommand = void 0;
const vscode = __importStar(require("vscode"));
const constants_1 = require("../constants");
const serviceContainer_1 = require("../services/serviceContainer");
const dashboardWebview_1 = require("../providers/webview/dashboardWebview");
class DashboardCommand {
    constructor() {
        this.id = constants_1.COMMANDS.SHOW_DASHBOARD;
    }
    async execute() {
        const dashboardService = serviceContainer_1.serviceContainer.get('DashboardDataService');
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: 'Loading Dashboard Data...',
            cancellable: false
        }, async () => {
            try {
                const data = await dashboardService.getDashboardData();
                dashboardWebview_1.DashboardWebview.render(data);
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to load Dashboard: ${error.message}`);
            }
        });
    }
}
exports.DashboardCommand = DashboardCommand;
//# sourceMappingURL=dashboardCommand.js.map