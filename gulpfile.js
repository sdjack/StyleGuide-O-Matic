var gulp = require("gulp");
var eslint = require("gulp-eslint");
var del = require("del");

gulp.task("test:clean", function() {
  return del(["test/output/**/*"]);
});

gulp.task("test:run", function() {
  return gulp
    .src(["test/specs/**/*.js", "index.js"])
    .pipe(eslint("test/specs/.eslintrc"))
    .pipe(eslint.format());
});

gulp.task("test", gulp.series("test:clean", "test:run"));
gulp.task("default", gulp.series("test:clean", "test:run"));
