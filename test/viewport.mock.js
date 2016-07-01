angular.module('viewport', [])
    .factory('viewport', function () {
        return jasmine.createSpyObj('viewport', ['visibleXs']);
    });