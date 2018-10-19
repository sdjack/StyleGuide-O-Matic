var gulp = require("gulp");
var eslint = require("gulp-eslint");
var del = require("del");
var styleGuideOMatic = require("./src/converter");

gulp.task("clean", function() {
  return del(["../Style-O-Matic/src/components/**/README.md", "../Style-O-Matic/styleguide/**.md"], {force: true});
});

gulp.task("generate", function() {
  return gulp
    .src(["../Style-O-Matic/src/components/**/package.json"])
    .pipe(styleGuideOMatic({examples: false}))
    .pipe(gulp.dest("../Style-O-Matic/styleguide"));
});

gulp.task("examples:clean", function() {
  return del(["../Style-O-Matic.wiki/examples/*.js", "../Style-O-Matic.wiki/examples/*.md"], {force: true});
});

gulp.task("examples:generate", function() {
  return gulp
    .src(["../Style-O-Matic/src/components/**/package.json"])
    .pipe(styleGuideOMatic({examples: true}))
    .pipe(gulp.dest("../Style-O-Matic.wiki/examples"));
});

gulp.task("styles:clean", function() {
  return del(["../Style-O-Matic.wiki/styles/*.scss", "../Style-O-Matic.wiki/styles/*.md"], {force: true});
});

gulp.task("styles:generate", function() {
  return gulp
    .src(["../Style-O-Matic/src/scss/main.scss"])
    .pipe(styleGuideOMatic({styles: true}))
    .pipe(gulp.dest("../Style-O-Matic.wiki/styles"));
});

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
gulp.task("examples", gulp.series("examples:clean", "examples:generate"));
gulp.task("styles", gulp.series("styles:clean", "styles:generate"));
gulp.task("default", gulp.series("clean", "generate"));
