import { IServiceContainer } from '../types';

/**
 * A simple Dependency Injection container.
 * This class holds singletons of all services used in the extension,
 * promoting decoupling and easier testing.
 */
export class ServiceContainer implements IServiceContainer {
    private services: Map<string, any> = new Map();

    /**
     * Registers a service instance under a specific name.
     */
    register<T>(name: string, service: T): void {
        if (this.services.has(name)) {
            throw new Error(`Service ${name} is already registered.`);
        }
        this.services.set(name, service);
    }

    /**
     * Retrieves a service instance by its registered name.
     */
    get<T>(name: string): T {
        if (!this.services.has(name)) {
            throw new Error(`Service ${name} not found in container.`);
        }
        return this.services.get(name) as T;
    }
}

// Export a singleton instance of the service container
export const serviceContainer = new ServiceContainer();
