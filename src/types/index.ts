/**
 * Core type definitions for the extension.
 */

/**
 * Interface for logging services.
 * Ensures consistent logging across the extension, whether to VS Code OutputChannel or console.
 */
export interface ILogger {
    readonly onDidLog: vscode.Event<string>;
    info(message: string): void;
    warn(message: string): void;
    error(message: string, error?: any): void;
    debug(message: string): void;
    show(): void;
    clear(): void;
    exportLogs(): Promise<void>;
    getLogBuffer(): string[];
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
 * Interface for the Flutter Execution Service.
 * Resolves the correct binary (fvm, custom sdk, or system default) before running.
 */
export interface IFlutterExecutionService {
    run(args: string[], options?: CommandOptions): Promise<CommandResult>;
    runRaw(args: string[], options?: CommandOptions): Promise<{ stdout: string, stderr: string }>;
}

/**
 * Interface for the Flutter Service.
 * Provides a domain-specific API for executing Flutter CLI commands.
 */
export interface IFlutterService {
    run(token?: vscode.CancellationToken): Promise<CommandResult>;
    buildApk(token?: vscode.CancellationToken): Promise<CommandResult>;
    buildAppBundle(token?: vscode.CancellationToken): Promise<CommandResult>;
    buildWeb(token?: vscode.CancellationToken): Promise<CommandResult>;
    clean(token?: vscode.CancellationToken): Promise<CommandResult>;
    pubGet(token?: vscode.CancellationToken): Promise<CommandResult>;
    pubUpgrade(token?: vscode.CancellationToken): Promise<CommandResult>;
    doctor(token?: vscode.CancellationToken): Promise<CommandResult>;
    devices(token?: vscode.CancellationToken): Promise<CommandResult>;
}

/**
 * Interface for the Workspace Service.
 * Manages detection and state of the current Flutter workspace.
 */
export interface IWorkspaceService {
    readonly isFlutterProject: boolean;
    readonly onDidChangeProjectState: vscode.Event<boolean>;
    validateWorkspace(): Promise<boolean>;
}

import { ErrorAnalysis } from '../models/analyzer';

/**
 * Interface for the Error Analyzer Service.
 */
export interface IErrorAnalyzerService {
    analyze(rawLogs: string): ErrorAnalysis | null;
}

import { DashboardData } from '../models/dashboard';

/**
 * Interface for the Dashboard Data Service.
 */
export interface IDashboardDataService {
    getDashboardData(): Promise<DashboardData>;
}
