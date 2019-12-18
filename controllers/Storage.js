'use strict';

const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

// move this to config
const rootDir = __dirname + '../../../../../files'; // just outside project root folder

/**
 * Storage.js controller
 *
 * @description: A set of functions called "actions" of the `storage` plugin.
 */

module.exports = {

  /**
   * Default action.
   *
   * @return {Object}
   */

  index: async (ctx) => {

    const fm = strapi.plugins['storage'].services.storage;

    let query = ctx.query || {};
    let reqPath = query['path'] || '';
    let p = path.join(rootDir, reqPath);

    if (!fm.exists(p)) {
      return ctx.send('file not found: ' + p);
    }

    // console.log(p);

    const data = fs.readFileSync(p);

    // ctx.type = 'application/octet-stream'
    ctx.type = path.extname(p);
    // console.log(ctx.type);
    ctx.send(data);
  },

  upload: async (ctx) => {

    const fm = strapi.plugins['storage'].services.storage;

    let query = ctx.query || {};
    let reqPath = query['path'] || '';
    let p = path.join(rootDir, reqPath);

    if (query.type == 'mkdirs') {
        fm.mkdirs(p);
        ctx.send({
          message: 'ok'
        });
    } else {
        console.log('upload');

        const files = ctx.request.body.files;
        const file = files.file;
        let name = file.name;

        fm.mkdirs(path.dirname(p));

        let cmd = `cp "${file.path}" "${p}"`;
        exec(cmd, function (err, stdout, stderr) {
            // console.log(err);
            // console.log(stdout);
            // console.log(stderr);
        });

        // assume it works!
        ctx.send({
          message: 'ok',
          path: reqPath
        });
        return;
    }

    // Send 200 `ok`
    ctx.send({
      message: 'ok'
    });
  },

  move: async (ctx) => {

    // Send 200 `ok`
    ctx.send({
      message: 'ok'
    });
  },

  remove: async (ctx) => {
    const fm = strapi.plugins['storage'].services.storage;

    Object.keys(ctx.query).forEach( key => {
        let file = ctx.query[key];
        let p = path.join(rootDir, file);
        fm.remove(p);
    });

    // Send 200 `ok`
    ctx.send({
      message: 'ok'
    });
  }
};
