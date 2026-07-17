"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoctorParser = void 0;
/**
 * Utility class to parse the raw stdout from `flutter doctor`.
 */
class DoctorParser {
    /**
     * Parses the raw output of `flutter doctor` into structured categories.
     */
    static parse(stdout) {
        const lines = stdout.split('\n');
        const categories = [];
        let currentCategory = null;
        // Regex to match category headers like [✓] Flutter (Channel stable...)
        // Matches:
        // Group 1: The status symbol (✓, !, ✗, x, or space)
        // Group 2: The rest of the title string
        const headerRegex = /^\[(✓|!|✗|x| )\]\s+(.*)/i;
        for (const line of lines) {
            const rawLine = line.trimRight();
            if (rawLine.length === 0)
                continue;
            const match = rawLine.match(headerRegex);
            if (match) {
                // We found a new category header
                const symbol = match[1];
                const title = match[2].trim();
                let status = 'success';
                if (symbol === '!') {
                    status = 'warning';
                }
                else if (symbol === '✗' || symbol.toLowerCase() === 'x') {
                    status = 'error';
                }
                currentCategory = {
                    title,
                    status,
                    details: []
                };
                categories.push(currentCategory);
            }
            else if (currentCategory) {
                // This line is a detail for the current category
                // E.g. "    ! Some Android licenses not accepted."
                const detail = rawLine.trim();
                if (detail.length > 0) {
                    currentCategory.details.push(detail);
                }
            }
        }
        return categories;
    }
}
exports.DoctorParser = DoctorParser;
//# sourceMappingURL=doctorParser.js.map