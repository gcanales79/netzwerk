/*
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

# Framework @ Sniper Front-End 3 - https://github.com/h1dd3nsn1p3r/sniper-front-end

# Package @ optimistic 

# Author @ Sparkle Themes

# Author url @ https://sparklewpthemes.com/

# License GPL-V.2.0

# Since 2017 December 

# Version 1.1.1 

++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

**/

'use strict';


// include all necessary plugins in gulp file

var gulp 				= require('gulp');

var concat  			= require('gulp-concat');

var sass       			= require('gulp-sass');

var sourcemaps 			= require('gulp-sourcemaps');

var uglify 				= require('gulp-uglify');

var rename				= require('gulp-rename');

var imagemin 			= require('gulp-imagemin');

var cache 				= require('gulp-cache');





// Task defined for java scripts bundling and minifying

gulp.task('scripts', function() {


      	return gulp.src
      		([

      		'assets/src/js/jquery/*.js', 
      		'assets/src/js/vendor/*.js', 
      		'assets/src/js/plugins/*.js',

      		])

		.pipe(concat('bundle.js'))

		.pipe(rename({suffix: '.min'}))

		.pipe(uglify())

		.pipe(gulp.dest('assets/dist/js/'));


});



gulp.task('custom-js', function() {


      	return gulp.src
      		([

      		
      		'assets/src/js/custom/*.js'


      		])

		.pipe(concat('custom.js'))

		.pipe(gulp.dest('assets/dist/js/'));


});

// Task define for compliling scss file

gulp.task('sass', function() {

  
	  	 return gulp.src('assets/src/scss/**/*.scss', {style: 'compressed'})

	  	.pipe(rename({suffix: 'custom'}))

	    .pipe(sourcemaps.init())  // Process the original sources

	    .pipe(sass())

	    .pipe(sourcemaps.write()) // Add the map to modified source.

	    .pipe(gulp.dest('assets/dist/css/unminified/'));
});



// Define task to optimize images in project

gulp.task('images', function() {


  	return gulp.src('assets/src/img/**/*')

    .pipe(cache(imagemin({ optimizationLevel:5, progressive: true, interlaced: true })))

    .pipe(gulp.dest('assets/dist/img'));

});


// Task watch

gulp.task('watch', function() {


	  // Watch .js files

	  gulp.watch('assets/src/js/*.js', ['scripts']);

	   gulp.watch('assets/src/js/*.js', ['custom-js']);


	   // Watch .scss files


	  gulp.watch('assets/src/scss/*.scss', ['sass']);


	   // Watch image files

	  gulp.watch('assets/src/img/**/*', ['images']);

	  


});


// declaring final task and command tasker

// just hit the command "gulp" it will run the following tasks...


gulp.task('default', ['scripts', 'images' , 'sass' , 'custom-js', 'watch']);
