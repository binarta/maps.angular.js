(function (angular) {
    angular.module('bin.maps', ['bin.edit', 'config', 'notifications'])
        .controller('binMapsController', ['configReader', 'configWriter', 'topicRegistry', BinMapsController])
        .directive('binMapsMap', ['binMapsProvider', BinMapsMap])
        .component('binMaps', {
            bindings: {
                addressI18nCode: '@'
            },
            controller: 'binMapsController',
            template: ['$templateCache', function (cache) {
                return cache.get('bin-maps.html');
            }]
        });

    function BinMapsController(configReader, configWriter, topics) {
        var ctrl = this, scope = 'public', statusKey = 'maps.status';
        var statusVisible = 'visible';
        var statusHidden = 'hidden';
        var statusDefault = statusVisible;

        function editModeListener(mode) {
            ctrl.editing = mode;
        }
        topics.subscribe('edit.mode', editModeListener);

        configReader({
            scope: scope,
            key: statusKey
        }).then(function (result) {
            ctrl.status = result.data.value || statusDefault;
        }, function () {
            ctrl.status = statusDefault;
        });

        ctrl.toggle = function () {
            if (!ctrl.working) {
                ctrl.working = true;
                var newStatus = ctrl.status == statusVisible ? statusHidden : statusVisible;
                
                configWriter({
                    scope: scope,
                    key: statusKey,
                    value: newStatus
                }).then(function () {
                    ctrl.status = newStatus;
                }).finally(function () {
                    ctrl.working = false;
                });
            }
        };
        
        ctrl.$onDestroy = function () {
            topics.unsubscribe('edit.mode', editModeListener);
        }
    }

    function BinMapsMap(provider) {
        return {
            restrict: 'E',
            scope: {
                address: '<'
            },
            link: function (scope, el) {
                scope.$onChanges = function () {
                    if (scope.address) provider({address: scope.address, element: el[0]});
                };
            }
        }
    }
})(angular);