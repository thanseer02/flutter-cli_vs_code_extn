import * as vscode from 'vscode';
import { IErrorAnalyzerService, ILogger } from '../../types';
import { ErrorAnalysis } from '../../models/analyzer';
import { errorRules } from './errorRules';
import { serviceContainer } from '../serviceContainer';

/**
 * Service responsible for taking raw terminal output (stdout/stderr)
 * in real-time and analyzing it to find known errors.
 */
export class ErrorAnalyzerService implements IErrorAnalyzerService {
    private _onDidDetectError = new vscode.EventEmitter<ErrorAnalysis>();
    public readonly onDidDetectError = this._onDidDetectError.event;
    private _disposables: vscode.Disposable[] = [];
    private _logger?: ILogger;

    constructor() {
        this.attachToLoggerFromContainer();
    }

    private attachToLoggerFromContainer(): void {
        try {
            const logger = serviceContainer.get<ILogger>('Logger');
            this.attachToLogger(logger);
        } catch {
            // Logger may not be registered yet during activation.
            // It will be attached later once the service is registered.
        }
    }

    public attachToLogger(logger: ILogger): void {
        if (this._logger === logger) {
            return;
        }

        this._logger = logger;
        this._disposables.forEach(disposable => disposable.dispose());
        this._disposables = [];
        this._disposables.push(
            logger.onDidLog((logChunk) => {
                this.analyzeChunk(logChunk);
            })
        );
    }

    private analyzeChunk(chunk: string) {
        // Quick short-circuit if no obvious error indicators are present to save CPU
        if (!chunk.toLowerCase().includes('error') && !chunk.includes('Exception') && !chunk.includes('FAILED')) {
            return;
        }

        for (const rule of errorRules) {
            const match = chunk.match(rule.pattern);
            if (match) {
                const analysis = rule.analyze(match);
                this._onDidDetectError.fire(analysis);
                return; // Fire for the first match
            }
        }
    }

    /**
     * Legacy analyze method, still useful for bulk post-mortem if needed.
     */
    public analyze(rawLogs: string): ErrorAnalysis | null {
        for (const rule of errorRules) {
            const match = rawLogs.match(rule.pattern);
            if (match) {
                return rule.analyze(match);
            }
        }
        return null;
    }

    public dispose() {
        this._onDidDetectError.dispose();
        this._disposables.forEach(d => d.dispose());
    }
}
