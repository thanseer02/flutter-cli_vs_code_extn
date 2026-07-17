import { IFlutterExecutionService } from '../../types';

export class FlutterVersionProvider {
    constructor(private flutterService: IFlutterExecutionService) {}

    public async getVersions(cwd: string): Promise<{ flutter: string; dart: string }> {
        try {
            const { stdout } = await this.flutterService.runRaw(['--version'], { cwd });
            const flutterMatch = stdout.match(/Flutter\s+([^\s]+)/);
            const dartMatch = stdout.match(/Dart\s+([^\s]+)/);
            
            return {
                flutter: flutterMatch ? flutterMatch[1] : 'Unknown',
                dart: dartMatch ? dartMatch[1] : 'Unknown'
            };
        } catch {
            return { flutter: 'Unknown', dart: 'Unknown' };
        }
    }
}
