import { PipelineStep, CommandPipeline } from '../models/pipeline';

export const PIPELINE_STEPS = {
    clean: { name: 'Cleaning project...', commandType: 'flutter', args: ['clean'] } as PipelineStep,
    pubGet: { name: 'Getting packages...', commandType: 'flutter', args: ['pub', 'get'] } as PipelineStep,
    podInstall: { name: 'Installing iOS Pods...', commandType: 'shell', args: ['pod', 'install'], cwd: 'ios' } as PipelineStep,
};

export const PIPELINES = {
    buildApk: {
        name: 'Build APK',
        steps: [
            PIPELINE_STEPS.clean,
            PIPELINE_STEPS.pubGet,
            { name: 'Building APK...', commandType: 'flutter', args: ['build', 'apk', '--release'] }
        ]
    } as CommandPipeline,
    
    buildIpa: {
        name: 'Build IPA',
        steps: [
            PIPELINE_STEPS.clean,
            PIPELINE_STEPS.pubGet,
            { name: 'cd ios', commandType: 'shell', args: ['echo', 'Navigating to ios...'] },
            { name: 'pod deintegrate', commandType: 'shell', args: ['pod', 'deintegrate'], cwd: 'ios' },
            { name: 'pod cache clean --all', commandType: 'shell', args: ['pod', 'cache', 'clean', '--all'], cwd: 'ios' },
            PIPELINE_STEPS.podInstall,
            { name: 'Returning to project root', commandType: 'shell', args: ['echo', 'Returning to root...'] },
            { name: 'flutter build ipa --release', commandType: 'flutter', args: ['build', 'ipa', '--release'] }
        ]
    } as CommandPipeline,

    buildAppBundle: {
        name: 'Build AppBundle',
        steps: [
            PIPELINE_STEPS.clean,
            PIPELINE_STEPS.pubGet,
            { name: 'Building AppBundle...', commandType: 'flutter', args: ['build', 'appbundle', '--release'] }
        ]
    } as CommandPipeline,

    buildWeb: {
        name: 'Build Web',
        steps: [
            PIPELINE_STEPS.clean,
            PIPELINE_STEPS.pubGet,
            { name: 'Building Web...', commandType: 'flutter', args: ['build', 'web', '--release'] }
        ]
    } as CommandPipeline,

    run: {
        name: 'Run App',
        steps: [
            PIPELINE_STEPS.pubGet,
            { name: 'Running...', commandType: 'flutter', args: ['run'] }
        ]
    } as CommandPipeline,
};
