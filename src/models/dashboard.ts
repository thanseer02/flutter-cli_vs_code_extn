export interface DashboardData {
    projectName: string;
    gitBranch: string;
    flutterVersion: string;
    dartVersion: string;
    androidVersion: string;
    iosVersion: string;
    baseUrl: string;
    bundleName: string;
    devices: { name: string; id: string; isEmulator: boolean }[];
    dependenciesCount: number;
    recentCommands: string[];
    latestBuildStatus: 'success' | 'failed' | 'idle';
}
