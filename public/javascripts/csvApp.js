(function (angular) {
    'use strict';

    angular
        .module('csvApp', ['angularFileUpload'])

        .controller('csvCtrl', ['$scope', 'FileUploader', function ($scope, FileUploader) {
            $scope.uploader = new FileUploader({
                url: '/upload',
                removeAfterUpload: true
            });
        }]);

}(angular));