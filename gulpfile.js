var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var plumber = require('gulp-plumber');
var browserSync = require('browser-sync');


// VARIABLES ======================================================
var isDist = $.util.env.type === 'dist';
var dontBreak = false; //should be set to true during watch
var outputFolder = isDist ? 'dist' : 'build';

var globs = {
  sass: 'src/style/**/*.scss',
  templates: 'src/templates/**/*.html',
  assets: 'src/assets/**/*.*',
  app: 'src/app/**/*.ts',
  appWithDefinitions: 'src/**/*.ts',
  index: 'src/index.html'
};

var destinations = {
  css: outputFolder + "/style",
  js: outputFolder + "/src",
  libs: outputFolder + "/vendor",
  assets: outputFolder + "/assets",
  index: outputFolder
};

// When adding a 3rd party we want to insert in the html, add it to
// vendoredLibs, order matters
var vendoredLibs = [
  'vendor/angular/angular.js',
  'vendor/ui-router/release/angular-ui-router.js',
];

// Will be filled automatically
var vendoredLibsMin = [];

var injectLibsPaths = {
  dev: [],
  dist: []
};

var injectPaths = {
  dev: [],
  dist: []
};

vendoredLibs.forEach(function(lib) {
  // take the filename
  var splittedPath = lib.split('/');
  var filename = splittedPath[splittedPath.length -1];
  injectLibsPaths.dev.push(destinations.libs + '/' + filename);
  // And get the minified version
  filename = filename.split('.')[0] + '.min.js';
  splittedPath[splittedPath.length - 1] = filename;
  vendoredLibsMin.push(splittedPath.join('/'));
  injectLibsPaths.dist.push(destinations.libs + '/' + filename);
});

['dev', 'dist'].forEach(function (env) {
  injectPaths[env] = injectLibsPaths[env].concat([
    destinations.js + "/app/**/module.js",
    isDist ? destinations.js + '/app.js' : destinations.js + "/app/**/*.js",
    destinations.js + "/templates.js",
    destinations.css + "/*.css"
  ]);
});

// function to sanely handle the errors with plumber
function handleError(err){
  if(err){
    var warn = function(msg){$.util.log($.util.colors.red(msg));};
    warn(err);
    $.util.beep();
    if(!dontBreak){
      warn('the task failed. Terminating');
      process.exit(-1);
    }
  }
}

function plumbError() {
  return plumber(handleError);
}

var tsProject = $.typescript.createProject({
  declarationFiles: true,
  noExternalResolve: true,
  noImplicitAny: true
});

// TASKS ===========================================================

gulp.task('sass', function () {
  return gulp.src(globs.sass)
    .pipe(plumbError())
    .pipe($.sass({style: 'compressed'}).on('error', $.sass.logError))
    .pipe($.autoprefixer())  // defauls to > 1%, last 2 versions, Firefox ESR, Opera 12.1
    .pipe(gulp.dest(destinations.css))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('ts-lint', function () {
  return gulp.src(globs.app)
    .pipe(plumbError())
    .pipe($.tslint())
    .pipe($.tslint.report('prose', {emitError: true}));
});

gulp.task('ts-compile', function () {
  var tsResult = gulp.src(globs.appWithDefinitions)
    .pipe(plumbError())
    .pipe($.typescript(tsProject));

  return tsResult.js.pipe(isDist ? $.concat('app.js') : $.util.noop())
    .pipe($.ngAnnotate({gulpWarnings: false}))
    .pipe(isDist ? $.uglify() : $.util.noop())
    .pipe($.wrap({ src: './iife.txt'}))
    .pipe(gulp.dest(destinations.js))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('templates', function () {
  return gulp.src(globs.templates)
    .pipe(plumbError())
    .pipe($.minifyHtml({
      empty: true,
      spare: true,
      quotes: true
    }))
    .pipe($.ngHtml2js({moduleName: 'templates'}))
    .pipe($.concat('templates.js'))
    .pipe(isDist ? $.uglify() : $.util.noop())
    .pipe(gulp.dest(destinations.js))
    .pipe(browserSync.reload({stream: true}));
});

gulp.task('clean', function (cb) {
  del(['dist/', 'build/'], cb);
});

gulp.task('browser-sync', function () {
  return browserSync({
    open: false,
    server: {
      baseDir: "./build"
    },
    watchOptions: {
      debounceDelay: 1000
    }
  });
});

gulp.task('copy-vendor', function () {
  return gulp.src(isDist ? vendoredLibsMin : vendoredLibs)
    .pipe(plumbError())
    .pipe(gulp.dest(destinations.libs));
});

gulp.task('copy-assets', function () {
  return gulp.src(globs.assets)
    .pipe(plumbError())
    .pipe(gulp.dest(destinations.assets));
});

gulp.task('index', function () {
  var target = gulp.src(globs.index);
  var _injectPaths = isDist ? injectPaths.dist : injectPaths.dev;

  return target.pipe(
    $.inject(gulp.src(_injectPaths, {read: false}), {
      ignorePath: outputFolder,
      addRootSlash: false
    }))
  .pipe(plumbError())
  .pipe(gulp.dest(destinations.index));
});

gulp.task('watch', function() {
  dontBreak = true; // set the dontBreak property to true so that the build is not aborted
  gulp.watch(globs.sass, gulp.series('sass'));
  gulp.watch(globs.appWithDefinitions, gulp.series('ts-lint', 'ts-compile'));
  gulp.watch(globs.templates, gulp.series('templates'));
  gulp.watch(globs.index, gulp.series('index'));
  gulp.watch(globs.assets, gulp.series('copy-assets'));
});

gulp.task(
  'build',
  gulp.series(
    'clean',
    'ts-lint',
    gulp.parallel('sass', 'copy-assets', 'ts-compile', 'templates', 'copy-vendor'),
    'index'
  )
);

gulp.task(
  'default',
  gulp.series('build', gulp.parallel('browser-sync', 'watch'))
);
