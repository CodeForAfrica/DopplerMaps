'use strict';

const gulp          = require('gulp'),
    plugins         = require('gulp-load-plugins')(),
    del             = require('del'),
    rollup          = require('rollup-stream'),
    source          = require('vinyl-source-stream'),
    buffer          = require('vinyl-buffer'),
    babel           = require('rollup-plugin-babel'),
    nodeResolve     = require('rollup-plugin-node-resolve'),
    browserSync     = require('browser-sync').create(),
    reload          = browserSync.reload;


gulp.task('default', ['lint', 'build']);

gulp.task('lint', ['lint:scripts']);

gulp.task('lint:scripts', () => {
    return gulp.src('js/doppler-maps.js')
        .pipe(plugins.changedInPlace())
        .pipe(plugins.jshint({
            esversion: 6
        }))
        .pipe(plugins.jshint.reporter('default'))
        .pipe(plugins.jshint.reporter('fail'));
});

gulp.task('build', ['build:scripts']);

gulp.task('build:scripts', () => {
    return rollup({
        entry: 'js/doppler-maps.js',
        format: 'iife',
        moduleName: 'MyBundle',
        plugins: [
            babel({
                exclude: 'node_modules/**',
                presets: ['es2015-rollup']
            }),
            nodeResolve({
                jsnext: true,
                main: true
            })
        ]
    })
    .pipe(source('doppler-maps.min.js'))
    .pipe(buffer())
    .pipe(plugins.uglify())
    .pipe(gulp.dest('dist/'))
    .pipe(browserSync.stream());
});

gulp.task('clean', () => del('dist/'));

gulp.task('serve', () =>  {
    browserSync.init({
        server: './',
        ghostMode: false, // do not mirror clicks, reloads, etc. (performance optimization)
        logFileChanges: true
    });

    // Watch HTML files.
    gulp.watch('*.html').on('change', reload);

    // Watch scripts.
    gulp.watch('js/**/*.js', ['lint:scripts', 'build:scripts']);
});
