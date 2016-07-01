beforeEach(module('bin.maps.google'));

describe('bin.maps.google', function () {
    var $rootScope, $window, $log, provider, configReader, configReaderDeferred, loader, loaderDeferred;

    beforeEach(inject(function (_$rootScope_, _$window_, _$log_, $q, binMapsProvider, _configReader_, resourceLoader, viewport) {
        $rootScope = _$rootScope_;
        $window = _$window_;
        $log = _$log_;

        configReader = _configReader_;
        configReaderDeferred = $q.defer();
        configReader.and.returnValue(configReaderDeferred.promise);

        loaderDeferred = $q.defer();
        loader = resourceLoader;
        loader.getScript.and.returnValue(loaderDeferred.promise);

        viewport.visibleXs.and.returnValue(true);

        provider = binMapsProvider;
    }));

    describe('with address and element', function () {
        var address, element;

        beforeEach(function () {
            address = 'my address';
            element = 'element';

            provider({address: address, element: element});
        });

        it('Google api key is requested', function () {
            expect(configReader).toHaveBeenCalledWith({
                scope: 'public',
                key: 'maps.google.api.key'
            });
        });

        describe('with api key', function () {
            beforeEach(function () {
                configReaderDeferred.resolve({data: {value: 'key'}});
                $rootScope.$digest();
            });

            it('Google maps script is loaded', function () {
                expect(loader.getScript).toHaveBeenCalledWith('https://maps.googleapis.com/maps/api/js?key=key');
            });

            describe('with google object', function () {
                var google = {
                    maps: {
                        Map: jasmine.createSpy('Map').and.returnValue({setCenter: jasmine.createSpy('setCenter')}),
                        MapTypeId: {
                            ROADMAP: 'roadmap'
                        },
                        Marker: jasmine.createSpy('Marker'),
                        Animation: {
                            DROP: 'animation'
                        },
                        Geocoder: jasmine.createSpy('Geocoder').and.returnValue({geocode: jasmine.createSpy('geocode')}),
                        GeocoderStatus: {
                            OK: 'ok-status'
                        },
                        event: {
                            addDomListener: jasmine.createSpy('addDomListener')
                        }
                    }
                };
                var geocode;

                beforeEach(function () {
                    $window.google = google;

                    loaderDeferred.resolve();
                    $rootScope.$digest();

                    geocode = google.maps.Geocoder().geocode;
                });

                it('location is requested', function () {
                    expect(geocode).toHaveBeenCalled();
                    expect(geocode.calls.mostRecent().args[0]).toEqual({address: address});
                });

                describe('when location is found', function () {
                    beforeEach(function () {
                        geocode.calls.mostRecent().args[1]([{geometry: {location: 'location'}}], 'ok-status');
                        $rootScope.$digest();
                    });

                    it('map is initialized', function () {
                        expect(google.maps.Map.calls.mostRecent().args[0]).toEqual(element);
                        expect(google.maps.Map.calls.mostRecent().args[1]).toEqual({
                            zoom: 15,
                            draggable: false,
                            panControl: true,
                            mapTypeControlOptions: {
                                mapTypeIds: []
                            },
                            mapTypeId: 'roadmap',
                            scrollwheel: false
                        });
                    });

                    it('set marker', function () {
                        expect(google.maps.Marker).toHaveBeenCalledWith({
                            map: google.maps.Map(),
                            draggable: false,
                            animation: 'animation',
                            position: 'location'
                        });
                    });

                    it('map is centered', function () {
                        expect(google.maps.Map().setCenter).toHaveBeenCalledWith('location');
                    });

                    it('listen for window resizes', function () {
                        expect(google.maps.event.addDomListener).toHaveBeenCalled();
                        expect(google.maps.event.addDomListener.calls.mostRecent().args[0]).toEqual($window);
                        expect(google.maps.event.addDomListener.calls.mostRecent().args[1]).toEqual('resize');
                    });

                    it('center map on window resize', function () {
                        google.maps.Map().setCenter.calls.reset();

                        google.maps.event.addDomListener.calls.mostRecent().args[2]();

                        expect(google.maps.Map().setCenter).toHaveBeenCalledWith('location');
                    });
                });

                describe('when location is not found', function () {
                    beforeEach(function () {
                        geocode.calls.mostRecent().args[1]([{geometry: {location: 'location'}}], '');
                        $rootScope.$digest();
                    });

                    it('log warning', function () {
                        expect($log.warn.logs[0]).toEqual(['Could not resolve maps location.']);
                    });
                });
            });
        });
    });
});