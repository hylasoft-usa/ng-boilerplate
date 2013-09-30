module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-coffeelint');
  grunt.loadNpmTasks('grunt-html2js');
  grunt.loadNpmTasks('grunt-karma');

  var projectConfig = {
    projectName: 'MyProject',
    version: '0.0.0',

    buildDirectory: 'build/',
    releaseDirectory: 'release/',
    templatesApp: 'build/templates-app.js',
    templatesCommon: 'build/templates-common.js'
  };

  // Contains 3rd party js/css (installed via bower)
  var libs = {
    js: [
      'libs/angular/angular.js',
      'libs/angular-ui-router/release/angular-ui-router.js',
    ],
    css: []
  }

  // Contains all the files needed by Karma to run tests
  var testingFiles = libs.js;
  testingFiles = testingFiles.concat([
    projectConfig.templatesApp,
    projectConfig.templatesCommon,
    'libs/chai/chai.js',
    'libs/angular-mocks/angular-mocks.js',
    'src/app/**/*.coffee',
    'src/app/**/*.tests.coffee'
  ])

  var sourceFiles = ['src/**/*.coffee', '!src/**/*.tests.coffee'];

  grunt.initConfig({

    clean: [
      projectConfig.buildDirectory, projectConfig.releaseDirectory
    ],

    // Compiles coffeescript
    coffee: {
      dev: {
        expand: true,
        cwd: '.',
        src: sourceFiles,
        dest: projectConfig.buildDirectory,
        ext: '.js'
      }
    },

    // Lint coffeescript, with the 80l length rule ignored
    coffeelint: {
      options: {
        'max_line_length': {
          'level': 'ignore'
        }
      },
      src: {
        files: {
          src: sourceFiles
        }
      },
      test: {
        files: {
          src: [ '<%= app_files.coffeeunit %>' ]
        }
      }
    },

    // Creates the index page (ie, add js and css links)
    index: {
      dev: {
        dir: projectConfig.buildDirectory,
        src: [
          libs.js,
          libs.css,
          projectConfig.buildDirectory + 'src/**/*.js',
          projectConfig.templatesApp,
          projectConfig.templatesCommon
        ]
      },
      build: {

      }
    },

    // Copy libs js/css and our assets over to the build directory
    copy: {
      libs_js: {
        files: [
          {
            src: [ libs.js ],
            dest: projectConfig.buildDirectory,
            cwd: '.',
            expand: true
          }
        ]
      },

      libs_css: {
        files: [
          {
            src: [ libs.css ],
            dest: projectConfig.buildDirectory,
            cwd: '.',
            expand: true
          }
        ]
      },

      assets: {
        files: [
          {
            src: [ '**' ],
            dest: projectConfig.buildDirectory,
            cwd: 'src/assets',
            expand: true
          }
        ]  
      }
    },

    /**
     * HTML2JS is a Grunt plugin that takes all of your template files and
     * places them into JavaScript files as strings that are added to
     * AngularJS's template cache. This means that the templates too become
     * part of the initial payload as one JavaScript file. Neat!
     */
    html2js: {
      /**
       * These are the templates from `src/app`.
       */
      app: {
        options: {
          base: 'src/app'
        },
        src: [ 'src/app/**/*.html' ],
        dest: projectConfig.templatesApp
      },

      /**
       * These are the templates from `src/common`.
       */
      common: {
        options: {
          base: 'src/common'
        },
        src: [ 'src/common/**/*.html' ],
        dest: projectConfig.templatesCommon
      }
    },

    // Testing config
    karma: {
      options: {
        port: 9876,
        runnerPort: 9999,
        autoWatch: false,
        browsers: ['Firefox'],
        background: true,
        files: testingFiles,
        preprocessors: {'**/*.coffee': 'coffee'},
        plugins: ['karma-mocha', 'karma-firefox-launcher', 'karma-coffee-preprocessor'],
        frameworks: ['mocha']
      },
      continuous: {
        browsers: ['PhantomJS']
      },
      dev: {
        reporters: 'dots',
        singleRun: true,
        background: false
      }
    }

  });


  // Filter files according to the given regex
  function filterFor(files, regex) {
    return files.filter(function (file) {
      return file.match(regex);
    });  
  }

  /** 
   * The index.html template includes the stylesheet and javascript sources
   * based on dynamic names calculated in this Gruntfile. This task assembles
   * the list into variables for the template to use and then runs the
   * compilation.
   */
  grunt.registerMultiTask('index', 'Process index.html template', function () {
    // This regex will remove the 'root' path when inserting in the template
    var dirRE = new RegExp('^(build|dist)\/', 'g');
    var jsFiles = filterFor(this.filesSrc, /\.js$/).map(function (file) {
      return file.replace(dirRE, '');
    });
    var cssFiles = filterFor(this.filesSrc, /\.css$/).map(function (file) {
      return file.replace(dirRE, '');
    });

    grunt.file.copy('src/index.html', this.data.dir + '/index.html', { 
      process: function (contents, path) {
        return grunt.template.process( contents, {
          data: {
            scripts: jsFiles,
            styles: cssFiles
          }
        });
      }
    });
  });


  grunt.registerTask('dev', ['html2js', 'coffeelint:src', 'coffee:dev', 'copy', 'index:dev']);

};