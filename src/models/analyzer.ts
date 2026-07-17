/**
 * Represents a structured analysis of a command error.
 */
export interface ErrorAnalysis {
    problem: string;
    explanation: string;
    fixes: string[];
    links: string[];
}
