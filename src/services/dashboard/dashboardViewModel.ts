import * as vscode from 'vscode';
import { ProjectInfoService, ProjectInfo } from './projectInfoService';
import { AndroidInfoProvider, AndroidInfo } from './androidInfoProvider';
import { IOSInfoProvider, IOSInfo } from './iosInfoProvider';
import { ApiConfigurationDetector } from './apiConfigurationDetector';
import { FlutterVersionProvider } from './flutterVersionProvider';
import { FlavorDetector } from './flavorDetector';
import { IFlutterExecutionService } from '../../types';
import { serviceContainer } from '../serviceContainer';

export interface DashboardDataCache {
    project: ProjectInfo | null;
    android: AndroidInfo | null;
    ios: IOSInfo | null;
    apiUrls: string[] | null;
    versions: { flutter: string; dart: string } | null;
    flavors: string[] | null;
}

export class DashboardViewModel {
    private cache: DashboardDataCache = {
        project: null,
        android: null,
        ios: null,
        apiUrls: null,
        versions: null,
        flavors: null,
    };

    private _onDidChange = new vscode.EventEmitter<void>();
    public readonly onDidChange = this._onDidChange.event;
    private fileWatchers: vscode.FileSystemWatcher[] = [];

    private projectInfoService = new ProjectInfoService();
    private androidInfoProvider = new AndroidInfoProvider();
    private iosInfoProvider = new IOSInfoProvider();
    private apiConfigDetector = new ApiConfigurationDetector();
    private flavorDetector = new FlavorDetector();
    private flutterVersionProvider: FlutterVersionProvider;

    constructor() {
        const flutterExecutionService = serviceContainer.get<IFlutterExecutionService>('FlutterExecutionService');
        this.flutterVersionProvider = new FlutterVersionProvider(flutterExecutionService);
        this.setupWatchers();
    }

    private setupWatchers() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) return;
        const cwd = workspaceFolders[0].uri.fsPath;

        // Watch pubspec.yaml
        const pubspecWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(cwd, 'pubspec.yaml'));
        pubspecWatcher.onDidChange(() => this.invalidate('project'));
        pubspecWatcher.onDidCreate(() => this.invalidate('project'));
        
        // Watch android/app/build.gradle
        const androidWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(cwd, 'android/app/build.gradle'));
        androidWatcher.onDidChange(() => this.invalidate('android'));
        androidWatcher.onDidCreate(() => this.invalidate('android'));

        // Watch ios
        const iosWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(cwd, 'ios/**/*.{pbxproj,plist}'));
        iosWatcher.onDidChange(() => this.invalidate('ios'));
        
        // Watch API configurations
        const apiWatcher = vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(cwd, '{.env,lib/**/{*constants*,*config*,*api*,*env*,main}.dart}'));
        apiWatcher.onDidChange(() => this.invalidate('apiUrls'));
        apiWatcher.onDidCreate(() => this.invalidate('apiUrls'));

        this.fileWatchers.push(pubspecWatcher, androidWatcher, iosWatcher, apiWatcher);
    }

    private invalidate(key: keyof DashboardDataCache) {
        this.cache[key] = null;
        if (key === 'project') this.cache.android = null; // pubspec version affects android/ios versions potentially
        if (key === 'project') this.cache.ios = null;
        this._onDidChange.fire();
    }

    public async getData(): Promise<DashboardDataCache> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const cwd = workspaceFolders ? workspaceFolders[0].uri.fsPath : undefined;
        if (!cwd) return this.cache;

        const promises: Promise<void>[] = [];

        if (!this.cache.project) promises.push(this.projectInfoService.getProjectInfo(cwd).then(r => { this.cache.project = r; }));
        if (!this.cache.android) promises.push(this.androidInfoProvider.getInfo(cwd).then(r => { this.cache.android = r; }));
        if (!this.cache.ios) promises.push(this.iosInfoProvider.getInfo(cwd).then(r => { this.cache.ios = r; }));
        if (!this.cache.apiUrls) promises.push(this.apiConfigDetector.detect(cwd).then(r => { this.cache.apiUrls = r; }));
        if (!this.cache.flavors) promises.push(this.flavorDetector.detect(cwd).then(r => { this.cache.flavors = r; }));
        if (!this.cache.versions) promises.push(this.flutterVersionProvider.getVersions(cwd).then(r => { this.cache.versions = r; }));

        await Promise.all(promises);
        return this.cache;
    }

    public dispose() {
        this.fileWatchers.forEach(w => w.dispose());
        this._onDidChange.dispose();
    }
}
