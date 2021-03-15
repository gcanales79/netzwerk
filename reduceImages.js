const testFolder = "./public/assets/dist/img";
const fs = require("fs");
var Jimp = require("jimp");

fs.readdir(testFolder, (err, files) => {
  files.forEach((file) => {
    fileExt = file.split(".")[1];
    //console.log(fileExt)
    if (fileExt === "png" || fileExt === "jpg") {
      console.log(file)
    
    Jimp.read("./public/assets/dist/img/"+file)
    .then((image) => {
      return image
        .resize(256, Jimp.AUTO) // resize
        .quality(70) // set JPEG quality
        .writeAsync("./public/assets/dist/img/"+file); // save
    })
    .catch((err) => {
      console.error(err);
    });
      
   
  
    }
  });
});

/*const imagemin = require('imagemin');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');

(async () => {
	const files = await imagemin(['./public/assets/dist/img/*.{jpg,png}'], {
		destination: './public/assets/dist/img',
		plugins: [
			imageminJpegtran(),
			imageminPngquant({
				quality: [0.6, 0.8]
			})
		]
	});

	console.log(files);
	//=> [{data: <Buffer 89 50 4e …>, destinationPath: 'build/images/foo.jpg'}, …]
})();*/
