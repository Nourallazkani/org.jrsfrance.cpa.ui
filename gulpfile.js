var gulp = require('gulp');
var watch = require('gulp-watch');
var del = require('del');
var argv = require('yargs').argv;
var fs = require('fs');
//var replace = require('gulp-replace');
var aureliaBundler = require('aurelia-bundler');
var browserSync = require('browser-sync');
var historyApiFallback = require('connect-history-api-fallback')
var s3 = require('gulp-s3-upload');

var environments = {
  "local": {
    "apiEndpoint": "http://localhost:8080/api"
  },
  "aws": {
    "apiEndpoint": "http://cpa-env-green.eu-west-1.elasticbeanstalk.com/"
  }
}

var env = environments[argv.env || "aws"]

var config = {
  force: true,
  baseURL: '.',                   // baseURL of the application
  configPath: './config.js',      // config.js file. Must be within `baseURL`
  bundles: {
    'dist/app-build': {
      includes: [
        '**/*.css!text',
        '**/*.html!text',
        '[**/*.js]'
      ],
      // Lastly, since we are bundling for production, we want to minify as well.
      options: {
        minify: true,
        inject: true
      }
    },
    'dist/vendor-build': {
      includes: [
        // Next, we need to bundle all project dependencies. It is a good 
        // idea to explicitly all required Aurelia libraries.
        'aurelia-bootstrapper',
        'aurelia-dependency-injection',
        'aurelia-framework',
        'aurelia-templating-binding',
        'aurelia-templating-resources',
        'aurelia-loader-default',

        // Next, we include the optional Aurelia dependencies. Your project 
        // may use dependencies not listed here.
        'aurelia-fetch-client',
        'aurelia-router',
        'aurelia-templating-router',
        'aurelia-history-browser',
        'aurelia-logging-console',
        'aurelia-event-aggregator',

        // Last, we include any other project dependencies.
        'moment',
      ],

      // Lastly, since we are bundling for production, we want to minify as well.
      options: {
        minify: true,
        inject: true
      }
    }
  }
};

gulp.task('bundle', function () {
  // copy src to dist
  var source = './src', destination = './dist';
  gulp.src(source + '/**/*', { base: source }).pipe(gulp.dest(destination));

  // delete app-build.js and vendor-build.js from dist
  del(['dist/app-build.js', 'dist/vendor-build.js']);

  return aureliaBundler.unbundle(config)
    .then(() => aureliaBundler.bundle(config));
});

gulp.task('unbundle', function () {
  return aureliaBundler.unbundle(config);
});

var browserSyncSettings = { online: false, open: false, port: 9000, server: { baseDir: ['.'], middleware: [historyApiFallback()] } };

gulp.task('serve-bundle', ['bundle'], function (done) {
  browserSync(browserSyncSettings, done);
});

gulp.task('serve', ['unbundle'], function (done) {
  del(['dist/app-build.js', 'dist/vendor-build.js']);

  browserSync(browserSyncSettings, done)

  var source = './src', destination = './dist';
  gulp.src(source + '/**/*', { base: source })
    .pipe(watch(source, { base: source }))
    .pipe(gulp.dest(destination));

});
gulp.task('x', function(){
   if (argv.assets) {
    console.log("deploy assets")
  }
  if (argv.vendor) {
    console.log("deploy vendor")
  }
  if (argv.jspm) {
    console.log("deploy jspm")
  }
    var uploader = s3(JSON.parse(fs.readFileSync('awsaccess.json')))
console.log(uploader)
})

gulp.task("deploy", ['bundle'], function () {
  var app = ["./index.html", "./config.js", "./dist/app-build.js"];
  var assets = "./assets/**/**";
  var vendor = "./dist/vendor-build.js";
  var jspm = "./jspm_packages/**/**";

  var toUpload = app;
  if (argv.assets || argv.all) {
    toUpload.push(assets);
  }
  if (argv.vendor || argv.all) {
    toUpload.push(vendor);
  }
  if (argv.jspm || argv.all) {
    toUpload.push(jspm);
  }

  var uploader = s3(JSON.parse(fs.readFileSync('awsaccess.json')))
  
  gulp.src(toUpload, { base: './' })
    .pipe(uploader({ Bucket: 'jrs-cpa-test', ACL: 'public-read' }, { maxRetries: 5, region: "eu-west-1" }));
  ;
});