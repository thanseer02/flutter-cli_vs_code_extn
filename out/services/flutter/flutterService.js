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
    async run(token) {
        return this.processManager.spawnCommand('flutter', ['run'], { cancellationToken: token });
    }
    async buildApk(token) {
        return this.processManager.spawnCommand('flutter', ['build', 'apk'], { cancellationToken: token });
    }
    async buildAppBundle(token) {
        return this.processManager.spawnCommand('flutter', ['build', 'appbundle'], { cancellationToken: token });
    }
    async buildWeb(token) {
        return this.processManager.spawnCommand('flutter', ['build', 'web'], { cancellationToken: token });
    }
    async clean(token) {
        return this.processManager.spawnCommand('flutter', ['clean'], { cancellationToken: token });
    }
    async pubGet(token) {
        return this.processManager.spawnCommand('flutter', ['pub', 'get'], { cancellationToken: token });
    }
    async pubUpgrade(token) {
        return this.processManager.spawnCommand('flutter', ['pub', 'upgrade'], { cancellationToken: token });
    }
    async doctor(token) {
        return this.processManager.spawnCommand('flutter', ['doctor'], { cancellationToken: token });
    }
    async devices(token) {
        return this.processManager.spawnCommand('flutter', ['devices'], { cancellationToken: token });
    }
}
exports.FlutterService = FlutterService;
//# sourceMappingURL=flutterService.js.map