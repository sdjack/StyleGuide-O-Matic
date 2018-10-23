var gulp = require("gulp");
var eslint = require("gulp-eslint");
var del = require("del");
var styleGuideOMatic = require("./src/converter");
var srcRoot = "../Style-O-Matic/src";
var destRoot = "../Style-O-Matic.wiki";
var cList = [
  "Accordion",
  "Badge",
  "Breadcrumbs",
  "Button",
  "ButtonBar",
  "Card",
  "DatePicker",
  "Drawer",
  "Dropdown",
  "Footer",
  "Form",
  "Grid",
  "Header",
  "Input",
  "Main",
  "Loading",
  "Modal",
  "Nav",
  "Pagination",
  "Pill",
  "Radio",
  "Select",
  "Table",
  "Tabs",
  "Textarea",
  "Title",
  "Toasts",
  "ToolBar",
  "ToolTip"
];
gulp.task("clean", function() {
  return del([`${srcRoot}/components/**/README.md`, `${destRoot}/*`], {force: true});
});

gulp.task("generate", function() {
  return gulp
    .src([`${srcRoot}/**/*`])
    .pipe(styleGuideOMatic({
      examples: false,
      src: {
        root: srcRoot,
        components: "components",
        styles: `${srcRoot}/scss`
      },
      dest: destRoot,
      componentList: cList
    }))
    .pipe(gulp.dest(destRoot));
});

gulp.task("examples:clean", function() {
  return del([`${destRoot}/examples/*`], {force: true});
});

gulp.task("examples:generate", function() {
  return gulp
    .src([`${srcRoot}/components/**/package.json`])
    .pipe(styleGuideOMatic({
      examples: true,
      src: {
        root: srcRoot,
        components: "components",
        styles: `${srcRoot}/scss`
      },
      dest: destRoot,
      componentList: cList
    }))
    .pipe(gulp.dest(`${destRoot}/examples`));
});

gulp.task("styles:clean", function() {
  return del([`${destRoot}/styles/*`], {force: true});
});

gulp.task("styles:generate", function() {
  return gulp
    .src([`${srcRoot}/scss/main.scss`])
    .pipe(styleGuideOMatic({
      examples: false,
      styles: true,
      src: {
        root: srcRoot,
        components: "components",
        styles: `${srcRoot}/scss`
      },
      dest: destRoot,
      componentList: cList
    }))
    .pipe(gulp.dest(`${destRoot}/styles`));
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
