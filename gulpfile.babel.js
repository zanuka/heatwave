const path = require('path')
const gulp = require('gulp')
const eslint = require('gulp-eslint')
const babel = require('gulp-babel')
const Server = require('karma').Server

/**
 * Run all Heatwave tests once and exit
 */

gulp.task('testOnce', function(done) {
  new Server({
    configFile: path.join(__dirname, 'karma.conf.js'),
    singleRun: true
  }, done).start()
})

/**
 * Watch for Heatwave file changes and re-run tests
 */

gulp.task('testTDD', function(done) {
  new Server({
    configFile: path.join(__dirname, 'karma.conf.js')
  }, done).start()
})

/**
 * Run ESLint tests on Heatwave source
 */

gulp.task('lint', function() {
  return gulp.src('src/heatwave.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
})

/**
 * Transpile Heatwave with Babel and save to lib
 */

gulp.task('build', function() {
  return gulp.src('src/heatwave.js')
    .pipe(babel())
    .pipe(gulp.dest('lib'))
})

/**
 * Set `gulp test` to run eslint and singleRun test
 */

gulp.task('test', ['lint', 'testOnce'])

/**
 * Set `gulp tdd` to run eslint and karma tdd
 */

gulp.task('tdd', ['lint', 'testTDD'])

/**
 * Set default `gulp` to just run test
 */

gulp.task('default', ['test'])
