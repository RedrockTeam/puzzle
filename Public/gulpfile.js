	// 引入 gulp
	var gulp = require('gulp');

	// 引入组件
	var sass = require('gulp-sass');
	var cache = require('gulp-cache')
	var concat = require('gulp-concat');
	var jshint = require('gulp-jshint');
	var uglify = require('gulp-uglify');
	var rename = require('gulp-rename');
	var cssmin = require('gulp-minify-css');
	var imagemin = require('gulp-imagemin');
	var pngquant = require('imagemin-pngquant');

	// 检查脚本
	gulp.task('jshint', function() {
	    gulp.src('./build/js/*.js')
	        .pipe(jshint())
	        .pipe(jshint.reporter('default'));
	});


	// 压缩图片
	gulp.task('imagemin', function () {
	    gulp.src('./build/images/*.{png, jpg, gif, ico}')
	        .pipe(cache(imagemin({
	            optimizationLevel: 1, //类型：Number  默认：3  取值范围：0-7（优化等级）
	            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
	            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
	            use: [pngquant({quality: '65-80'})]
	        })))
	        .pipe(gulp.dest('./src/images'));
	});


	// 合并，压缩JS
	gulp.task('scripts', function() {
	    gulp.src('./build/js/*.js')
	        .pipe(concat('index.min.js'))
	        .pipe(uglify())
	        .pipe(gulp.dest('./src/js'));
	});


	// 编译Sass
	gulp.task('sass', function() {
	    gulp.src('./build/scss/*.scss')
	        .pipe(sass())
	        .pipe(gulp.dest('./src/css'));
	});


	// 合并，压缩CSS
	gulp.task('styles', function() {
	    gulp.src('./src/css/index.css')
	        .pipe(concat('index.min.css'))
	        .pipe(cssmin())
	        .pipe(gulp.dest('./src/css'));
	});

	// 默认任务
	
	gulp.task('default', function(){

	    // 监听文件变化
	    gulp.watch('./build/js/*.js', function(){
	        gulp.run('jshint', 'scripts');
	    });

	    gulp.watch('./build/scss/*.scss', function(){
	        gulp.run('sass', 'styles');
	    });

	    gulp.watch('./build/images/*.{png, jpg, gif, ico}', function(){
	        gulp.run('imagemin');
	    });

	});
