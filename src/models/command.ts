/**
 * Represents the final result of a terminal command execution.
 */
export interface CommandResult {
    /** The exit code of the process. 0 typically indicates success. */
    exitCode: number | null;
    /** The complete standard output captured during execution. */
    stdout: string;
    /** The complete standard error captured during execution. */
    stderr: string;
}

/**
 * Options to configure how a command is spawned.
 */
export interface CommandOptions {
    /** The working directory for the command. Defaults to current workspace root if available. */
    cwd?: string;
    /** Optional cancellation token from VS Code to allow the user to stop the process. */
    cancellationToken?: import('vscode').CancellationToken;
    /** Environment variables to pass to the process. */
    env?: NodeJS.ProcessEnv;
    /** Timeout in milliseconds before the process is forcefully killed. */
    timeoutMs?: number;
}
