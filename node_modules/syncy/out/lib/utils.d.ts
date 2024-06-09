/// <reference types="node" />
import * as fs from 'fs';
export declare function normalizePath(filepath: string): string;
export declare function pathFromDestToSource(destPath: string, basePath: string): string;
export declare function pathFromSourceToDest(sourcePath: string, destPath: string, basePath: string): string;
export declare function expandDirectoryTree(filepath: string): string[];
export declare function skipUpdate(source: fs.Stats, dest: fs.Stats, updateAndDelete: boolean): boolean;
export declare function compareTime(source: fs.Stats, dest: fs.Stats): boolean;
