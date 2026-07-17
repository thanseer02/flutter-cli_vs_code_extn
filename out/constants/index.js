"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHANNELS = exports.COMMANDS = exports.EXTENSION_NAME = exports.EXTENSION_ID = void 0;
/**
 * Defines constants used throughout the extension.
 * Centralizing these values prevents magic strings and makes refactoring easier.
 */
exports.EXTENSION_ID = 'flutter-cli-assistant';
exports.EXTENSION_NAME = 'Flutter CLI Assistant';
exports.COMMANDS = {
    HELLO_WORLD: `${exports.EXTENSION_ID}.helloWorld`,
    BUILD_APK: `${exports.EXTENSION_ID}.buildApk`,
    BUILD_IPA: `${exports.EXTENSION_ID}.buildIpa`,
    BUILD_APPBUNDLE: `${exports.EXTENSION_ID}.buildAppBundle`,
    BUILD_WEB: `${exports.EXTENSION_ID}.buildWeb`,
    FLUTTER_CLEAN: `${exports.EXTENSION_ID}.flutterClean`,
    PUB_GET: `${exports.EXTENSION_ID}.pubGet`,
    PUB_UPGRADE: `${exports.EXTENSION_ID}.pubUpgrade`,
    DOCTOR: `${exports.EXTENSION_ID}.doctor`,
    DEVICES: `${exports.EXTENSION_ID}.devices`,
    RUN: `${exports.EXTENSION_ID}.run`,
    SHOW_LOGS: 'flutter-cli-assistant.showLogs',
    CLEAR_LOGS: 'flutter-cli-assistant.clearLogs',
    EXPORT_LOGS: 'flutter-cli-assistant.exportLogs',
    SHOW_DASHBOARD: 'flutter-cli-assistant.showDashboard',
};
exports.CHANNELS = {
    MAIN_OUTPUT: exports.EXTENSION_NAME
};
//# sourceMappingURL=index.js.map