(function (angular) {
    angular.module('bin.maps', ['binarta-applicationjs-angular1', 'bin.edit', 'config', 'notifications'])
        .directive('binMapsMap', ['binMapsProvider', BinMapsMap])
        .component('binMaps', new BinMaps());

    function BinMaps() {
        this.templateUrl = 'bin-maps.html';
        this.bindings = {
            addressI18nCode: '@'
        };
        this.controller = ['configWriter', 'topicRegistry', binComponentController(function (configWriter, topics) {
            var $ctrl = this, scope = 'public', statusKey = 'maps.status';
            var statusVisible = 'visible';
            var statusHidden = 'hidden';
            var statusDefault = statusVisible;

            function editModeListener(mode) {
                $ctrl.editing = mode;
            }
            topics.subscribe('edit.mode', editModeListener);

            $ctrl.config.public.find(statusKey, function (value) {
                $ctrl.status = value || statusDefault;
            });

            $ctrl.toggle = function () {
                if (!$ctrl.working) {
                    $ctrl.working = true;
                    var newStatus = $ctrl.status == statusVisible ? statusHidden : statusVisible;

                    configWriter({
                        scope: scope,
                        key: statusKey,
                        value: newStatus
                    }).then(function () {
                        $ctrl.status = newStatus;
                    }).finally(function () {
                        $ctrl.working = false;
                    });
                }
            };

            $ctrl.$onDestroy = function () {
                topics.unsubscribe('edit.mode', editModeListener);
            };
        })];
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