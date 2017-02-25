var express = require('express'),
    router = express.Router(),
    formidable = require('formidable'),
    http = require('http'),
    util = require('util'),
    fs = require('fs'),
    path = require("path"),
    csv = require("fast-csv");

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {exercise: 'CSV Upload'});
});

router.post('/upload', function (req, res, next) {
    var form = new formidable.IncomingForm();

    form
        .parse(req, function (err, fields, files) {
            console.log(form);
        })
        .on('end', function (fields, files) {
            /* Temporary location of our uploaded file */
            var temp_path = this.openedFiles[0].path;
            /* The file name of the uploaded file */
            var file_name = this.openedFiles[0].name;

            var stream = fs.createReadStream(path.resolve(temp_path, file_name));

            var csvStream = csv.format({headers: true, quoteColumns: [true], quoteHeaders: [false, true]})
                .on("data", function (data) {
                    console.log(data);
                })
                .on("end", function () {
                    console.log("done");

                    res.sendStatus(200);
                });

            stream.pipe(csvStream);

        });
});

module.exports = router;