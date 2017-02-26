var express = require('express'),
    router = express.Router(),
    multer = require('multer'),
    upload = multer({dest: 'public/upload/'}),
    fs = require('fs'),
    path = require('path'),
    pathToUpload = path.join(__dirname, '../public/upload'),
    csv = require("fast-csv"),
    enumerable = require('linq');

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
            var x = aggregateData(RawLoans);

            var xx = "";
        });

    stream.pipe(csvStream);
}

function aggregateData(rawLoans) {
    var loansObject = convertToJson(rawLoans);

    var simplifiedDate = enumerable
        .from(loansObject)
        .select(function (x) {
            var date = x['Date'].substring(3);
            date = date.substring(0, 3);

            return {
                'MSISDN': x['MSISDN'],
                'Network': x['Network'],
                'Product': x['Product'],
                'Date': date,
                'Amount': x['Amount']
            };
        })
        .distinct()
        .toArray();

    var tested = [];
    var aggregate = [];

    simplifiedDate.forEach(function (itemTest, indexTest) {
        var test = itemTest.MSISDN + " " + itemTest.Network + " " + itemTest.Product + " " + itemTest.Date;
        if (tested.indexOf(test) === -1) {
            tested.push(test);

            var isdn = itemTest.MSISDN,
                network = itemTest.Network,
                product = itemTest.Product,
                date = itemTest.Date,
                sum = 0.00;

            simplifiedDate.forEach(function (item, index) {
                if (item.MSISDN === isdn && item.Network === network && item.Product === product && item.Date === date) {
                    sum += parseFloat(item.Amount);
                }
            });

            aggregate.push({MSISDN: isdn, Network: network, Products: product, Date: date, Amount: sum});
        }
    });

    return aggregate;
}

function convertToJson(rawLoans) {
    var jsonLoans = "[";

    for (var j = 1; j < rawLoans.length - 1; j++) {
        var row = "{";
        for (var i = 0; i < rawLoans[0].length; i++) {
            row = row + "\"" + rawLoans[0][i] + "\": \"" + rawLoans[j][i].replace("'", "") + "\","
        }
        row = replaceLastInstanceOfChar(row);
        jsonLoans = jsonLoans + row + "},";
    }

    jsonLoans = replaceLastInstanceOfChar(jsonLoans) + "]";

    return JSON.parse(jsonLoans);
}

function replaceLastInstanceOfChar(jsonString) {
    return jsonString.replace(/,\s*$/, "");
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