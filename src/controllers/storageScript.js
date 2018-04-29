/// <refernce path="main.js"/>
chatApp.factory('storageService', function(){
    return{
        getSetting: function(name){
            var property = window.localStorage.getItem(name);
            return property;
        },
        saveSetting: function(name, value){
            window.localStorage.setItem(name, value);
            return true;
        }
    };
});



