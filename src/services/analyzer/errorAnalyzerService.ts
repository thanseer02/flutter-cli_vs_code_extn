import { IErrorAnalyzerService } from '../../types';
import { ErrorAnalysis } from '../../models/analyzer';
import { errorRules } from './errorRules';

/**
 * Service responsible for taking raw terminal output (stdout/stderr)
 * and analyzing it to find known Flutter/Gradle/iOS errors.
 */
export class ErrorAnalyzerService implements IErrorAnalyzerService {
    
    /**
     * Scans the raw log against all known error regex rules.
     * Returns the first match found, or null if it's an unknown error.
     */
    public analyze(rawLogs: string): ErrorAnalysis | null {
        for (const rule of errorRules) {
            const match = rawLogs.match(rule.pattern);
            if (match) {
                return rule.analyze(match);
            }
        }
        return null; // No known error detected
    }
}
