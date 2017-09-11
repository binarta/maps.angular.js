angular.module('i18n', []).service('i18n', function () {
    this.observe = jasmine.createSpy('observe').and.returnValue({disconnect: function (){}});
});