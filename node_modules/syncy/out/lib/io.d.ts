/// <reference types="node" />
import * as fs from 'fs';
import * as rimraf from 'rimraf';
export declare function pathExists(filepath: string): Promise<boolean>;
export declare function statFile(filepath: string): Promise<fs.Stats>;
export declare function makeDirectory(filepath: string): Promise<any>;
export declare function removeFile(filepath: string, options: rimraf.IOptions): Promise<{}>;
