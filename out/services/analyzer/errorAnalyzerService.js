"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorAnalyzerService = void 0;
const errorRules_1 = require("./errorRules");
/**
 * Service responsible for taking raw terminal output (stdout/stderr)
 * and analyzing it to find known Flutter/Gradle/iOS errors.
 */
class ErrorAnalyzerService {
    /**
     * Scans the raw log against all known error regex rules.
     * Returns the first match found, or null if it's an unknown error.
     */
    analyze(rawLogs) {
        for (const rule of errorRules_1.errorRules) {
            const match = rawLogs.match(rule.pattern);
            if (match) {
                return rule.analyze(match);
            }
        }
        return null; // No known error detected
    }
}
exports.ErrorAnalyzerService = ErrorAnalyzerService;
//# sourceMappingURL=errorAnalyzerService.js.map