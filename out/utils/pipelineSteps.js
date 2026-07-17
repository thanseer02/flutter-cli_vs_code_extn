"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PIPELINES = exports.PIPELINE_STEPS = void 0;
exports.PIPELINE_STEPS = {
    clean: { name: 'Cleaning project...', commandType: 'flutter', args: ['clean'] },
    pubGet: { name: 'Getting packages...', commandType: 'flutter', args: ['pub', 'get'] },
    podInstall: { name: 'Installing iOS Pods...', commandType: 'shell', args: ['pod', 'install'], cwd: 'ios' },
};
exports.PIPELINES = {
    buildApk: {
        name: 'Build APK',
        steps: [
            exports.PIPELINE_STEPS.clean,
            exports.PIPELINE_STEPS.pubGet,
            { name: 'Building APK...', commandType: 'flutter', args: ['build', 'apk', '--release'] }
        ]
    },
    buildIpa: {
        name: 'Build IPA',
        steps: [
            exports.PIPELINE_STEPS.clean,
            exports.PIPELINE_STEPS.pubGet,
            { name: 'cd ios', commandType: 'shell', args: ['echo', 'Navigating to ios...'] },
            { name: 'pod deintegrate', commandType: 'shell', args: ['pod', 'deintegrate'], cwd: 'ios' },
            { name: 'pod cache clean --all', commandType: 'shell', args: ['pod', 'cache', 'clean', '--all'], cwd: 'ios' },
            exports.PIPELINE_STEPS.podInstall,
            { name: 'Returning to project root', commandType: 'shell', args: ['echo', 'Returning to root...'] },
            { name: 'flutter build ipa --release', commandType: 'flutter', args: ['build', 'ipa', '--release'] }
        ]
    },
    buildAppBundle: {
        name: 'Build AppBundle',
        steps: [
            exports.PIPELINE_STEPS.clean,
            exports.PIPELINE_STEPS.pubGet,
            { name: 'Building AppBundle...', commandType: 'flutter', args: ['build', 'appbundle', '--release'] }
        ]
    },
    buildWeb: {
        name: 'Build Web',
        steps: [
            exports.PIPELINE_STEPS.clean,
            exports.PIPELINE_STEPS.pubGet,
            { name: 'Building Web...', commandType: 'flutter', args: ['build', 'web', '--release'] }
        ]
    },
    run: {
        name: 'Run App',
        steps: [
            exports.PIPELINE_STEPS.pubGet,
            { name: 'Running...', commandType: 'flutter', args: ['run'] }
        ]
    },
    generateJsonSerializable: {
        name: 'Generate JSON Serializable',
        steps: [
            exports.PIPELINE_STEPS.clean,
            exports.PIPELINE_STEPS.pubGet,
            { name: 'Generating...', commandType: 'dart', args: ['run', 'build_runner', 'build', '--delete-conflicting-outputs'] }
        ]
    },
};
//# sourceMappingURL=pipelineSteps.js.map