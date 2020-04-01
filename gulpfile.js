const gulp = require('gulp');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass');
const babel = require('gulp-babel');
const clean = require('gulp-clean');


const cssFiles = [
    './src/styles/styles.css'
];

function sassConvert() {
    return gulp.src('./src/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./src/styles/'));
}

function styles() {
    return gulp.src(cssFiles)
        .pipe(concat('styles.css'))
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCSS({ level: 2 }))
        .pipe(gulp.dest('./build/styles'))
        .pipe(browserSync.stream());
}

function watch() {
    browserSync.init({
        server: {
            baseDir: './',
            index: 'index.html',
        }
    });
    gulp.watch('./sass/**/*.scss', sass);
    gulp.watch('./src/styles/**/*.css', styles);
    gulp.watch('./src/*.html').on('change', browserSync.reload);
}
function cleanBuild() {
    return gulp.src('build/*', {read: false})
        .pipe(clean());
}


gulp.task('js', () => {
    return gulp.src('src/index.js')
        .pipe(babel())
        .pipe(gulp.dest('build/scripts/'));
});
gulp.task('styles', styles);
gulp.task('sass', sassConvert);
gulp.task('watch', watch);
gulp.task('build', gulp.series(cleanBuild, gulp.parallel(gulp.series('sass', 'styles'), 'js')));
gulp.task('dev', gulp.series('build', 'watch'));