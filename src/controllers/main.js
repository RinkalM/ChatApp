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
        var settingData = {};
        var ishour12 = false;
        $scope.init = function () {
            settingData = {
                userName: "Guest001",
                color: "light",
                clock: "24",
                messageSound: "false",
                enterEnable: "true",
                language: "en_EN"
            }
            loadSettings();
            //load settings first and initialize the values
            ishour12 = changeTimeFormat();
            changeColour($scope.colortheme);
        };

        var loadSettings = function () {

            $scope.userName = storageService.getSetting("userName");
            if ($scope.userName == undefined || $scope.userName == "null") {
                $scope.userName = settingData.userName;
            }
            $scope.colortheme = storageService.getSetting("color");
            if ($scope.colortheme == undefined || $scope.colortheme == "null") {
                $scope.colortheme = settingData.color;
            }
            $scope.clock = storageService.getSetting("clock");
            if ($scope.clock == undefined || $scope.clock == "null") {
                $scope.clock = settingData.clock;
            }
            $scope.language = storageService.getSetting("language");
            if ($scope.language == undefined || $scope.language == "null") {
                $scope.language = settingData.language;
            }
            $scope.enterEnable = storageService.getSetting("enterEnable");
            if ($scope.enterEnable == undefined || $scope.enterEnable == "null") {
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
            ishour12 = changeTimeFormat();
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
            angular.element('#user').val(settingData.userName);
            $scope.userName = settingData.userName;
            $scope.colortheme = settingData.color;
            $scope.clock = settingData.clock;
            $scope.language = settingData.language;
            $scope.enterEnable = settingData.enterEnable;
            $scope.saveSettings();
        }

        var changeColour = function (cl) {
            if (cl == "light") {
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

        $scope.textChanged = function (event) {
            if ($scope.enterEnable == 'true') {
                if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey) {
                    // Ctrl-Enter pressed
                    $scope.sendMessage();
                }
            }
        }

        var socket = io.connect();
        $scope.showChatTab = true;
        $scope.mess = [];

        $scope.showtab = function (tabID) {
            if (tabID == 'chat' && !$scope.showChatTab) {
                $scope.showChatTab = true;
                removeBlink();
            }
            else if (tabID == 'settings' && $scope.showChatTab) {
                $scope.showChatTab = false;
            }
        }

        $scope.sendMessage = function () {
            var text = angular.element('#chatArea').val();
            if (text == undefined || text == "") {
                return;
            }
            var msg = {
                user: $scope.userName,
                text: text
            };
            angular.element('#chatArea').val('');
            socket.emit('new message', msg);
            displaySelfText(msg);
            $scope.mess.push(msg);
        }

        var removeBlink = function () {
            angular.element('#chatLink').removeClass("blink-tab");
            messageCtr = 0;
        }

        var addBlink = function (number) {
            angular.element('#chatLink').addClass("blink-tab");
            angular.element('#chatLink').attr('data-content', number);
        }

        var displaySelfText = function (msg) {
            var time = new Date();
            var currenttime = time.toLocaleString('en-US', { hour: 'numeric', hour12: ishour12, minute: '2-digit' });
            //float right
            var selfText = angular.element('<li class= \'left clearfix self_chat\'>');
            var nameTime = angular.element('<span class= self_chat_time>').text(currenttime);
            var chatSpan = angular.element('<span class = chat_span>').append(msg.text);
            var chatpara = angular.element('<p>').append(chatSpan);
            var chatDiv = angular.element('<div class= \'chat-body1 clearfix\'>').append(chatpara);
            selfText.append(nameTime);
            selfText.append(chatDiv);
            angular.element('#messages').append(selfText);
            $scope.mess.push(msg);
        }
        var messageCtr = 0;
        socket.on('new message', function (msg) {
            var time = new Date();
            var currenttime = time.toLocaleString('en-US', { hour: 'numeric', hour12: ishour12, minute: '2-digit' });
            //float left
            var partnetText = angular.element('<li class= \'left clearfix partner_chat\'>');
            var nameTime1 = angular.element('<span class= partner_chat_time>').text(msg.user + ', ' + currenttime);
            var chatSpan1 = angular.element('<span class = chat_span>').append(msg.text);
            var chatpara1 = angular.element('<p>').append(chatSpan1);
            var chatDiv1 = angular.element('<div class= \'chat-body1 clearfix\'>').append(chatpara1);
            partnetText.append(nameTime1);
            partnetText.append(chatDiv1);
            angular.element('#messages').append(partnetText);
            if (!$scope.showChatTab) {
                messageCtr++;
                addBlink(messageCtr);
            }
            $scope.mess.push(msg);
            //scroll to bottom
        });
    })
    .directive("scrollBottom", function () {
        return {
            scope: {
                scrollBottom: "="
            },
            link: function (scope, element) {
                scope.$watchCollection('scrollBottom', function (newValue) {
                    if (newValue) {
                        $(element).scrollTop($(element)[0].scrollHeight);
                    }
                });
            }
        }
    })
    .directive("scroll-bottom", function(){
        return {
            link: function(scope, element, attr){
                var $id= $("#" + attr.scroll-bottom);
                $(element).on("click", function(){
                    $id.scrollTop($id[0].scrollHeight);
                });
            }
        }
    });