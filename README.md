# Flutter CLI Assistant

[![Version](https://img.shields.io/visual-studio-marketplace/v/your-publisher-name.flutter-cli-assistant)](https://marketplace.visualstudio.com/items?itemName=your-publisher-name.flutter-cli-assistant)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/your-publisher-name.flutter-cli-assistant)](https://marketplace.visualstudio.com/items?itemName=your-publisher-name.flutter-cli-assistant)

A production-quality VS Code extension that supercharges your Flutter developer productivity by providing a beautiful GUI dashboard, intelligent error diagnostics, live console streaming, and one-click access to common Flutter commands.

## Features

- **📊 Project Dashboard**: A beautiful, modern, theme-aware Webview providing a bird's-eye view of your project, dependencies, connected devices, and quick actions.
- **🛠️ One-Click Actions**: Execute `flutter run`, `build apk`, `build appbundle`, `build web`, `clean`, `pub get`, and `pub upgrade` directly from the VS Code Sidebar without typing.
- **Terminal Streaming Console**: A dedicated Live Console Webview featuring auto-scroll, colorized tags, and native search.
- **🧠 Error Analyzer**: Automatically intercepts build failures, diagnoses common issues (e.g., Gradle, Java JDK mismatch, CocoaPods, Android SDK), and provides human-readable explanations and one-click fixes.
- **🩺 Visual Flutter Doctor**: Parses raw `flutter doctor` output into a highly readable, icon-rich dashboard.

## Installation

1. Open VS Code.
2. Go to the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`).
3. Search for `Flutter CLI Assistant`.
4. Click Install.

## Development & Updating

If you are modifying the source code of this extension and want your changes to be reflected in the installed extension, follow these steps:

1. **Compile your changes**: Any modifications to `.ts` files need to be compiled.
   ```bash
   npm run compile
   ```
2. **Package the extension**: Bundle the changes into an installable `.vsix` file.
   ```bash
   npx @vscode/vsce package
   ```
3. **Install the new package**: Overwrite your existing installation by installing the newly generated `.vsix` file.
   ```bash
   code --install-extension flutter-cli-assistant-1.0.0.vsix
   ```

*Note: For rapid development without reinstalling, press `F5` in VS Code to launch an Extension Development Host window that instantly reflects your code changes.*

## Usage

When you open a Flutter project (a folder containing a `pubspec.yaml`), the **Flutter Assistant** icon will automatically appear in your primary Activity Bar on the left.

Clicking it opens the Sidebar, giving you instant access to the Dashboard and all commands.

## Requirements

- **Flutter SDK**: Must be installed and available in your system's PATH.
- **VS Code**: Version 1.80.0 or higher.

## Extension Settings

Currently, this extension does not require any manual settings configuration. It automatically detects your workspace environment.

## Known Issues

See the [GitHub Issue Tracker](https://github.com/your-repo/flutter-cli-assistant/issues) for a list of known issues.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for full release notes.

---
**Enjoy building beautiful apps with Flutter!**
