export interface PipelineStep {
    name: string;
    commandType: 'flutter' | 'dart' | 'shell';
    args: string[];
    cwd?: string; // e.g., 'ios' for pod install
}

export interface CommandPipeline {
    name: string;
    steps: PipelineStep[];
}
