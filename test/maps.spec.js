angular.module('bin.edit', []);
beforeEach(module('bin.maps'));

describe('bin.maps', function () {
    var $rootScope, configWriter, configWriterDeferred, topics, binarta;

    beforeEach(inject(function($q, _$rootScope_, _configReader_, _configWriter_, topicRegistry, _binarta_) {
        $rootScope = _$rootScope_;
        topics = topicRegistry;
        binarta = _binarta_;

        configWriter = _configWriter_;
        configWriterDeferred = $q.defer();
        configWriter.and.returnValue(configWriterDeferred.promise);
    }));

    function triggerBinartaSchedule() {
        binarta.application.adhesiveReading.read('-');
    }

    describe('binMaps component', function () {
        var $ctrl;
        var statusKey = 'maps.status';

        beforeEach(inject(function($componentController) {
            $ctrl = $componentController('binMaps');
            $ctrl.$onInit();
        }));

        it('address i18n code is available', function () {
            expect($ctrl.addressI18nCode).toEqual('contact.address');
        });

        it('default maps status is visible', function () {
            triggerBinartaSchedule();
            expect($ctrl.status).toEqual('visible');
        });

        it('when maps is hidden', function () {
            binarta.application.config.cache('maps.status', 'hidden');
            triggerBinartaSchedule();
            expect($ctrl.status).toEqual('hidden');
        });

        it('when maps is visible', function () {
            binarta.application.config.cache('maps.status', 'visible');
            triggerBinartaSchedule();
            expect($ctrl.status).toEqual('visible');
        });

        it('is not working', function () {
            expect($ctrl.working).toBeFalsy();
        });

        describe('hide the map', function () {
            beforeEach(function () {
                binarta.application.config.cache('maps.status', 'visible');
                triggerBinartaSchedule();
                $ctrl.toggle();
            });

            it('is working', function () {
                expect($ctrl.working).toBeTruthy();
            });

            it('persist config value', function () {
                expect(configWriter).toHaveBeenCalledWith({
                    scope: 'public',
                    key: statusKey,
                    value: 'hidden'
                });
            });

            it('on success', function () {
                configWriterDeferred.resolve();
                $rootScope.$digest();

                expect($ctrl.status).toEqual('hidden');
                expect($ctrl.working).toBeFalsy();
            });

            it('on failed', function () {
                configWriterDeferred.reject();
                $rootScope.$digest();

                expect($ctrl.status).toEqual('visible');
                expect($ctrl.working).toBeFalsy();
            });
        });

        describe('show the map', function () {
            beforeEach(function () {
                binarta.application.config.cache('maps.status', 'hidden');
                triggerBinartaSchedule();
                $ctrl.toggle();
            });

            it('is working', function () {
                expect($ctrl.working).toBeTruthy();
            });

            it('persist config value', function () {
                expect(configWriter).toHaveBeenCalledWith({
                    scope: 'public',
                    key: statusKey,
                    value: 'visible'
                });
            });

            it('on success', function () {
                configWriterDeferred.resolve();
                $rootScope.$digest();

                expect($ctrl.status).toEqual('visible');
                expect($ctrl.working).toBeFalsy();
            });

            it('on failed', function () {
                configWriterDeferred.reject();
                $rootScope.$digest();

                expect($ctrl.status).toEqual('hidden');
                expect($ctrl.working).toBeFalsy();
            });
        });

        it('when working, toggle does nothing', function () {
            $ctrl.working = true;
            $ctrl.toggle();
            expect(configWriter).not.toHaveBeenCalled();
        });

        it('listens for edit mode', function () {
            expect(topics.subscribe.calls.mostRecent().args[0]).toEqual('edit.mode');
        });

        it('when editing', function () {
            topics.subscribe.calls.mostRecent().args[1](true);
            expect($ctrl.editing).toBeTruthy();
            topics.subscribe.calls.mostRecent().args[1](false);
            expect($ctrl.editing).toBeFalsy();
        });

        it('on destroy', function () {
            var listener = topics.subscribe.calls.mostRecent().args[1];
            $ctrl.$onDestroy();
            expect(topics.unsubscribe.calls.mostRecent().args[0]).toEqual('edit.mode');
            expect(topics.unsubscribe.calls.mostRecent().args[1]).toEqual(listener);
        });
    });
});