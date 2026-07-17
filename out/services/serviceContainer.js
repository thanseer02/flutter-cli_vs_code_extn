"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceContainer = exports.ServiceContainer = void 0;
/**
 * A simple Dependency Injection container.
 * This class holds singletons of all services used in the extension,
 * promoting decoupling and easier testing.
 */
class ServiceContainer {
    constructor() {
        this.services = new Map();
    }
    /**
     * Registers a service instance under a specific name.
     */
    register(name, service) {
        if (this.services.has(name)) {
            throw new Error(`Service ${name} is already registered.`);
        }
        this.services.set(name, service);
    }
    /**
     * Retrieves a service instance by its registered name.
     */
    get(name) {
        if (!this.services.has(name)) {
            throw new Error(`Service ${name} not found in container.`);
        }
        return this.services.get(name);
    }
}
exports.ServiceContainer = ServiceContainer;
// Export a singleton instance of the service container
exports.serviceContainer = new ServiceContainer();
//# sourceMappingURL=serviceContainer.js.map