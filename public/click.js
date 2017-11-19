angular.module('register',[])
  .controller('registerCtrl',RegisterCtrl)
  .factory('registerApi',registerApi)
  .constant('apiUrl','http://localhost:1337'); // CHANGED for the lab 2017!

function RegisterCtrl($scope,registerApi){

  // Authentication
  $scope.authenticated = true;
  $scope.loginClick=loginClick;
  $scope.logoutClick=logoutClick;
  $scope.userID = 1;

  // Void
  $scope.voidClick=voidClick;

  // Sale
  $scope.saleClick=saleClick;

  // Button intialization
   $scope.buttons=[]; //Initially all was still
   $scope.errorMessage='';
   $scope.isLoading=isLoading;
   $scope.refreshButtons=refreshButtons;
   $scope.buttonClick=buttonClick;

// Line intialization
   $scope.lines=[]; //Initially all was still
   $scope.errorMessage='';
   $scope.isLoading=isLoading;
   $scope.refreshLines=refreshLines;
   $scope.lineClick=lineClick;
   $scope.total = 0;

// Universal
   var loading = false;

   function isLoading(){
    return loading;
   }
   // Authentication functions
   function loginClick(){
     $scope.errorMessage='';
     registerApi.clickLogin(username.value, pwd.value)
        .success(function(userInfo){
          $scope.userID = userInfo[0].userID;
          $scope.authenticated = $scope.userID != -1;
        })
        .error(function(){$scope.errorMessage="Unable to click";});
   };

   function logoutClick() {
     $scope.authenticated = false;
   };

   // Void functions
   function voidClick(){
     $scope.errorMessage='';
     registerApi.clickVoid()
        .success(function(){
          totalPrice(); // calculates and formats price for UI
          refreshLines(); // gets lines from api and updates $scope.lines
        })
        .error(function(){$scope.errorMessage="Unable to click";});
   };

   // sale functions
   function saleClick(){
     $scope.errorMessage='';
     registerApi.clickSale($scope.userID, $scope.totalPrice)
        .success(function(){
          voidClick(); // call void to truncate the table and update items list
        })
        .error(function(){$scope.errorMessage="Unable to click";});
   };

   // Button functions

   // when called, gets buttons from api and updates $scope.buttons
  function refreshButtons(){
    loading=true;
    $scope.errorMessage='';
    registerApi.getButtons()
      .success(function(data){
         $scope.buttons=data;
         loading=false;
      })
      .error(function () {
          $scope.errorMessage="Unable to load Buttons:  Database request failed";
          loading=false;
      });
 }

// when called, gets lines from api and updates $scope.lines
 function refreshLines(){
   loading=true;
   $scope.errorMessage='';
   registerApi.getLines()
     .success(function(data){
        $scope.lines=data;
        decimalinator(); // formats price for UI
        totalPrice(); // calculates and formats price for UI
        loading=false;
     })
     .error(function () {
         $scope.errorMessage="Unable to load Lines:  Database request failed";
         loading=false;
     });
}

// calls the database when buttons are clicked
  function buttonClick($event){
     $scope.errorMessage='';
     registerApi.clickButton($event.target.id,$scope.userID)
        .success(function(){
          totalPrice(); // calculates and formats price for UI
          refreshLines(); // gets lines from api and updates $scope.lines

        })
        .error(function(){$scope.errorMessage="Unable to click";});
  }
  refreshButtons();  //make sure the buttons are loaded

// calculates and formats price for UI
  function totalPrice(){
    $scope.totalPrice = 0;
    for(var i = 0; i < $scope.lines.length; i++) {
      $scope.totalPrice += $scope.lines[i].price * $scope.lines[i].quantity;
    }

    $scope.totalPrice =  $scope.totalPrice + "";
    if($scope.totalPrice.substring($scope.totalPrice.length - 3, $scope.totalPrice.length - 2) != ".") {

      if($scope.totalPrice.substring($scope.totalPrice.length - 2, $scope.totalPrice.length - 1) == ".") { // if there is one decimal place (ex: 1.5)
        $scope.totalPrice += "0";
      } else { // if it is a round number (ex: 36)
        $scope.totalPrice += ".00";
      }
    }
  }

// formats price for UI
  function decimalinator() {
    for(var i = 0; i < $scope.lines.length; i++) {
      price = ($scope.lines[i].price * $scope.lines[i].quantity) + "";
      if(price.substring(price.length - 3, price.length - 2) != ".") {

        if(price.substring(price.length - 2, price.length - 1) == ".") { // if there is one decimal place (ex: 1.5)
          price += "0";
        } else { // if it is a round number (ex: 36)
          price += ".00";
        }
      }
      $scope.lines[i].displayPrice = price;
    }
  }

// calls the database when lines are clicked
  function lineClick($event){
     $scope.errorMessage='';
     registerApi.clickLine($event.target.parentElement.id)
        .success(function(){
          totalPrice(); // calculates and formats price for UI
          refreshLines(); // gets lines from api and updates $scope.lines
        })
        .error(function(){$scope.errorMessage="Unable to click";});
  }
  refreshLines();  //make sure the lines are loaded
}

// api that holds functions for retrieving button and list information
function registerApi($http,apiUrl){
  return{
    getButtons: function(){ // retreives button information from database
      var url = apiUrl + '/buttons';
      return $http.get(url);
    },
    clickButton: function(id,userID){ // sends button click information to database
      var url = apiUrl+'/click?id='+id+'&userID=' + userID;
      return $http.get(url);
    },
    getLines: function(){ // retreives list information from database
      var url = apiUrl + '/list';
      return $http.get(url);
    },
    clickLine: function(id){ // sends line click information to databse
      var url = apiUrl+'/click?id='+id;
      return $http.get(url);
    },
    clickLogin: function(username,password) {
      var url = apiUrl + '/login?username=' + username + '&password=' + password;
      return $http.get(url);
    },
    clickVoid: function() {
      var url = apiUrl + '/void';
      return $http.get(url);
    },
    clickSale: function(userID, total) {
      var url = apiUrl + '/sale?userID=' + userID + '&total=' + total;
      return $http.get(url);
    }
 };
}
