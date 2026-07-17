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
    FLUTTER_CLEAN: `${exports.EXTENSION_ID}.flutterClean`,
    // Add more commands here as we build them out
};
exports.CHANNELS = {
    MAIN_OUTPUT: exports.EXTENSION_NAME
};
//# sourceMappingURL=index.js.map