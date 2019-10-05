'use strict';
const fs = require('fs');
const browserify = require('browserify');
const babelify = require('babelify');

const dobuild = function(callback)
{

    callback = callback || function(){};

    // Create a write stream for the pipe to output to
    let bundleFs = fs.createWriteStream(__dirname + '/dist/erd-plugin.js');

    // Bundle everything up in one file
    browserify({
        entries: './scripts/main.js',
        extensions: ['.js'],
        insertGlobals : true,
    })
    .transform(babelify)
    .transform('uglifyify', { global: true }) // minify
    .bundle()
    .pipe(bundleFs);

    // Now listen for the finish event to know when is done
    bundleFs.on('finish', function () {
        return callback();
    });
}

if (require.main === module) 
{
    dobuild( () =>
        console.log(`[${Date().split(' ')[4]}] Finished writing the browserify file`)
    );
}