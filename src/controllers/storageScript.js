/// <refernce path="main.js"/>
//Storage service class for storing and retreiving data from browser's local storage.
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



