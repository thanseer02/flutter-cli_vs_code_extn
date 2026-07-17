"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorRules = void 0;
/**
 * A registry of known Flutter errors and their explanations.
 */
exports.errorRules = [
    {
        pattern: /INSTALL_PARSE_FAILED_([A-Z_]+)/,
        analyze: (match) => ({
            problem: `APK Installation Failed: ${match[1]}`,
            explanation: `The Android system refused to install the APK because of a parsing error (${match[1]}). This usually happens if there is a mismatch in the AndroidManifest.xml (like a missing exported tag for Android 12+) or if a previous version of the app is installed with a conflicting signature.`,
            fixes: [
                'Uninstall the existing app from the device/emulator and try running again.',
                'Check android/app/src/main/AndroidManifest.xml to ensure all <activity>, <receiver>, and <service> tags that have intent-filters also have the android:exported attribute set to true or false.',
                'Run `flutter clean` then `flutter pub get`.'
            ],
            links: [
                'https://developer.android.com/guide/topics/manifest/activity-element#exported',
                'https://flutter.dev/docs/deployment/android'
            ]
        })
    },
    {
        pattern: /unsupported class file major version (\d+)/i,
        analyze: (match) => ({
            problem: 'Java JDK Version Mismatch',
            explanation: `Gradle encountered a Java class file version (${match[1]}) that it does not support. This means the version of Java installed on your system (or used by VS Code) is incompatible with the Gradle version defined in your android/gradle/wrapper/gradle-wrapper.properties file.`,
            fixes: [
                'Ensure you are using Java 11 or Java 17, which are the most stable versions for current Flutter development.',
                'Check your JAVA_HOME environment variable.',
                'Upgrade your Gradle wrapper version in android/gradle/wrapper/gradle-wrapper.properties.'
            ],
            links: [
                'https://docs.flutter.dev/reference/supported-platforms',
                'https://docs.gradle.org/current/userguide/compatibility.html'
            ]
        })
    },
    {
        pattern: /No toolchains found in the NDK toolchains folder for ABI with prefix/i,
        analyze: () => ({
            problem: 'Android NDK Missing or Corrupted',
            explanation: 'The Android Native Development Kit (NDK) toolchain could not be found. This is required for building C/C++ code used by some Flutter plugins.',
            fixes: [
                'Open Android Studio, go to SDK Manager -> SDK Tools, and install or update the "NDK (Side by side)".',
                'Ensure the path to your Android SDK is correctly set in your environment variables or local.properties.'
            ],
            links: [
                'https://developer.android.com/studio/projects/install-ndk'
            ]
        })
    },
    {
        pattern: /CocoaPods not installed or not in valid state/i,
        analyze: () => ({
            problem: 'CocoaPods Not Installed',
            explanation: 'CocoaPods is required to manage iOS dependencies, but it is either missing or broken on your Mac.',
            fixes: [
                'Run `sudo gem install cocoapods` in your terminal.',
                'Alternatively, if using Homebrew, run `brew install cocoapods`.',
                'After installing, run `pod setup`.'
            ],
            links: [
                'https://guides.cocoapods.org/using/getting-started.html',
                'https://flutter.dev/docs/get-started/install/macos#deploy-to-ios-devices'
            ]
        })
    },
    {
        pattern: /Xcode workspace is not configured properly/i,
        analyze: () => ({
            problem: 'Xcode Configuration Error',
            explanation: 'The iOS project configuration is invalid. This often happens if the Runner.xcworkspace was modified incorrectly or CocoaPods failed to generate the workspace.',
            fixes: [
                'Open the ios/ folder and delete the Podfile.lock file and the Pods/ directory.',
                'Run `flutter clean`.',
                'Run `flutter build ios` (this will automatically run `pod install`).'
            ],
            links: [
                'https://flutter.dev/docs/deployment/ios'
            ]
        })
    },
    {
        pattern: /No space left on device/i,
        analyze: () => ({
            problem: 'No Space Left on Device',
            explanation: 'The compiler ran out of disk space while trying to build the application or write temporary files.',
            fixes: [
                'Free up disk space by deleting old files or emptying the trash.',
                'Run `flutter clean` to remove large generated build folders.',
                'Wipe data on your Android Emulator to free up virtual disk space.'
            ],
            links: []
        })
    },
    {
        pattern: /Because every version of .+ depends on .+, .+ is forbidden/i,
        analyze: () => ({
            problem: 'Pub Dependency Conflict',
            explanation: 'Flutter was unable to resolve your pubspec.yaml dependencies. Two or more packages require incompatible versions of a shared underlying package.',
            fixes: [
                'Run `flutter pub outdated` to see which packages are holding back versions.',
                'Try running `flutter pub upgrade --major-versions` to forcibly upgrade packages to their latest major versions (warning: may include breaking changes).',
                'Manually inspect your pubspec.yaml and align version constraints using dependency overrides.'
            ],
            links: [
                'https://dart.dev/tools/pub/dependencies',
                'https://dart.dev/tools/pub/cmd/pub-outdated'
            ]
        })
    },
    {
        // A generic fallback for Gradle daemon failures
        pattern: /Gradle task assemble\w+ failed with exit code \d+/i,
        analyze: () => ({
            problem: 'Gradle Build Failed',
            explanation: 'The Android Gradle build failed. This is a generic error that usually masks a deeper Java, Kotlin, or Android SDK issue.',
            fixes: [
                'Scroll up in the log output to find the *actual* cause of the error (look for lines marked with "e:" or "ERROR:").',
                'Run `flutter clean` and try again.',
                'Ensure your compileSdkVersion and targetSdkVersion in android/app/build.gradle are up to date (e.g., 33 or 34).'
            ],
            links: [
                'https://docs.flutter.dev/deployment/android'
            ]
        })
    },
    {
        pattern: /Failed to apply plugin \[id '(.+)'\]/i,
        analyze: (match) => ({
            problem: 'Gradle Daemon Error',
            explanation: `The Gradle daemon failed to apply a plugin (${match[1]}). This can happen if the plugin version is incompatible with your Gradle version, or if the Gradle daemon is in a corrupted state.`,
            fixes: [
                'Run `cd android && ./gradlew --stop` to kill the daemon, then try again.',
                'Check your android/build.gradle and ensure the plugin versions match your environment.'
            ],
            links: []
        })
    }
];
//# sourceMappingURL=errorRules.js.map