# Flutter CLI Assistant

[![Version](https://img.shields.io/visual-studio-marketplace/v/MuhammadThanseer.flutter-cli-assistant)](https://marketplace.visualstudio.com/items?itemName=MuhammadThanseer.flutter-cli-assistant)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/MuhammadThanseer.flutter-cli-assistant)](https://marketplace.visualstudio.com/items?itemName=MuhammadThanseer.flutter-cli-assistant)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/MuhammadThanseer.flutter-cli-assistant)](https://marketplace.visualstudio.com/items?itemName=MuhammadThanseer.flutter-cli-assistant)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A production-quality VS Code extension that supercharges your Flutter development workflow with a beautiful GUI dashboard, intelligent error diagnostics, live console streaming, and one-click access to common Flutter commands — all without leaving your editor.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Requirements](#requirements)
- [Extension Settings](#extension-settings)
- [Known Issues](#known-issues)
- [Release Notes](#release-notes)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Feature | Description |
|---|---|
| 📊 **Project Dashboard** | A beautiful, modern, theme-aware Webview providing a bird's-eye view of your project, dependencies, connected devices, and quick actions. |
| 🛠️ **One-Click Actions** | Execute `flutter run`, `build apk`, `build appbundle`, `build web`, `clean`, `pub get`, and `pub upgrade` directly from the VS Code Sidebar without typing a single command. |
| 🖥️ **Terminal Streaming Console** | A dedicated Live Console Webview with auto-scroll, colorized tags, and native search. |
| 🧠 **Error Analyzer** | Automatically intercepts build failures, diagnoses common issues (Gradle, Java JDK mismatch, CocoaPods, Android SDK, etc.), and offers human-readable explanations with one-click fixes. |
| 🩺 **Visual Flutter Doctor** | Parses raw `flutter doctor` output into a clean, icon-rich, easy-to-read dashboard. |

---

## Installation

1. Open **VS Code**.
2. Go to the Extensions view (`Ctrl+Shift+X` on Windows/Linux, `Cmd+Shift+X` on macOS).
3. Search for **Flutter CLI Assistant**.
4. Click **Install**.

Alternatively, install it directly from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=MuhammadThanseer.flutter-cli-assistant).

---

## Usage

Open any Flutter project (a folder containing a `pubspec.yaml`), and the **Flutter Assistant** icon will automatically appear in your primary Activity Bar on the left.

Click the icon to open the sidebar, giving you instant access to the dashboard and all available commands.

---

## Requirements

- **Flutter SDK** — must be installed and available on your system's `PATH`.
- **VS Code** — version `1.80.0` or higher.

---

## Extension Settings

This extension currently requires no manual configuration — it automatically detects your workspace environment.

---

## Known Issues

See the [GitHub Issue Tracker](https://github.com/thanseer02/flutter-cli_vs_code_extn/issues) for a list of known issues and to report new ones.

---

## Release Notes

See [CHANGELOG.md](CHANGELOG.md) for the full release history.

---

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/thanseer02/flutter-cli_vs_code_extn/issues) or submit a pull request.

---

## License

This project is licensed under the [MIT License](LICENSE).

---

**Enjoy building beautiful apps with Flutter! 🚀**