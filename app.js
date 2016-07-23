var app = angular.module('chatApp', []);
app.controller('chatAppController', function($scope) {
    var daClient;
    var server = {
        address: '',
        port: '',
        channel: '',
        connected: false,
        error: ''
    };
    $scope.vm = {};
    $scope.vm.server = server;
    $scope.vm.messageToSend = '';
    $scope.vm.messages = [];
    $scope.vm.localUUID = Math.uuid(8, 16);

    $scope.action = {};
    $scope.action.connectToMQTT = function() {
        var server = $scope.vm.server;
        daClient = new Paho.MQTT.Client(
            server.address,
            parseInt(server.port),
            $scope.vm.localUUID
        );
        daClient.onConnectionLost = function(response) {
            $scope.vm.server.connected = false;
            alert('Connection lost! Please reconnect!\n' + response.errorMessage);
        };
        daClient.onMessageArrived = function(message) {
            var daMessage = JSON.parse(message.payloadString);
            $scope.vm.messages.splice(0, 0, daMessage);
            // $scope.vm.messages.push(daMessage);
            $scope.$apply();
        };
        daClient.connect({
            onSuccess: function() {
                $scope.vm.server.connected = true;
                $scope.$apply();
                daClient.subscribe($scope.vm.server.channel);
            }
        });
    };
    $scope.action.sendMessage = function() {
        var payload = {
            f: $scope.vm.localUUID,
            m: $scope.vm.messageToSend
        };
        var message = new Paho.MQTT.Message(JSON.stringify(payload));
        message.destinationName = $scope.vm.server.channel;
        daClient.send(message);
        $scope.vm.messageToSend = '';
        $scope.$apply();
    };
});
