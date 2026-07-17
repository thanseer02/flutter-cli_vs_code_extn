/**
 * Defines constants used throughout the extension.
 * Centralizing these values prevents magic strings and makes refactoring easier.
 */
export const EXTENSION_ID = 'flutter-cli-assistant';
export const EXTENSION_NAME = 'Flutter CLI Assistant';

export const COMMANDS = {
    HELLO_WORLD: `${EXTENSION_ID}.helloWorld`,
    BUILD_APK: `${EXTENSION_ID}.buildApk`,
    FLUTTER_CLEAN: `${EXTENSION_ID}.flutterClean`,
    // Add more commands here as we build them out
};

export const CHANNELS = {
    MAIN_OUTPUT: EXTENSION_NAME
};
