var app = angular.module("appController",[]);
app.controller("navbarCtrl",['$scope','$location',function($scope,$location){
	$scope.search = function(key){
		if(key.length==0) $location.url('/home');
		else $location.url('/search?key='+key);
	}
}]);
app.controller("ProfileCtrl",[function(){

}]);
app.controller("ArticleCtrl",[function(){

}]);
app.controller("HomepageCtrl",[function(){

}]);
app.controller('SignUpCtrl',[function(){

}]);
app.controller('CreateNewArticleCtrl',[function(){

}]);
app.controller('ViewArticleCtrl',[function(){

}]);
app.controller('SearchCtrl',[function(){

}]);
app.controller("View2Ctrl",[function(){

}])