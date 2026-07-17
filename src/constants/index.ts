/**
 * Defines constants used throughout the extension.
 * Centralizing these values prevents magic strings and makes refactoring easier.
 */
export const EXTENSION_ID = 'flutter-cli-assistant';
export const EXTENSION_NAME = 'Flutter CLI Assistant';

export const COMMANDS = {
    HELLO_WORLD: `${EXTENSION_ID}.helloWorld`,
    BUILD_APK: `${EXTENSION_ID}.buildApk`,
    BUILD_IPA: `${EXTENSION_ID}.buildIpa`,
    BUILD_APPBUNDLE: `${EXTENSION_ID}.buildAppBundle`,
    BUILD_WEB: `${EXTENSION_ID}.buildWeb`,
    FLUTTER_CLEAN: `${EXTENSION_ID}.flutterClean`,
    PUB_GET: `${EXTENSION_ID}.pubGet`,
    PUB_UPGRADE: `${EXTENSION_ID}.pubUpgrade`,
    DOCTOR: `${EXTENSION_ID}.doctor`,
    DEVICES: `${EXTENSION_ID}.devices`,
    RUN: `${EXTENSION_ID}.run`,
    SHOW_LOGS: 'flutter-cli-assistant.showLogs',
    CLEAR_LOGS: 'flutter-cli-assistant.clearLogs',
    EXPORT_LOGS: 'flutter-cli-assistant.exportLogs',
    SHOW_DASHBOARD: 'flutter-cli-assistant.showDashboard',
};

export const CHANNELS = {
    MAIN_OUTPUT: EXTENSION_NAME
};
