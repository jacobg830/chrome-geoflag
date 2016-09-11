'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths
  var config = {
    app: 'app',
    dist: 'dist'
  };

  var path = require('path');

  grunt.initConfig({

    // Project settings
    config: config,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= config.app %>/scripts/{,*/}*.js'],
        tasks: ['jshint'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      styles: {
        files: ['<%= config.app %>/styles/{,*/}*.css'],
        tasks: [],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.app %>/*.html',
          '<%= config.app %>/img/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= config.app %>/manifest.json',
          '<%= config.app %>/_locales/{,*/}*.json'
        ]
      }
    },

    // Grunt server and debug server setting
    connect: {
      options: {
        port: 9000,
        livereload: 35729,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      chrome: {
        options: {
          open: false,
          base: [
            '<%= config.app %>'
          ]
        }
      }
    },

    // Empties folders
    clean: {
      chrome: {
      },
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      },
      tmp: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-pt-BR.json',
            '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-zh-CN.json',
            '<%= config.app %>/scripts/background2.js'
          ]
        }]
      }
    },

    // Import required nodejs modules
    browserify: {
      build: {
        src: ['<%= config.app %>/scripts/background.js'],
        dest: '<%= config.app %>/scripts/background2.js',
        options: {
          debug: true
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= config.app %>/scripts/{,*/}*.js',
      ]
    },
    mocha: {
      all: {
        options: {
          run: true,
          urls: ['http://localhost:<%= connect.options.port %>/index.html']
        }
      }
    },

    // Download GeoLite2 to temporary folder
    curl: {
      geolite2: {
        src: 'http://geolite.maxmind.com/download/geoip/database/GeoLite2-Country-CSV.zip',
        dest: '.tmp/geolite2.zip',
      }
    },
    unzip: {
      geolite2: {
        router: function (filepath) {
          var extname = path.extname(filepath);

          if (extname === '.csv') {
            return path.basename(filepath);
          } else {
            return null;
          }
        },
        src: '.tmp/geolite2.zip',
        dest: '.tmp/geolite2/',
      }
    },

    // Convert CSV to JSON
    convert: {
      blocks: {
        options: {
          csv: {
            columns: [
              'network',
              'geoname_id'
            ]
          }
        },
        files: [
          {
            expand: true,
            cwd: '.tmp/geolite2/',
            src: ['GeoLite2-Country-Blocks-*.csv'],
            dest: '<%= config.dist %>/geolite2/',
            ext: '.json'
          }
        ]
      },
      locations: {
        files: [
          {
            expand: true,
            cwd: '.tmp/geolite2/',
            src: ['GeoLite2-Country-Locations-*.csv'],
            dest: '<%= config.dist %>/geolite2/',
            ext: '.json'
          }
        ]
      }
    },

    // Minimize JSON
    minjson: {
      compile: {
        files: { // Does not support folders as destination
          '<%= config.dist %>/geolite2/GeoLite2-Country-Blocks-IPv4.json': '<%= config.dist %>/geolite2/GeoLite2-Country-Blocks-IPv4.json',
          '<%= config.dist %>/geolite2/GeoLite2-Country-Blocks-IPv6.json': '<%= config.dist %>/geolite2/GeoLite2-Country-Blocks-IPv6.json',
          '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-de.json': '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-de.json',
          '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-en.json': '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-en.json',
          '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-es.json': '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-es.json',
          '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-fr.json': '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-fr.json',
          '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-ja.json': '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-ja.json',
          '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-pt.json': '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-pt-BR.json',
          '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-ru.json': '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-ru.json',
          '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-zh.json': '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-zh-CN.json'
        }
      }
    },

    // Optimize JSON
    'string-replace': {
      blocks: {
        src: '<%= config.dist %>/geolite2/GeoLite2-Country-Blocks-*.json',
        dest: '<%= config.dist %>/geolite2/',
        options: {
          replacements: [
            {
              pattern: /."network":"network","geoname_id":"geoname_id".,/,
              replacement: ''
            },
            {
              pattern: /"network":/g,
              replacement: '"ip":'
            },
            {
              pattern: /"geoname_id":/g,
              replacement: '"id":'
            }
          ]
        }
      },
      locations: {
        src: '<%= config.dist %>/geolite2/GeoLite2-Country-Locations-*.json',
        dest: '<%= config.dist %>/geolite2/',
        options: {
          replacements: [
            {
              pattern: /"locale_code":"(.*?)",/g,
              replacement: ''
            },
            {
              pattern: /"geoname_id":/g,
              replacement: '"id":'
            },
            {
              pattern: /"continent_code":"(.*?)","continent_name":"(.*?)","country_iso_code":"(.*?)","country_name":"(.*?)"/g,
              replacement: '"continent":{"code":"$1","name":"$2"},"country":{"code":"$3","name":"$4"}'
            }
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      options: {
        dest: '<%= config.dist %>'
      },
      html: [
        '<%= config.app %>/popup.html',
        '<%= config.app %>/background.html'
      ]
    },
    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      options: {
        assetsDirs: ['<%= config.dist %>', '<%= config.dist %>/img']
      },
      html: ['<%= config.dist %>/{,*/}*.html'],
      css: ['<%= config.dist %>/styles/{,*/}*.css']
    },
    // The following *-min tasks produce minifies files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/img',
          src: '{,*/}*.{gif,jpeg,jpg,png}',
          dest: '<%= config.dist %>/img'
        }]
      }
    },
    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>/img',
          src: '{,*/}*.svg',
          dest: '<%= config.dist %>/img'
        }]
      }
    },
    htmlmin: {
      dist: {
        options: {
          // removeCommentsFromCDATA: true,
          // collapseWhitespace: true,
          // collapseBooleanAttributes: true,
          // removeAttributeQuotes: true,
          // removeRedundantAttributes: true,
          // useShortDoctype: true,
          // removeEmptyAttributes: true,
          // removeOptionalTags: true
        },
        files: [{
          expand: true,
          cwd: '<%= config.app %>',
          src: '*.html',
          dest: '<%= config.dist %>'
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,png,txt}',
            'img/{,*/}*.{webp,gif}',
            '{,*/}*.html',
            'styles/{,*/}*.css',
            'styles/fonts/{,*/}*.*',
            '_locales/{,*/}*.json',
          ]
        }]
      }
    },

    // Auto buildnumber, exclude debug files. smart builds that event pages
    chromeManifest: {
      dist: {
        options: {
          buildnumber: false,
          indentSize: 2,
          background: {
            target: 'scripts/background2.js',
            exclude: [
              'scripts/chromereload.js'
            ]
          }
        },
        src: '<%= config.app %>',
        dest: '<%= config.dist %>'
      }
    }
  });

  grunt.registerTask('debug', function () {
    grunt.task.run([
      'jshint',
      'connect:chrome',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'browserify',
    'chromeManifest:dist',
    'useminPrepare',
    'imagemin',
    'svgmin',
    'curl',
    'unzip',
    //'cssmin',
    'convert',
    'minjson',
    'string-replace',
    'concat',
    'uglify',
    'copy',
    'usemin',
    'clean:tmp'
  ]);

  grunt.registerTask('default', [
    'jshint',
    'build'
  ]);
};
