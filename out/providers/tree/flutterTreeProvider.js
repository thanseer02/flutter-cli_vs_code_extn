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
    constructor(label, commandId, iconName) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.label = label;
        this.commandId = commandId;
        this.iconName = iconName;
        // Use a built-in VS Code ThemeIcon (Octicons)
        this.iconPath = new vscode.ThemeIcon(iconName);
        this.command = {
            command: commandId,
            title: label,
        };
    }
}
exports.FlutterSidebarItem = FlutterSidebarItem;
/**
 * Provides the data for the Flutter Assistant sidebar view.
 */
class FlutterTreeProvider {
    constructor() {
        // An event to signal that the tree data has changed.
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    /**
     * Called by VS Code to get the UI representation of a node.
     */
    getTreeItem(element) {
        return element;
    }
    /**
     * Called by VS Code to get the children of a node.
     * Since our sidebar is a flat list of commands, we only return items when element is undefined (root).
     */
    getChildren(element) {
        if (element) {
            // No nested items
            return Promise.resolve([]);
        }
        // Return the root level items
        return Promise.resolve([
            new FlutterSidebarItem('▶ Run', constants_1.COMMANDS.RUN, 'play'),
            new FlutterSidebarItem('📦 Build APK', constants_1.COMMANDS.BUILD_APK, 'package'),
            new FlutterSidebarItem('📦 Build AppBundle', constants_1.COMMANDS.BUILD_APPBUNDLE, 'package'),
            new FlutterSidebarItem('🌐 Build Web', constants_1.COMMANDS.BUILD_WEB, 'globe'),
            new FlutterSidebarItem('🧹 Clean', constants_1.COMMANDS.FLUTTER_CLEAN, 'trash'),
            new FlutterSidebarItem('📥 Pub Get', constants_1.COMMANDS.PUB_GET, 'cloud-download'),
            new FlutterSidebarItem('⬆ Pub Upgrade', constants_1.COMMANDS.PUB_UPGRADE, 'arrow-up'),
            new FlutterSidebarItem('🔍 Doctor', constants_1.COMMANDS.DOCTOR, 'pulse'),
            new FlutterSidebarItem('📱 Devices', constants_1.COMMANDS.DEVICES, 'device-mobile'),
            new FlutterSidebarItem('📄 Logs', constants_1.COMMANDS.SHOW_LOGS, 'output')
        ]);
    }
    /**
     * Call this to refresh the view programmatically.
     */
    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
exports.FlutterTreeProvider = FlutterTreeProvider;
//# sourceMappingURL=flutterTreeProvider.js.map