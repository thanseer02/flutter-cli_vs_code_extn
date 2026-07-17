# Changelog

All notable changes to the "Flutter CLI Assistant" extension will be documented in this file.

## [1.0.0] - Initial Release

### Added
- **Flutter Sidebar**: Added one-click actions for Run, Build (APK, AppBundle, Web), Clean, Pub Get, Pub Upgrade, Doctor, and Devices.
- **Workspace Detection**: Extension now automatically detects Flutter workspaces and only shows the sidebar when appropriate.
- **Live Console**: Implemented a real-time, colored, auto-scrolling Webview console to replace standard output channels.
- **Dashboard Webview**: Added a rich UI dashboard showing Flutter/Dart versions, connected devices, and dependency counts.
- **Error Analyzer**: Added intelligent diagnostics for common Flutter/Gradle build errors.
- **Visual Doctor**: Added an icon-rich Webview parser for `flutter doctor`.

## [1.1.0]
- **Major Feature: Flutter Project Dashboard**: The sidebar now features a dedicated collapsible "Project" view that displays real-time statistics including Android/iOS versions, package names, bundle IDs, API configurations, and active flavors.
- **Code Generation Pipeline**: Added a new command to "Generate JSON Serializable" files directly from the sidebar. It intelligently resolves FVM vs System dart paths and gracefully handles missing dependencies.
- **Auto-Refresh Architecture**: The Dashboard implements an intelligent file watching system (pubspec.yaml, build.gradle, .env, etc.) to immediately refresh the UI without reloading the window.
