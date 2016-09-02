var gulp = require('gulp');
var watch = require('gulp-watch');
var del = require('del');
var aureliaBundler = require('aurelia-bundler');
var browserSync = require('browser-sync');

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

gulp.task('serve-bundle', function (done) {
  // copy src to dist
  var source = './src', destination = './dist';
  gulp.src(source + '/**/*', { base: source }).pipe(gulp.dest(destination));

  // delete app-build.js and vendor-build.js from dist
  del(['dist/app-build.js', 'dist/vendor-build.js']);

  aureliaBundler.bundle(config).then(() => {
    browserSync({
      online: false,
      open: false,
      port: 9000,
      server: {
        baseDir: ['.'],
        middleware: function (req, res, next) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          next();
        }
      }
    }, done);
  });
});

gulp.task('serve', function (done) {
  del(['dist/app-build.js', 'dist/vendor-build.js']);

  aureliaBundler.unbundle(config)
    .then(() => {
      browserSync({
        online: false,
        open: false,
        port: 9000,
        server: {
          baseDir: ['.'],
          middleware: function (req, res, next) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            next();
          }
        }
      }, done)
    })
    .then(() => {
      var source = './src', destination = './dist';
      gulp.src(source + '/**/*', { base: source })
        .pipe(watch(source, { base: source }))
        .pipe(gulp.dest(destination));
    });

});

gulp.task('deploy', function () {
  console.log("start deploy")
  return aureliaBundler.bundle(config)
    .then(() => console.log("bundle : done"))
    .then(() => console.log("deploy to s3 : done"))
    .then(() => bundler.unbundle(config))
    .then(() => console.log("unbundle : done"));
});