/**
 * Gulpfile for Academic Portfolio Website
 * 
 * This build system supports Bootstrap 5 (no jQuery required) and provides:
 * - Vendor file management (Bootstrap 5)
 * - CSS minification for custom stylesheets
 * - Development server with live reload
 * 
 * Available tasks:
 * - gulp vendor: Copy Bootstrap 5 from node_modules to vendor directory
 * - gulp css: Minify custom CSS files
 * - gulp dev: Start development server with live reload
 * - gulp clean: Remove old vendor files (jQuery)
 */

const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const fs = require('fs');
const path = require('path');

// Clean old vendor files (jQuery no longer needed with Bootstrap 5)
function cleanVendor(cb) {
  const jqueryPath = './vendor/jquery';
  if (fs.existsSync(jqueryPath)) {
    fs.rmSync(jqueryPath, { recursive: true, force: true });
    console.log('Removed jQuery vendor directory (no longer needed with Bootstrap 5)');
  }
  cb();
}

// Copy third party libraries from /node_modules into /vendor
function vendor() {
  // Bootstrap
  return gulp.src([
      './node_modules/bootstrap/dist/**/*',
      '!./node_modules/bootstrap/dist/css/bootstrap-grid*',
      '!./node_modules/bootstrap/dist/css/bootstrap-reboot*'
    ])
    .pipe(gulp.dest('./vendor/bootstrap'));
}

// Minify custom CSS
function minifyCSS() {
  return gulp.src(['./css/*.css', '!./css/*.min.css'])
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest('./css'));
}

// Configure the browserSync task
function browserSyncServe(cb) {
  browserSync.init({
    server: {
      baseDir: "./"
    }
  });
  cb();
}

// BrowserSync reload
function browserSyncReload(cb) {
  browserSync.reload();
  cb();
}

// Watch files
function watchFiles() {
  gulp.watch('./css/*.css', gulp.series(browserSyncReload));
  gulp.watch('./*.html', gulp.series(browserSyncReload));
}

// Clean task
exports.clean = cleanVendor;

// Vendor task (clean old files first, then copy new ones)
exports.vendor = gulp.series(cleanVendor, vendor);

// CSS minification task
exports.css = minifyCSS;

// Dev task
exports.dev = gulp.series(browserSyncServe, watchFiles);

// Default task
exports.default = exports.vendor;
