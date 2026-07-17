/**
 * Base error class for custom extension errors.
 */
export class ExtensionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
    }
}

/**
 * Thrown when a terminal command exits with a non-zero code.
 */
export class CommandExecutionError extends ExtensionError {
    public readonly exitCode: number | null;
    public readonly stdout: string;
    public readonly stderr: string;

    constructor(message: string, exitCode: number | null, stdout: string, stderr: string) {
        super(message);
        this.exitCode = exitCode;
        this.stdout = stdout;
        this.stderr = stderr;
    }
}

/**
 * Thrown when the user cancels a running command via CancellationToken.
 */
export class CommandCancelledError extends ExtensionError {
    constructor(message: string = 'Command was cancelled by the user.') {
        super(message);
    }
}
