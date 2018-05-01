/// <refernce path="//ajax.googleapis.com/ajax/libs/angularjs/1.0.8/angular.min.js"/>
//main controller class for socket io chat app
var chatApp = angular
    .module("chatModule", ["ui.router", "pascalprecht.translate"])
    .config(function ($stateProvider, $urlRouterProvider, $translateProvider) {
        $urlRouterProvider.otherwise("main");
        $stateProvider
            .state("main", {
                url: "/main",
                templateUrl: "/main.html",
                controller: "mainController",
                controllerAs: "mainCtrl",
            })
            $translateProvider
            .useUrlLoader('/api/lang')
            .preferredLanguage('en')
            .fallbackLanguage('en');
            
    })
    .controller("mainController", function ($scope, $rootScope, $translate, storageService,$sce) {
        var settingData = {};
        var ishour12 = false;
        $scope.init = function () {
            settingData = {
                userName: "Guest001",
                color: "light",
                clock: "24",
                messageSound: "false",
                enterEnable: "true",
                language: "en"
            }
            loadSettings();
            //load settings first and initialize the values before page loads
            ishour12 = changeTimeFormat();
            changeColour($scope.colortheme);
            var localLanguage = storageService.getSetting("language");
            if (localLanguage == undefined || $scope.language == "null") {
                localLanguage = 'en';
            }
            $translate.use(localLanguage);
        };
        //chnages the locale of the application
        $scope.changeLanguage = function (langKey) {
            $translate.use(langKey);
        };
        //when the lcanguage is changed it changes $rootscope's language
        $rootScope.$on('$translateChangeSuccess', function (event, data) {
            $scope.language = data.language;
            $rootScope.lang = $scope.language;
        });
        //loads settings from local storage, if not available takes value from defaults settings 
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

        //saves user settings to local storage 
        $scope.saveSettings = function (showAlert) {

            $scope.userName = angular.element('#user').val();
            storageService.saveSetting('userName', $scope.userName);
            storageService.saveSetting('color', $scope.colortheme);
            storageService.saveSetting('clock', $scope.clock);
            storageService.saveSetting('language', $scope.language);
            storageService.saveSetting('enterEnable', $scope.enterEnable);
            if (showAlert) {
                angular.element('#succ_alert').css("display", "block");
                setTimeout("angular.element('#succ_alert').hide();", 3000);
            }
        }
        //Executes when clock format is changed from settings page
        $scope.clockChanged = function (value) {
            $scope.clock = value;
            ishour12 = changeTimeFormat();
        }
        //Executes when color theme is changed from settings page
        $scope.colorChanged = function (cl) {
            //change background image
            ishour12 = changeColour(cl);
            $scope.colortheme = cl;
        }
        //Executes when 'send messge on ctrl+enter' is changed from settings page
        $scope.enterChanged = function (enter) {
            $scope.enterEnable = enter;
        }
        //Executes when settings are reset to defaults
        $scope.resetDefault = function () {
            angular.element('#user').val(settingData.userName);
            $scope.userName = settingData.userName;
            $scope.colortheme = settingData.color;
            $scope.clock = settingData.clock;
            $scope.language = settingData.language;
            $scope.enterEnable = settingData.enterEnable;

            $scope.clockChanged(settingData.clock);
            $scope.colorChanged(settingData.color);
            $scope.changeLanguage(settingData.language);
            $scope.enterChanged(settingData.enterEnable);
            $scope.saveSettings(false);
        }
        //chnages the background color of the application
        var changeColour = function (cl) {
            if (cl == "light") {
                angular.element('#chatBack').css("background-image", "url(/lightBackground.jpg)");
            }
            else {
                angular.element('#chatBack').css("background-image", "url(/darkBackground.jpg)");
            }
        }
        //changes local variable to store time format setting
        var changeTimeFormat = function () {
            var hour = parseInt($scope.clock);
            var ishour12_ = false;
            if (hour == 12) {
                ishour12_ = true;
            }
            return ishour12_;
        }
        //sends message when ctrl+enter is pressed
        $scope.textChanged = function (event) {
            if ($scope.enterEnable) {
                if ((event.keyCode == 10 || event.keyCode == 13) && event.ctrlKey) {
                    // Ctrl-Enter pressed
                    $scope.sendMessage();
                }
            }
        }

        var socket = io.connect();
        $scope.showChatTab = true;
        $scope.mess = [];
        //switches between tabs
        $scope.showtab = function (tabID) {
            if (tabID == 'chat' && !$scope.showChatTab) {
                $scope.showChatTab = true;
                removeBlink();
            }
            else if (tabID == 'settings' && $scope.showChatTab) {
                $scope.showChatTab = false;
            }
        }
        //sends message to socket.io, doesn't send empty message
        $scope.sendMessage = function () {
            var text = angular.element('#chatArea').val();
            if (text == undefined || text == "") {
                return;
            }
            var senderTime = new Date();
            var msg = {
                user: $scope.userName,
                text: text,
                curDate : senderTime
            };
            angular.element('#chatArea').val('');
            socket.emit('message', msg);
            displaySelfText(msg);
            $scope.mess.push(msg);
        }
        //removes blinking when chat tab is clicked and messages are read.
        var removeBlink = function () {
            angular.element('#chatLink').removeClass("blink-tab");
            messageCtr = 0;
        }
        //adds blinking to chat tab when there is any unread message for the user
        var addBlink = function (number) {
            angular.element('#chatLink').addClass("blink-tab");
            angular.element('#chatLink').attr('data-content', number);
        }

        //displays text on the left side of screen of user who is sending the message.
        var displaySelfText = function (msg) {
           
            var currenttime = convertDate(new Date);
            var str = convertLinks(msg.text);
            //float right
            var selfText = angular.element('<li class= \'left clearfix self_chat\'>');
            var nameTime = angular.element('<span class= \'self_chat_time\'>').text(currenttime);
            var chatSpan = angular.element('<span class = \'chat_span\'>').append(str);
            var chatpara = angular.element('<p>').append(chatSpan);
            var chatDiv = angular.element('<div class= \'chat-body1 clearfix\'>').append(chatpara);
            selfText.append(nameTime);
            selfText.append(chatDiv);
            angular.element('#messages').append(selfText);
            $scope.mess.push(msg);
        }
        var messageCtr = 0;
        //this is called when message is received in chat session
        socket.on('message', function (msg) {
            var time = new Date(msg.curDate);
            var currenttime = convertDate(time);
            //float left
            var str = convertLinks(msg.text);
            var partnetText = angular.element('<li class= \'left clearfix partner_chat\'>');
            var nameTime1 = angular.element('<span class= partner_chat_time>').text(msg.user + ', ' + currenttime);
            var chatSpan1 = angular.element('<span class = \'chat_span\'>').append(str);
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

        var convertLinks = function(text){
            var link =text.
                replace(/</g, '&lt;').
                replace(/>/g, '&gt;').
                replace(/(http[^\s]+)/g, '<a href="$1">$1</a>')
               ;
            return link;
        }

        //converts date in to hh:mm format
        var convertDate = function(time){
            var currenttime = time.toLocaleString('en-US', { hour: 'numeric', hour12: ishour12, minute: '2-digit' });
            return currenttime;
        }
    })
    //directive to scroll to the bottom of the page when text is sent or received
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
    //directive to scroll to the bottom of the page when tab is switched and user has unread messages at the bottom
    .directive("scroll-bottom", function () {
        return {
            link: function (scope, element, attr) {
                var $id = $("#" + attr.scroll - bottom);
                $(element).on("click", function () {
                    $id.scrollTop($id[0].scrollHeight);
                });
            }
        }
    })
    .run(['$rootScope', function($rootScope) {
        $rootScope.lang = 'en';
    }]);