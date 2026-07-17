"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandCancelledError = exports.CommandExecutionError = exports.ExtensionError = void 0;
/**
 * Base error class for custom extension errors.
 */
class ExtensionError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
exports.ExtensionError = ExtensionError;
/**
 * Thrown when a terminal command exits with a non-zero code.
 */
class CommandExecutionError extends ExtensionError {
    constructor(message, exitCode, stdout, stderr) {
        super(message);
        this.exitCode = exitCode;
        this.stdout = stdout;
        this.stderr = stderr;
    }
}
exports.CommandExecutionError = CommandExecutionError;
/**
 * Thrown when the user cancels a running command via CancellationToken.
 */
class CommandCancelledError extends ExtensionError {
    constructor(message = 'Command was cancelled by the user.') {
        super(message);
    }
}
exports.CommandCancelledError = CommandCancelledError;
//# sourceMappingURL=errors.js.map