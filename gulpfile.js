//Gulp resources: http://yeoman.io/blog/performance-optimization.html

var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    clean = require('gulp-clean'),
    concat = require('gulp-concat'),
    //notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr();

gulp.task('styles', function() {
  return gulp.src('assets/scss/app.scss')
    .pipe(sass({ style: 'compressed'}))//Note: sourcemap requires sass 3
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(gulp.dest('assets/css'))
    //.pipe(rename({suffix: '.min'}))
    //.pipe(minifycss())
    .pipe(gulp.dest('assets/css'))
    .pipe(livereload(server));
    //.pipe(notify({ message: 'Styles task complete' }));
});

// Scripts
gulp.task('scripts', function() {
  return gulp.src('assets/js/app.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    //.pipe(concat('app.js'))
    //.pipe(gulp.dest('assets/js'))
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify({outSourceMap: true}))
    .pipe(livereload(server))
    .pipe(gulp.dest('assets/js'));
    //.pipe(notify({ message: 'Scripts task complete' }));
});

// Images
//gulp.task('images', function() {
//  return gulp.src('src/images/**/*')
//    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
//    .pipe(livereload(server))
//    .pipe(gulp.dest('dist/images'))
//    .pipe(notify({ message: 'Images task complete' }));
//});

//HTML - Just watch and reload
gulp.task('html', function() {
    return gulp.src('**/*.html')
        .pipe(gulp.dest(''))
        .pipe(livereload(server));
        //.pipe(notify({ message: 'HTML task complete' }));
});

// Clean
gulp.task('clean', function() {
  //return gulp.src(['dist/styles', 'dist/scripts', 'dist/images'], {read: false})
  //  .pipe(clean());
});

gulp.task('default', ['clean'], function() {
    gulp.start('styles');
});

gulp.task('watch', function() {

    //gulp.watch('assets/scss/app.scss', ['styles']);

  // Listen on port 35729
  server.listen(35729, function (err) {
    if (err) {
      return console.log(err)
    };

    // Watch .scss files
    gulp.watch('assets/scss/**/*.scss', ['styles']);

    // Watch .js files
    gulp.watch('assets/js/**/*.js', ['scripts']);

    //Watch HTML
    gulp.watch('**/*.html', ['html']);

    // Watch image files
    //gulp.watch('src/images/**/*', ['images']);

  });

});