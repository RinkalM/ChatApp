/// <refernce path="//ajax.googleapis.com/ajax/libs/angularjs/1.0.8/angular.min.js"/>

var chatApp = angular
    .module("chatModule", ["ui.router",])
    .config(function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("main");
        $stateProvider
            .state("main", {
                url: "/main",
                templateUrl: "/main.html",
                controller: "mainController",
                controllerAs: "mainCtrl",
            })
    })
    .controller("mainController", function ($scope, storageService) {
        $scope.init = function () {
            var settingData = {
                userName: "Guest001",
                color: "light",
                clock: "24",
                messageSound: "false",
                enterEnable: "false",
                language: "en_EN"
            }
            loadSettings();
            //load settings first and initialize the values
            $scope.ishour12 = false;
            $scope.ishour12 = changeTimeFormat();
            changeColour($scope.colortheme);
        };

        var loadSettings = function () {

            $scope.userName = storageService.getSetting("userName");
            if ($scope.userName === 'undefined' || $scope.userName == "null") {
                $scope.userName = settingData.userName;
            }
            $scope.colortheme = storageService.getSetting("color");
            if ($scope.colortheme === 'undefined' || $scope.colortheme == "null") {
                $scope.colortheme = settingData.color;
            }
            $scope.clock = storageService.getSetting("clock");
            if ($scope.clock === 'undefined' || $scope.clock == "null") {
                $scope.clock = settingData.clock;
            }
            $scope.language = storageService.getSetting("language");
            if ($scope.language === 'undefined' || $scope.language == "null") {
                $scope.language = settingData.language;
            }
            $scope.enterEnable = storageService.getSetting("enterEnable");
            if ($scope.enterEnable === 'undefined' || $scope.enterEnable == "null") {
                $scope.enterEnable = settingData.enterEnable;
            }
        }

        $scope.saveSettings = function () {
            $scope.userName = angular.element('#user').val();
            storageService.saveSetting('userName', $scope.userName);
            storageService.saveSetting('color', $scope.colortheme);
            storageService.saveSetting('clock', $scope.clock);
            storageService.saveSetting('language', $scope.language);
            storageService.saveSetting('enterEnable', $scope.enterEnable);
        }

        $scope.clockChanged = function (value) {
            $scope.clock = value;
            $scope.ishour12 = changeTimeFormat();
        }
        $scope.colorChanged = function (cl) {
            //change background image
            ishour12 = changeColour(cl);
            $scope.colortheme = cl;
        }
        $scope.enterChanged = function (enter) {
            $scope.enterEnable = enter;
        }

        $scope.resetDefault = function () {
            storageService.saveSetting('userName', settingData.userName);
            storageService.saveSetting('color', settingData.color);
            storageService.saveSetting('clock', settingData.clock);
            storageService.saveSetting('language', settingData.language);
            storageService.saveSetting('enterEnable', settingData.enterEnable);
        }

        var changeColour = function (cl) {
            if (cl === "light") {
                angular.element('#chatBack').css("background-image", "url(/lightBackground.jpg)");
            }
            else {
                angular.element('#chatBack').css("background-image", "url(/darkBackground.jpg)");
            }
        }

        var changeTimeFormat = function () {
            var hour = parseInt($scope.clock);
            var ishour12_ = false;
            if (hour == 12) {
                ishour12_ = true;
            }
            return ishour12_;
        }
        var socket = io.connect();
        $scope.showChatTab = true;

        var showtab = function (tabID) {
            if (tabID === 'chat' && !$scope.showChatTab) {
                $scope.showChatTab = true;
            }
            else if (tabID === 'settings' && $scope.showChatTab) {
                $scope.showChatTab = false;
            }
        }
        $scope.showtab = showtab;

        $scope.sendMessage = function (text) {
            var msg = {
                user: $scope.userName,
                text: text
            };
            $scope.textval = '$scope.clock';
            socket.emit('new message', msg);
        }

        socket.on('new message', function (msg) {
            if (msg == '') {
                return;
            }
            var time = new Date();
            var currenttime = time.toLocaleString('en-US', { hour: 'numeric', hour12: $scope.ishour12, minute: '2-digit' });
            if (msg.user === $scope.userName) {
                //float right
                var selfText = angular.element('<li class= \'left clearfix self_chat\'>');
                var nameTime = angular.element('<span class= self_chat_time>').text(currenttime);
                var chatSpan = angular.element('<span class = chat_span>').append(msg.text);
                var chatpara = angular.element('<p>').append(chatSpan);
                var chatDiv = angular.element('<div class= \'chat-body1 clearfix\'>').append(chatpara);
                selfText.append(nameTime);
                selfText.append(chatDiv);

                angular.element('#messages').append(selfText);
            }
            else {
                //float left
                var partnetText = angular.element('<li class= \'left clearfix partner_chat\'>');
                var nameTime1 = angular.element('<span class= partner_chat_time>').text(msg.user + ', ' + currenttime);
                var chatSpan1 = angular.element('<span class = chat_span>').append(msg.text);
                var chatpara1 = angular.element('<p>').append(chatSpan1);
                var chatDiv1 = angular.element('<div class= \'chat-body1 clearfix\'>').append(chatpara1);
                partnetText.append(nameTime1);
                partnetText.append(chatDiv1);
                angular.element('#messages').append(partnetText);

            }
            //scroll to bottom
        });

    })
