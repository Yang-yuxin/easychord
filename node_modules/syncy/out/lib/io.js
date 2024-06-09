'use strict';
const fs = require("fs");
const mkpath = require("mkpath");
const rimraf = require("rimraf");
function pathExists(filepath) {
    return new Promise((resolve) => {
        fs.access(filepath, (err) => {
            resolve(!err);
        });
    });
}
exports.pathExists = pathExists;
function statFile(filepath) {
    return new Promise((resolve, reject) => {
        fs.stat(filepath, (err, stats) => {
            if (err) {
                return reject(err);
            }
            resolve(stats);
        });
    });
}
exports.statFile = statFile;
function makeDirectory(filepath) {
    return new Promise((resolve, reject) => {
        mkpath(filepath, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}
exports.makeDirectory = makeDirectory;
function removeFile(filepath, options) {
    return new Promise((resolve, reject) => {
        rimraf(filepath, options, (err) => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}
exports.removeFile = removeFile;
