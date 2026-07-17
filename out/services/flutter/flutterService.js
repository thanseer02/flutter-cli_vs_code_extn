"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlutterService = void 0;
const serviceContainer_1 = require("../serviceContainer");
/**
 * Domain-specific service for interacting with the Flutter CLI.
 * Keeps business logic decoupled from low-level terminal process management.
 */
class FlutterService {
    get executionService() {
        return serviceContainer_1.serviceContainer.get('FlutterExecutionService');
    }
    /**
     * Executes `flutter build apk`.
     */
    async run(token) {
        return this.executionService.run(['run'], { cancellationToken: token });
    }
    async buildApk(token) {
        return this.executionService.run(['build', 'apk'], { cancellationToken: token });
    }
    async buildAppBundle(token) {
        return this.executionService.run(['build', 'appbundle'], { cancellationToken: token });
    }
    async buildWeb(token) {
        return this.executionService.run(['build', 'web'], { cancellationToken: token });
    }
    async clean(token) {
        return this.executionService.run(['clean'], { cancellationToken: token });
    }
    async pubGet(token) {
        return this.executionService.run(['pub', 'get'], { cancellationToken: token });
    }
    async pubUpgrade(token) {
        return this.executionService.run(['pub', 'upgrade'], { cancellationToken: token });
    }
    async doctor(token) {
        return this.executionService.run(['doctor'], { cancellationToken: token });
    }
    async devices(token) {
        return this.executionService.run(['devices'], { cancellationToken: token });
    }
}
exports.FlutterService = FlutterService;
//# sourceMappingURL=flutterService.js.map