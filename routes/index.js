var express = require('express'),
    router = express.Router(),
    multer = require('multer'),
    upload = multer({dest: 'public/upload/'}),
    fs = require('fs'),
    path = require('path'),
    pathToUpload = path.join(__dirname, '../public/upload'),
    csv = require("fast-csv");
router.get('/', function (req, res) {
    res.render('index', {exercise: 'CSV Upload'});
});

router.post('/upload', upload.single('file'), calculateTotals, function (req, res) {

    res.sendStatus(200);
});

module.exports = router;

function calculateTotals(req, res, next) {
    processAllFilesInUploadFolder(processCsvLoansFile);

    processAllFilesInUploadFolder(cleanUploadFolder);

    next();
}

function processAllFilesInUploadFolder(callback) {
    fs.readdir(pathToUpload, function (err, items) {

        if (!items || items.length == 0)
            return;

        for (var i = 0; i < items.length - 1; i++) {
            callback(items[i]);
        }
    });
}

function processCsvLoansFile(file) {
    var pathToFile = getFullPathTo(file);

    var stream = fs.createReadStream(pathToFile);

    var RawLoans = [];

    var csvStream = csv()
        .on("data", function (data) {
            RawLoans.push(data);
        })
        .on("end", function () {
            aggregateData(RawLoans);
        });

    stream.pipe(csvStream);
}

function aggregateData(rawLoans) {

    // var headerItems = rawLoans[0];
    //
    // headerItems.forEach(function (headerItem, headerItemIndex) {
    // });
    //
    // rawLoans.forEach(function (item, index) {
    //
    // });
    //
    // writeAggregatedData(headerItems, "");
}

function writeAggregatedData(headerItems, data) {

}

function cleanUploadFolder(file) {
    var pathToFile = getFullPathTo(file);

    if (fs.existsSync(path))
        fs.unlink(pathToFile);
}

function getFullPathTo(file) {
    return path.join(pathToUpload, file);
}