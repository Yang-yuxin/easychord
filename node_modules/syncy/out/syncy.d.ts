export interface ILogItem {
    action: 'copy' | 'remove';
    from: string;
    to: string;
}
export interface ILog {
    (log: ILogItem): void;
}
export interface IOptions {
    verbose?: boolean | ILog;
    base?: string;
    updateAndDelete?: boolean;
    ignoreInDest?: string | string[];
}
export declare function run(patterns: string[], dest: string, sourceFiles: string[], options: IOptions, log: ILog): Promise<any[]>;
export default function syncy(source: string | string[], dest: string | string[], options?: IOptions): Promise<any[][]>;
