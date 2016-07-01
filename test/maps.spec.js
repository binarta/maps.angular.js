angular.module('bin.edit', []);
beforeEach(module('bin.maps'));

describe('bin.maps', function () {
    var $rootScope, configReader, configReaderDeferred, configWriter, configWriterDeferred, topics;

    beforeEach(inject(function($q, _$rootScope_, _configReader_, _configWriter_, topicRegistry) {
        $rootScope = _$rootScope_;
        topics = topicRegistry;

        configReader = _configReader_;
        configReaderDeferred = $q.defer();
        configReader.and.returnValue(configReaderDeferred.promise);

        configWriter = _configWriter_;
        configWriterDeferred = $q.defer();
        configWriter.and.returnValue(configWriterDeferred.promise);
    }));

    describe('binMaps component', function () {
        var component;
        var statusKey = 'maps.status';

        beforeEach(inject(function($componentController) {
            component = $componentController('binMaps', null, {addressI18nCode: 'contact.address'});
        }));

        it('address i18n code is available', function () {
            expect(component.addressI18nCode).toEqual('contact.address');
        });

        it('maps status is requested', function () {
            expect(configReader).toHaveBeenCalledWith({
                scope: 'public',
                key: statusKey
            });
        });

        it('default maps status is visible', function () {
            configReaderDeferred.reject();
            $rootScope.$digest();

            expect(component.status).toEqual('visible');
        });

        it('when maps is hidden', function () {
            configReaderDeferred.resolve({data: {value: 'hidden'}});
            $rootScope.$digest();

            expect(component.status).toEqual('hidden');
        });

        it('when maps is visible', function () {
            configReaderDeferred.resolve({data: {value: 'visible'}});
            $rootScope.$digest();

            expect(component.status).toEqual('visible');
        });

        it('is not working', function () {
            expect(component.working).toBeFalsy();
        });

        describe('hide the map', function () {
            beforeEach(function () {
                configReaderDeferred.resolve({data: {value: 'visible'}});
                $rootScope.$digest();
                component.toggle();
            });

            it('is working', function () {
                expect(component.working).toBeTruthy();
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

                expect(component.status).toEqual('hidden');
                expect(component.working).toBeFalsy();
            });

            it('on failed', function () {
                configWriterDeferred.reject();
                $rootScope.$digest();

                expect(component.status).toEqual('visible');
                expect(component.working).toBeFalsy();
            });
        });

        describe('show the map', function () {
            beforeEach(function () {
                configReaderDeferred.resolve({data: {value: 'hidden'}});
                $rootScope.$digest();
                component.toggle();
            });

            it('is working', function () {
                expect(component.working).toBeTruthy();
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

                expect(component.status).toEqual('visible');
                expect(component.working).toBeFalsy();
            });

            it('on failed', function () {
                configWriterDeferred.reject();
                $rootScope.$digest();

                expect(component.status).toEqual('hidden');
                expect(component.working).toBeFalsy();
            });
        });

        it('when working, toggle does nothing', function () {
            component.working = true;

            component.toggle();

            expect(configWriter).not.toHaveBeenCalled();
        });

        it('listens for edit mode', function () {
            expect(topics.subscribe.calls.mostRecent().args[0]).toEqual('edit.mode');
        });

        it('when editing', function () {
            topics.subscribe.calls.mostRecent().args[1](true);

            expect(component.editing).toBeTruthy();

            topics.subscribe.calls.mostRecent().args[1](false);

            expect(component.editing).toBeFalsy();
        });

        it('on destroy', function () {
            var listener = topics.subscribe.calls.mostRecent().args[1];

            component.$onDestroy();

            expect(topics.unsubscribe.calls.mostRecent().args[0]).toEqual('edit.mode');
            expect(topics.unsubscribe.calls.mostRecent().args[1]).toEqual(listener);
        });
    });
});