import * as assert from 'assert';
import * as vscode from 'vscode';
import { ErrorAnalyzerService } from '../../services/analyzer/errorAnalyzerService';
import { ILogger, IProcessManager, IFlutterExecutionService, IPipelineExecutorService, IWorkspaceService, IDashboardDataService } from '../../types';
import { serviceContainer } from '../../services/serviceContainer';

// Mock Logger
class MockLogger implements ILogger {
    private _onDidLog = new vscode.EventEmitter<string>();
    public readonly onDidLog = this._onDidLog.event;
    
    info(message: string): void { this._onDidLog.fire(message); }
    warn(message: string): void { this._onDidLog.fire(message); }
    error(message: string, error?: any): void { this._onDidLog.fire(message); }
    debug(message: string): void { this._onDidLog.fire(message); }
    show(): void {}
    clear(): void {}
    getLogBuffer(): string[] { return []; }
    async exportLogs(): Promise<void> {}
}

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('ErrorAnalyzerService detects Gradle Error', (done) => {
        const logger = new MockLogger();
        serviceContainer.register<ILogger>('Logger', logger);
        
        const analyzer = new ErrorAnalyzerService();
        
        analyzer.onDidDetectError((analysis) => {
            assert.strictEqual(analysis.problem, 'Gradle Daemon Error');
            assert.strictEqual(analysis.fixes.length > 0, true);
            done();
        });
        
        logger.info('Some random log output');
        logger.error('Failed to apply plugin [id \\\'com.android.internal.version-check\\\']');
    });
});
