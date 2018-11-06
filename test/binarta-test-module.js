(function () {
    angular.module('binarta-alljs-tpls-angular1', []);
    angular.module('binarta-applicationjs-gateways-angular1', ['binarta-applicationjs-inmem-angular1'])
        .provider('binartaApplicationGateway', ['inmemBinartaApplicationGatewayProvider', proxy]);

    function proxy(gateway) {
        return gateway;
    }
})();
