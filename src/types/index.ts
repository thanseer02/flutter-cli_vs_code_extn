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

import * as vscode from 'vscode';
import { CommandOptions, CommandResult } from '../models/command';

/**
 * Interface for the Process Manager.
 * Abstracts child_process spawning to allow easy mocking in tests.
 */
export interface IProcessManager {
    /**
     * Spawns a new process, streams its output to the logger, and returns the result.
     */
    spawnCommand(command: string, args: string[], options?: CommandOptions): Promise<CommandResult>;
}

/**
 * Interface for the Flutter Service.
 * Provides a domain-specific API for executing Flutter CLI commands.
 */
export interface IFlutterService {
    buildApk(token?: vscode.CancellationToken): Promise<CommandResult>;
    clean(token?: vscode.CancellationToken): Promise<CommandResult>;
    pubGet(token?: vscode.CancellationToken): Promise<CommandResult>;
}
