module.exports = function(config) {
    config.set({
        basePath:'.',
        frameworks:['jasmine'],
        files:[
            {pattern:'bower_components/moment/moment.js'},
            {pattern:'bower_components/angular/angular.js'},
            {pattern:'bower_components/angular-route/angular-route.js'},
            {pattern:'bower_components/angular-mocks/angular-mocks.js'},
            {pattern:'bower_components/binartajs/src/binarta.js'},
            {pattern:'bower_components/binartajs/src/application.js'},
            {pattern:'bower_components/binartajs/src/gateways.inmem.js'},
            {pattern:'bower_components/binartajs-angular1/src/binarta-angular.js'},
            {pattern:'bower_components/binartajs-angular1/src/binarta-application-angular.js'},
            {pattern:'bower_components/binartajs-angular1/src/binarta-application-inmem-angular.js'},
            {pattern:'bower_components/binarta.web.storage.angular/src/web.storage.js'},
            {pattern:'bower_components/binarta.web.storage/src/web.storage.js'},
            {pattern:'src/maps.js'},
            {pattern:'src/maps.google.js'},
            {pattern:'test/**/*.*'}
        ],
        browsers:['PhantomJS']
    });
};