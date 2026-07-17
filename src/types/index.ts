/**
 * Core type definitions for the extension.
 */

/**
 * Interface for logging services.
 * Ensures consistent logging across the extension, whether to VS Code OutputChannel or console.
 */
export interface ILogger {
    info(message: string): void;
    warn(message: string): void;
    error(message: string, error?: any): void;
    debug(message: string): void;
    show(): void;
}

/**
 * Interface for commands to be registered with the extension.
 * Each command must have an ID and an execute method.
 */
export interface ICommand {
    readonly id: string;
    execute(...args: any[]): Promise<void> | void;
}

/**
 * Interface for the Service Container.
 * A simple Dependency Injection container to manage service singletons.
 */
export interface IServiceContainer {
    register<T>(name: string, service: T): void;
    get<T>(name: string): T;
}
