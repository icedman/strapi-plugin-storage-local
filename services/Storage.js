'use strict';

/**
 * Storage.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

const fs = require('fs');
const fse = require('fs-extra');
const exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const path = require('path');

// var JSZip = require('jszip');

var FileManager = {};

var humanSize = function (size) {
    var hz;
    if (size < 1024) hz = size + ' B';
    else if (size < 1024*1024) hz = (size/1024).toFixed(2) + ' KB';
    else if (size < 1024*1024*1024) hz = (size/1024/1024).toFixed(2) + ' MB';
    else hz = (size/1024/1024/1024).toFixed(2) + ' GB';
    return hz;
};

var humanTime = function (timestamp) {
    var t = new Date(timestamp);
    return t.toLocaleDateString() + ' ' + t.toLocaleTimeString();
};

FileManager.getStats = function(p) {
    var stats = fs.statSync(p);

    // count pages
    stats.pages = 1;
    if (/\.pdf?/.exec(p)) {
        var cmd = `cpdf -info "${p}" | grep Pages:`;
        try {
            var res = execSync(cmd).toString().trim().split(': ');
            if (res.length == 2) {
                stats.pages = parseInt(res[1]);
            }
        } catch(e) {
            // console.log(e);
        }    
    }

    return {
        folder: stats.isDirectory(),
        pages: stats.pages,
        size: stats.size,
        hsize: humanSize(stats.size),
        mtime: stats.mtime.getTime(),
        htime: humanTime(stats.mtime.getTime())
    };
};

FileManager.exists = function(p) {
    return fs.existsSync(p);
};

FileManager.list = function(dirPath) {
    try {
        var files = fs.readdirSync(dirPath);
        var stats = [];
        for (var i=0; i<files.length; ++i) {
            var fPath = path.join(dirPath, files[i]);
            var stat = FileManager.getStats(fPath);
            stat.name = files[i];
            stats.push(stat);
        }

        return stats;
    } catch(e) {
        return [];
    }
};

FileManager.remove = function(p) {
    fse.removeSync(p);
};

FileManager.mkdirs = function(dirPath) {
    fse.mkdirsSync(dirPath);
};

FileManager.move = function(srcs, dest) {
    for (var i=0; i<srcs.length; ++i) {
        var basename = path.basename(srcs[i]);
        fse.moveSync(srcs[i], path.join(dest, basename));
    }
};

FileManager.rename = function(src, dest) {
    fse.moveSync(src, dest);
};

FileManager.copy = function(src, dest) {
    fse.copySync(src, dest);
};

module.exports = FileManager;
