angular.module('bin.edit', []);
beforeEach(module('bin.maps'));

describe('bin.maps', function () {
    var $rootScope, configWriter, configWriterDeferred, topics, binarta, i18n;

    beforeEach(inject(function($q, _$rootScope_, _configReader_, _configWriter_, topicRegistry, _binarta_, _i18n_) {
        $rootScope = _$rootScope_;
        topics = topicRegistry;
        binarta = _binarta_;
        i18n = _i18n_;

        configWriter = _configWriter_;
        configWriterDeferred = $q.defer();
        configWriter.and.returnValue(configWriterDeferred.promise);
    }));

    function triggerBinartaSchedule() {
        binarta.application.adhesiveReading.read('-');
    }

    describe('binMaps service', function () {
        var sut, editModeRenderer;

        beforeEach(inject(function (binMaps, _editModeRenderer_) {
            sut = binMaps;
            editModeRenderer = _editModeRenderer_;
        }));

        describe('on observeMapLocation', function () {
            var spy, returnValue;

            beforeEach(function () {
                spy = jasmine.createSpy('spy');
                returnValue = sut.observeMapLocation(spy);
            });

            it('contact.address i18n value is observed', function () {
                expect(i18n.observe).toHaveBeenCalledWith('contact.address', jasmine.any(Function));
            });

            it('assert map location', function () {
                i18n.observe.calls.mostRecent().args[1]('address');
                expect(spy).toHaveBeenCalledWith('address');
            });

            it('returns disconnect function', function () {
                expect(returnValue).toEqual({disconnect: jasmine.any(Function)});
            });

            describe('when marker location is stored in config', function () {
                beforeEach(function () {
                    binarta.application.config.cache('maps.marker.location', 'location');
                    triggerBinartaSchedule();
                    returnValue = sut.observeMapLocation(spy);
                });

                it('assert map location', function () {
                    expect(spy).toHaveBeenCalledWith('location');
                });
            });
        });

        describe('on edit address', function () {
            var i18nResolveDeferred, i18nTranslateDeferred;

            beforeEach(inject(function ($q) {
                i18nResolveDeferred = $q.defer();
                i18n.resolve.and.returnValue(i18nResolveDeferred.promise);
                i18nTranslateDeferred = $q.defer();
                i18n.translate.and.returnValue(i18nTranslateDeferred.promise);

                binarta.application.config.cache('maps.marker.location', 'l');
                triggerBinartaSchedule();

                binarta.application.setLocaleForPresentation('L');
                binarta.application.refreshEvents();

                sut.updateLocation();
            }));

            describe('with editMode renderer scope', function () {
                var scope;

                beforeEach(function () {
                    scope = editModeRenderer.open.calls.mostRecent().args[0].scope;
                });

                it('with address', function () {
                    i18nResolveDeferred.resolve('a');
                    $rootScope.$digest();
                    expect(scope.fields.address).toEqual('a');
                });

                it('with location', function () {
                    expect(scope.fields.location).toEqual('l');
                });

                it('the current language is available on the scope', function () {
                    expect(scope.lang).toEqual('L');
                });

                describe('on submit with empty address', function () {
                    beforeEach(function () {
                        scope.fields.address = '';
                        scope.submit();
                    });

                    it('violation is on scope', function () {
                        expect(scope.violations).toEqual(['address.required']);
                    });

                    it('renderer is not closed', function () {
                        expect(editModeRenderer.close).not.toHaveBeenCalled();
                    });

                    it('is not working', function () {
                        expect(scope.working).toBeFalsy();
                    });
                });

                describe('on submit with valid values', function () {
                    beforeEach(function () {
                        scope.fields.address = 'address';
                        scope.fields.location = 'location';
                        scope.submit();
                    });

                    it('is working', function () {
                        expect(scope.working).toBeTruthy();
                    });

                    it('address update', function () {
                        expect(i18n.translate).toHaveBeenCalledWith({
                            code: 'contact.address',
                            translation: 'address'
                        });
                    });

                    it('location update', function () {
                        expect(configWriter).toHaveBeenCalledWith({
                            scope: 'public',
                            key: 'maps.marker.location',
                            value: 'location'
                        });
                    });

                    describe('on address update failed', function () {
                        beforeEach(function () {
                            i18nTranslateDeferred.reject();
                            $rootScope.$digest();
                        });

                        it('violation is on scope', function () {
                            expect(scope.violations).toEqual(['address.update.failed']);
                        });

                        it('renderer is not closed', function () {
                            expect(editModeRenderer.close).not.toHaveBeenCalled();
                        });

                        it('is not working', function () {
                            expect(scope.working).toBeFalsy();
                        });
                    });

                    describe('on location update failed', function () {
                        beforeEach(function () {
                            configWriterDeferred.reject();
                            $rootScope.$digest();
                        });

                        it('violation is on scope', function () {
                            expect(scope.violations).toEqual(['location.update.failed']);
                        });

                        it('renderer is not closed', function () {
                            expect(editModeRenderer.close).not.toHaveBeenCalled();
                        });

                        it('is not working', function () {
                            expect(scope.working).toBeFalsy();
                        });
                    });

                    describe('on updates success', function () {
                        beforeEach(function () {
                            i18nTranslateDeferred.resolve();
                            configWriterDeferred.resolve();
                            $rootScope.$digest();
                        });

                        it('renderer is closed', function () {
                            expect(editModeRenderer.close).toHaveBeenCalled();
                        });
                    });
                });

                it('on close', function () {
                    scope.close();
                    expect(editModeRenderer.close).toHaveBeenCalled();
                });
            });
        });
    });

    describe('binMaps component', function () {
        var $ctrl;
        var statusKey = 'maps.status';

        beforeEach(inject(function($componentController) {
            $ctrl = $componentController('binMaps');
            $ctrl.$onInit();
        }));

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
                $ctrl.status = 'visible';
                $ctrl.toggle();
            });

            it('persist config value', function () {
                expect(configWriter).toHaveBeenCalledWith({
                    scope: 'public',
                    key: statusKey,
                    value: 'hidden'
                });
            });
        });

        describe('show the map', function () {
            beforeEach(function () {
                $ctrl.status = 'hidden';
                $ctrl.toggle();
            });

            it('persist config value', function () {
                expect(configWriter).toHaveBeenCalledWith({
                    scope: 'public',
                    key: statusKey,
                    value: 'visible'
                });
            });
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