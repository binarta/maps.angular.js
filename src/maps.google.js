(function (angular) {
    angular.module('bin.maps.google', ['angularx', 'viewport', 'application'])
        .factory('binMapsProvider', ['$q', '$window', '$log', 'resourceLoader', 'viewport', 'applicationDataService', BinMapsProvider]);

    function BinMapsProvider($q, $window, $log, resourceLoader, viewport, applicationData) {
        var address, previousAddress, element, locationDeferred;

        return function (args) {
            address = args.address;
            element = args.element;
            
            applicationData.then(function (data) {
                if (data.googleMaps) initGoogle(data.googleMaps.apiKey);
            });
        };
        
        function initGoogle(key) {
            resourceLoader.getScript('https://maps.googleapis.com/maps/api/js?key=' + key).then(function () {
                loadGoogleMap($window.google);
            });
        }

        function loadGoogleMap(google) {
            getLocation().then(function (location) {
                var map = new google.maps.Map(element, {
                    zoom: 15,
                    draggable: !viewport.visibleXs(),
                    panControl: viewport.visibleXs(),
                    mapTypeControlOptions: {
                        mapTypeIds: []
                    },
                    mapTypeId: google.maps.MapTypeId.ROADMAP,
                    scrollwheel: false
                });

                setMarker(map, location);

                google.maps.event.addDomListener($window, 'resize', function () {
                    map.setCenter(location);
                });
            }, function () {
                $log.warn('Could not resolve maps location.');
            });

            function getLocation() {
                checkIfAddressHasChanged();
                if (!locationDeferred) {
                    locationDeferred = $q.defer();

                    var geocoder = new google.maps.Geocoder();

                    geocoder.geocode({address: address}, function(results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            locationDeferred.resolve(results[0].geometry.location);
                        } else {
                            locationDeferred.reject();
                        }
                    });
                }

                return locationDeferred.promise;
            }

            function checkIfAddressHasChanged() {
                if (address != previousAddress) {
                    locationDeferred = undefined;
                    previousAddress = address;
                }
            }

            function setMarker(map, location) {
                new google.maps.Marker({
                    map: map,
                    draggable: false,
                    animation: google.maps.Animation.DROP,
                    position: location
                });
                map.setCenter(location);
            }
        }
    }
})(angular);