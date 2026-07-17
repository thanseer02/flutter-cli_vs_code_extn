"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlutterService = void 0;
const serviceContainer_1 = require("../serviceContainer");
/**
 * Domain-specific service for interacting with the Flutter CLI.
 * Keeps business logic decoupled from low-level terminal process management.
 */
class FlutterService {
    get processManager() {
        return serviceContainer_1.serviceContainer.get('ProcessManager');
    }
    /**
     * Executes `flutter build apk`.
     */
    async buildApk(token) {
        return this.processManager.spawnCommand('flutter', ['build', 'apk'], { cancellationToken: token });
    }
    /**
     * Executes `flutter clean`.
     */
    async clean(token) {
        return this.processManager.spawnCommand('flutter', ['clean'], { cancellationToken: token });
    }
    /**
     * Executes `flutter pub get`.
     */
    async pubGet(token) {
        return this.processManager.spawnCommand('flutter', ['pub', 'get'], { cancellationToken: token });
    }
}
exports.FlutterService = FlutterService;
//# sourceMappingURL=flutterService.js.map