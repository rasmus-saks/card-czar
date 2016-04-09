var gulp = require('gulp');
var uglify = require('gulp-uglify');
var stylus = require('gulp-stylus');
var eslint = require('gulp-eslint');
var jeditor = require("gulp-json-editor");
var git = require('gulp-git');
var merge = require('merge-stream');
var imagemin = require('gulp-imagemin');
var del = require('del');
var runSequence = require('run-sequence');
var awsBeanstalk = require("node-aws-beanstalk");
var zip = require('gulp-zip');
var install = require('gulp-install');
var nib = require('nib');
var rev = "" + (+Date.now());
git.revParse({args: "--short HEAD"}, function (err, hash) {
  if (!err) {
    rev = hash;
  }
});

gulp.task('clean', function () {
  return del(["./dist", "./dist.zip"]);
});
gulp.task('js', function () {
  return gulp.src('public/js/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    .pipe(uglify())
    .pipe(gulp.dest("./dist/public/js"));
});

gulp.task('css', function () {
  return gulp.src('public/css/*.styl')
    .pipe(stylus({compress: true, use: nib()}))
    .pipe(gulp.dest("./dist/public/css"));
});

gulp.task('static', ['images'], function () {
  return gulp.src(['public/**', '!public/js/*.js', '!public/css/*.styl', '!public/css/*.css', '!public/img/*.{png,jpg,jpeg,gif,svg}'])
    .pipe(gulp.dest("./dist/public"));
});

gulp.task('images', function () {
  return gulp.src(['public/img/*.{png,jpg,jpeg,gif,svg}'])
    .pipe(imagemin())
    .pipe(gulp.dest("./dist/public/img"));
});

gulp.task('lint', function () {
  return gulp.src('src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('src', ["lint"], function () {
  var src = gulp.src(['src/**', '!src/config/config.json'])
    .pipe(gulp.dest("./dist/src"));

  var config = gulp.src("src/config/config.json")
    .pipe(jeditor({rev: rev}))
    .pipe(gulp.dest("./dist/src/config"));

  return merge(src, config);
});

gulp.task('node-install', function () {
  return gulp.src('./package.json')
    .pipe(install({production: true}));
});

gulp.task('zip', function () {
  return gulp.src(["./dist/**/*", "!dist/package.json"])
    .pipe(zip('dist.zip'))
    .pipe(gulp.dest('./'));
});

gulp.task('extras', function () {
  return merge(
    gulp.src(["bower.json", "package.json"])
      .pipe(gulp.dest("./dist")),
    gulp.src(["cert/*"])
      .pipe(gulp.dest("./dist/cert")),
    gulp.src(["bower_components/*"])
      .pipe(gulp.dest("./dist/bower_components")),
    gulp.src(["views/*"])
      .pipe(gulp.dest("./dist/views"))
  );
});

gulp.task('default', function () {
  return runSequence(
    ['clean'],
    ['js', 'static', 'css', 'src', 'extras'],
    //['node-install'],
    ['zip']
  );
});
