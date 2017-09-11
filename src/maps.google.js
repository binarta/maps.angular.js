angular.module('bin.maps.google', ['bin.maps']).component('binMapsProvider', {
    template: '<iframe ng-src="{{$ctrl.location}}"></iframe>',
    controller: ['$sce', 'binMaps', function ($sce, maps) {
        var $ctrl = this;

        $ctrl.$onInit = function () {
            var observer = maps.observeMapLocation(function (location) {
                location = encodeURIComponent(location);
                $ctrl.location = $sce.trustAsResourceUrl('https://binarta.com/maps/google/index.html?q=' + location);
            });

            $ctrl.$onDestroy = function () {
                observer.disconnect();
            };
        };
    }]
});