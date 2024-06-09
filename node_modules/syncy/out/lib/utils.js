'use strict';
const path = require("path");
function normalizePath(filepath) {
    return filepath.replace(/\\/g, '/');
}
exports.normalizePath = normalizePath;
function pathFromDestToSource(destPath, basePath) {
    if (basePath) {
        destPath = path.join(basePath, destPath);
    }
    return normalizePath(destPath);
}
exports.pathFromDestToSource = pathFromDestToSource;
function pathFromSourceToDest(sourcePath, destPath, basePath) {
    if (basePath) {
        sourcePath = path.relative(basePath, sourcePath);
    }
    return normalizePath(path.join(destPath, sourcePath));
}
exports.pathFromSourceToDest = pathFromSourceToDest;
function expandDirectoryTree(filepath) {
    const dirs = filepath.split('/');
    const tree = [dirs[0]];
    dirs.reduce((sum, current) => {
        const next = normalizePath(path.join(sum, current));
        tree.push(next);
        return next;
    });
    return tree;
}
exports.expandDirectoryTree = expandDirectoryTree;
function skipUpdate(source, dest, updateAndDelete) {
    if (dest && !updateAndDelete) {
        return true;
    }
    if (source.isDirectory()) {
        return true;
    }
    if (dest && compareTime(source, dest)) {
        return true;
    }
    return false;
}
exports.skipUpdate = skipUpdate;
function compareTime(source, dest) {
    return source.ctime.getTime() < dest.ctime.getTime();
}
exports.compareTime = compareTime;
