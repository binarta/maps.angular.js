(function (angular) {
    angular.module('bin.maps', ['binarta-applicationjs-angular1', 'bin.edit', 'config', 'notifications', 'i18n'])
        .service('binMaps', ['i18n', BinMapsService])
        .component('binMaps', new BinMaps());

    function BinMapsService(i18n) {
        this.observeMapLocation = function (cb) {
            return i18n.observe('contact.address', function (t) {
                cb(t);
            });
        };
    }

    function BinMaps() {
        this.templateUrl = 'bin-maps.html';
        this.controller = ['configWriter', 'topicRegistry', binComponentController(function (configWriter, topics) {
            var $ctrl = this, scope = 'public', statusKey = 'maps.status';
            var statusVisible = 'visible';
            var statusHidden = 'hidden';
            var statusDefault = statusVisible;

            $ctrl.$onInit = function () {
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
                        var newStatus = $ctrl.status === statusVisible ? statusHidden : statusVisible;

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
            };
        })];
    }
})(angular);