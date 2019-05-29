var gulp = require('gulp');

var imgminify = require('gulp-imgminify');

gulp.task('imgminify-resources', function (cb) {
    return gulp.src([
        '../../build/web-mobile/res/raw-assets/**/*.{jpg,png}'])
        .pipe(imgminify())
        .pipe(gulp.dest('../../build/web-mobile/res/raw-assets/'));
});

gulp.task('imgminify-textures', ['imgminify-resources'], function (cb) {
    return gulp.src([
        '../../build/web-mobile/res/raw-assets/Textures/compress/**/*.{jpg,png}'])
        .pipe(imgminify())
        .pipe(gulp.dest('../../build/web-mobile/res/raw-assets/Textures/compress/'));
});

gulp.task('imgminify', ['imgminify-resources'], function (cb) {

});