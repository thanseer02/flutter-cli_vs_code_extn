import * as vscode from 'vscode';
import * as path from 'path';
import * as child_process from 'child_process';
import { promisify } from 'util';
import { IFlutterExecutionService, IProcessManager } from '../../types';
import { CommandOptions, CommandResult } from '../../models/command';
import { serviceContainer } from '../serviceContainer';

const exec = promisify(child_process.exec);

export class FlutterExecutionService implements IFlutterExecutionService {
    
    private get processManager(): IProcessManager {
        return serviceContainer.get<IProcessManager>('ProcessManager');
    }

    /**
     * Resolves the correct execution string (fvm flutter, custom path, or system flutter).
     */
    private async resolveFlutterCommand(cwd?: string): Promise<{ command: string; args: string[] }> {
        // Priority 1: Check for FVM
        if (cwd) {
            try {
                const fvmConfigPath = vscode.Uri.joinPath(vscode.Uri.file(cwd), '.fvm', 'fvm_config.json');
                await vscode.workspace.fs.stat(fvmConfigPath);
                
                // If it exists and didn't throw, we use FVM
                return {
                    command: 'fvm',
                    args: ['flutter']
                };
            } catch {
                // No fvm config found, fall through
            }
        }

        // Priority 2: Custom SDK path in settings
        const config = vscode.workspace.getConfiguration('flutter-cli-assistant');
        const customPath = config.get<string>('flutterSdkPath');
        if (customPath && customPath.trim().length > 0) {
            // Need to append 'bin/flutter' or just use the path if they pointed directly to the binary
            // Standardizing on pointing to the SDK root folder like the official extension
            const flutterBinary = process.platform === 'win32' ? 'flutter.bat' : 'flutter';
            return {
                command: path.join(customPath.trim(), 'bin', flutterBinary),
                args: []
            };
        }

        // Priority 3: System default
        return {
            command: 'flutter',
            args: []
        };
    }

    /**
     * Executes a flutter command using the ProcessManager (streaming to console).
     */
    public async run(args: string[], options?: CommandOptions): Promise<CommandResult> {
        const cwd = options?.cwd || (vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined);
        const resolved = await this.resolveFlutterCommand(cwd);
        
        const finalArgs = [...resolved.args, ...args];
        return this.processManager.spawnCommand(resolved.command, finalArgs, options);
    }

    /**
     * Executes a flutter command silently using child_process.exec.
     * Useful for quick data fetching (like flutter --version).
     */
    public async runRaw(args: string[], options?: CommandOptions): Promise<{ stdout: string, stderr: string }> {
        const cwd = options?.cwd || (vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined);
        const resolved = await this.resolveFlutterCommand(cwd);
        
        const fullCommand = `${resolved.command} ${resolved.args.concat(args).join(' ')}`;
        return exec(fullCommand, { cwd, env: { ...process.env, ...options?.env } });
    }

    private async resolveDartCommand(cwd?: string): Promise<{ command: string; args: string[] }> {
        // Priority 1: Check for FVM
        if (cwd) {
            try {
                const fvmConfigPath = vscode.Uri.joinPath(vscode.Uri.file(cwd), '.fvm', 'fvm_config.json');
                await vscode.workspace.fs.stat(fvmConfigPath);
                return {
                    command: 'fvm',
                    args: ['dart']
                };
            } catch {}
        }

        // Priority 2: Custom SDK path
        const config = vscode.workspace.getConfiguration('flutter-cli-assistant');
        const customPath = config.get<string>('flutterSdkPath');
        if (customPath && customPath.trim().length > 0) {
            const dartBinary = process.platform === 'win32' ? 'dart.bat' : 'dart';
            return {
                command: path.join(customPath.trim(), 'bin', dartBinary),
                args: []
            };
        }

        // Priority 3: System default
        return {
            command: 'dart',
            args: []
        };
    }

    public async runDart(args: string[], options?: CommandOptions): Promise<CommandResult> {
        const cwd = options?.cwd || (vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined);
        const resolved = await this.resolveDartCommand(cwd);
        
        const finalArgs = [...resolved.args, ...args];
        return this.processManager.spawnCommand(resolved.command, finalArgs, options);
    }

    public async runDartRaw(args: string[], options?: CommandOptions): Promise<{ stdout: string, stderr: string }> {
        const cwd = options?.cwd || (vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined);
        const resolved = await this.resolveDartCommand(cwd);
        
        const fullCommand = `${resolved.command} ${resolved.args.concat(args).join(' ')}`;
        return exec(fullCommand, { cwd, env: { ...process.env, ...options?.env } });
    }
}
