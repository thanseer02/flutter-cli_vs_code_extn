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
exports.FlutterTreeProvider = exports.FlutterSidebarItem = void 0;
const vscode = __importStar(require("vscode"));
const constants_1 = require("../../constants");
class FlutterSidebarItem extends vscode.TreeItem {
    constructor(label, iconName, collapsibleState, commandId, children) {
        super(label, collapsibleState);
        this.label = label;
        this.iconName = iconName;
        this.collapsibleState = collapsibleState;
        this.commandId = commandId;
        this.children = children;
        this.iconPath = new vscode.ThemeIcon(iconName);
        if (commandId) {
            this.command = {
                command: commandId,
                title: label,
            };
        }
    }
}
exports.FlutterSidebarItem = FlutterSidebarItem;
/**
 * Provides the data for the Flutter Assistant sidebar view.
 */
class FlutterTreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (element) {
            return Promise.resolve(element.children || []);
        }
        const items = [
            new FlutterSidebarItem('Dashboard', 'layout', vscode.TreeItemCollapsibleState.None, constants_1.COMMANDS.SHOW_DASHBOARD),
            new FlutterSidebarItem('Build APK', 'archive', vscode.TreeItemCollapsibleState.None, constants_1.COMMANDS.BUILD_APK),
            new FlutterSidebarItem('Build App Bundle', 'package', vscode.TreeItemCollapsibleState.None, constants_1.COMMANDS.BUILD_APPBUNDLE)
        ];
        if (process.platform === 'darwin') {
            items.push(new FlutterSidebarItem('Build IPA', 'device-mobile', vscode.TreeItemCollapsibleState.None, constants_1.COMMANDS.BUILD_IPA));
        }
        items.push(new FlutterSidebarItem('Clean', 'clear-all', vscode.TreeItemCollapsibleState.None, constants_1.COMMANDS.FLUTTER_CLEAN), new FlutterSidebarItem('Pub Get', 'repo-pull', vscode.TreeItemCollapsibleState.None, constants_1.COMMANDS.PUB_GET), new FlutterSidebarItem('Doctor', 'heart', vscode.TreeItemCollapsibleState.None, constants_1.COMMANDS.DOCTOR), new FlutterSidebarItem('Devices', 'vm', vscode.TreeItemCollapsibleState.None, constants_1.COMMANDS.DEVICES), new FlutterSidebarItem('Logs', 'terminal', vscode.TreeItemCollapsibleState.None, constants_1.COMMANDS.SHOW_LOGS), 
        // Code Generation Folder
        new FlutterSidebarItem('Code Generation', 'puzzle', vscode.TreeItemCollapsibleState.Expanded, undefined, [
            new FlutterSidebarItem('Generate JSON Serializable', 'file-code', vscode.TreeItemCollapsibleState.None, constants_1.COMMANDS.GENERATE_JSON_SERIALIZABLE)
        ]));
        return Promise.resolve(items);
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
exports.FlutterTreeProvider = FlutterTreeProvider;
//# sourceMappingURL=flutterTreeProvider.js.map