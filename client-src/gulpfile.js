/* global __dirname, require */

require('es6-promise').polyfill();  // needed for node versions < 0.12
 
var babel = require('babelify'),
    browserify = require('browserify'),
    autoprefixer = require('autoprefixer'),
    browserSync = require('browser-sync'),
    buffer = require('vinyl-buffer'),
    gulp = require('gulp'),
    sass = require('gulp-sass'),
    minifyCss = require('gulp-minify-css'),
    path = require('path'),
    postcss = require('gulp-postcss'),
    reload = browserSync.reload,
    rimraf = require('rimraf'),
    runSequence = require('run-sequence'),
    source = require('vinyl-source-stream'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    watchify = require('watchify');

//var destDir = './dist';
var destDir = '../public';

function compile(watch) {
  var bundler = watchify(
    browserify({
      debug: true,
      paths: ['./app/js/'],
      extensions: ['.js', '.jsx']
    }).transform(babel.configure({
      optional: ["es7.decorators"],
      blacklist: ["regenerator"]
    })).require('./app/js/app.js', {entry: true})
  );
 
  function rebundle() {
    return bundler.bundle()
      .on('error', function(err) {
            // TODO: inspect the err object and see if we can output the actual problem source.
            console.error(err.message);
            this.emit('end');
        })
      .pipe(source('bundle.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
 
      // uglifyjs strips out debugger statements (option for this added in
      // uglifyjs2).
      // For now, comment out uglify, but should probably use process.env to
      // switch on/off.
      //.pipe(uglify())
 
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(destDir + '/js'));
  }
 
  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle().pipe(reload({stream: true}));
    });

    // https://github.com/gulpjs/gulp/issues/167
    // prevent process from hanging during non-wathing-style builds
    gulp.on('stop', function() {
      process.nextTick(function() {
        process.exit(0);
      });
    });
  }
 
  return rebundle();
}
 
function watch() {
  return compile(true);
}
 
gulp.task('clean', function (callback) {
  rimraf(destDir, callback);
});

 
gulp.task('js', compile);
 
gulp.task('html', function() {
  return gulp.src(
    'app/**/*.html')
    .pipe(gulp.dest(destDir))
    .pipe(reload({stream: true}));
});
 

gulp.task('styles', function () {
  return gulp.src('app/styles/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed',
      includePaths: [
        'app/styles/',
        'node_modules/react-foundation-apps/bower_components/foundation-apps/scss'
      ]
    }).on('error', sass.logError))
    .pipe(postcss([autoprefixer({ browsers: ['last 2 versions'] })]))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(destDir + '/styles'))
    .pipe(reload({stream: true}));
});
 
gulp.task('build', function (callback) {
  runSequence(
    'clean',
    ['html', 'styles', 'js'],
    callback);
});
 
gulp.task('browser-sync', function() {
    browserSync({
        server: destDir
    });
    gulp.watch('app/styles/**/*.scss', ['styles']);
    gulp.watch('app/*.html', ['html']);
    return watch();
});
 
gulp.task('serve', function (callback) {
  runSequence('build', 'browser-sync', callback);
});
 
gulp.task('default', ['serve']);
