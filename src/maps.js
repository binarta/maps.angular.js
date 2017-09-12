(function (angular) {
    angular.module('bin.maps', ['binarta-applicationjs-angular1', 'bin.edit', 'config', 'notifications', 'i18n', 'toggle.edit.mode'])
        .service('binMaps', ['$rootScope', '$q', 'binarta', 'i18n', 'configWriter', 'editModeRenderer', BinMapsService])
        .component('binMaps', new BinMaps());

    function BinMapsService($rootScope, $q, binarta, i18n, configWriter, editModeRenderer) {
        var addressCode = 'contact.address';
        var markerLocationCode = 'maps.marker.location';
        var statusCode = 'maps.status';
        var configScope = 'public';
        var working;

        this.observeMapLocation = function (cb) {
            var address, location;

            var i18nObserver = i18n.observe(addressCode, function (a) {
                address = a;
                callback();
            });

            var configObserver = binarta.application.config.observePublic(markerLocationCode, function (l) {
                location = l;
                callback();
            });

            function callback() {
                cb(location || address);
            }

            return {
                disconnect: function () {
                    i18nObserver.disconnect();
                    configObserver.disconnect();
                }
            };
        };

        this.observeMapStatus = function (cb) {
            return binarta.application.config.observePublic(statusCode, function (status) {
                cb(status || 'visible');
            });
        };

        this.showMap = function () {
            if (!working) {
                working = true;
                configWriter({
                    scope: configScope,
                    key: statusCode,
                    value: 'visible'
                }).finally(function () {
                    working = false;
                });
            }
        };

        this.hideMap = function () {
            if (!working) {
                working = true;
                configWriter({
                    scope: configScope,
                    key: statusCode,
                    value: 'hidden'
                }).finally(function () {
                    working = false;
                });
            }
        };

        this.updateLocation = function () {
            var scope = $rootScope.$new();
            scope.fields = {};
            scope.lang = binarta.application.localeForPresentation();

            scope.close = function () {
                editModeRenderer.close();
            };

            scope.submit = function () {
                scope.violations = [];

                if (!scope.fields.address) {
                    scope.violations.push('address.required');
                    return
                }

                scope.working = true;

                var addressPromise = i18n.translate({
                    code: addressCode,
                    translation: scope.fields.address
                });

                var locationPromise = configWriter({
                    scope: configScope,
                    key: markerLocationCode,
                    value: scope.fields.location
                });

                addressPromise.catch(function () {
                    scope.violations.push('address.update.failed');
                });

                locationPromise.catch(function () {
                    scope.violations.push('location.update.failed');
                });

                $q.all([addressPromise, locationPromise]).then(function () {
                    scope.close();
                }).finally(function () {
                    scope.working = false;
                });
            };

            i18n.resolve({code: addressCode}).then(function (address) {
                scope.fields.address = address;
            });

            binarta.application.config.findPublic(markerLocationCode, function (location) {
                scope.fields.location = location;
            });

            editModeRenderer.open({
                templateUrl: 'bin-maps-address-edit.html',
                scope: scope
            });
        };
    }

    function BinMaps() {
        this.templateUrl = 'bin-maps.html';
        this.controller = ['topicRegistry', 'binMaps', binComponentController(function (topics, binMaps) {
            var $ctrl = this;

            $ctrl.$onInit = function () {
                function editModeListener(mode) {
                    $ctrl.editing = mode;
                }
                topics.subscribe('edit.mode', editModeListener);

                var statusObserver = binMaps.observeMapStatus(function (status) {
                    $ctrl.status = status;
                });

                $ctrl.toggle = function () {
                    $ctrl.status === 'visible' ? binMaps.hideMap() : binMaps.showMap();
                };

                $ctrl.updateLocation = binMaps.updateLocation;

                $ctrl.$onDestroy = function () {
                    topics.unsubscribe('edit.mode', editModeListener);
                    statusObserver.disconnect();
                };
            };
        })];
    }
})(angular);