(function(){
	  Parse.initialize('lCjUwEffDQF5oSOv1I5PfU7FokVqlPpRigY8eLxA', 'oSQa3H7QnKZjiEka23l46GDHDEvkOq3FVlFT1StS');

	  //template engine
	  var template = {};
	  ['evaluationView', 'updateSuccessView', 'loginView'].forEach(function(e){
	  	var tpl = document.getElementById(e).text;
	  	template[e] = doT.template(tpl);
	  });

	  //可選-編寫共用函數();
	  var handler = {
	    navbar: function(){
	      	if(Parse.User.current()){
	        	document.getElementById('evaluationButton').style.display = 'block';
				document.getElementById('logoutButton').style.display = 'block';
				document.getElementById('loginButton').style.display = 'none';
				document.getElementById("logoutButton").addEventListener('click', function () {
			        Parse.User.logOut();
			        handler.navbar();
			        window.location.hash = 'login/';
      			});
	      	} else {
	        	document.getElementById('evaluationButton').style.display = 'none';
				document.getElementById('logoutButton').style.display = 'none';
				document.getElementById('loginButton').style.display = 'block';
			}
	    },

	    login: function(redirect){
	      //alert message display or not
	      	var msg = function(f, id, msg){
	      		if(f){
					document.getElementById(id).style.display = 'none';
	      		} else {
	      			//the form is not valid
	      			document.getElementById(id).style.display = 'block';
	      			document.getElementById(id).innerHTML = msg;
	      		}
	      		
	      	}

	      //綁定登入表單的學號檢查事件(); // 可以利用TAHelp物件
	      	var signInidCheck = function(){
	      		return TAHelp._isMemberOf(document.getElementById("form-signin-student-id").value);
	      	}

	      //綁定註冊表單的學號檢查事件(); // 可以利用TAHelp物件
	      	var signUpidCheck = function(){
		      	return TAHelp._isMemberOf(document.getElementById('form-signup-student-id').value);
	      	}

	      //綁定註冊表單的密碼檢查事件(); // 參考上課範例
	      	var passwordCheck = function(){
	        	return document.getElementById('form-signup-password').value === document.getElementById('form-signup-password1').value;
      		}

	      //綁定登入表單的登入檢查事件(); // 送出還要再檢查一次，這裡會用Parse.User.logIn
	      	var loginCheck = function(){
    			Parse.User.logIn(document.getElementById('form-signin-student-id').value,
       							 document.getElementById('form-signin-password').value, {
						            success: function() {
				        	      		// Do stuff after successful login.
					    	    	      handler.navbar();
		    							  window.location.hash = (redirect) ? redirect : '';
					            	},
					            	error: function() {
					            		  msg(false, 'form-signin-message', 'invalid id or password');
				              	  		// The login failed. Check error to see why.
				            		}
          						});
	        }

	      //綁定註冊表單的註冊檢查事件(); // 送出還要再檢查一次，這裡會用Parse.User.signUp和相關函數
	      	var signupCheck = function(){
		        var user = new Parse.User();
		        user.set("username", document.getElementById('form-signup-student-id').value);
		        user.set("password", document.getElementById('form-signup-password').value);
		        user.set("email", document.getElementById('form-signup-email').value);
		        user.signUp(null, {
		          success: function(){
					  	handler.navbar();
		    			window.location.hash = (redirect) ? redirect : '';
		          },
		          error: function(){
		            	msg(false, 'form-signup-message', error.message);
		          }
		        });
	       }

	      //把版型印到瀏覽器上();
      	  if(Parse.User.current()){
      			window.location.hash = '';
      			handler.evaluation();
      	  } else {
      			document.getElementById('content').innerHTML = template.loginView();
      			
      			//sign in
      			//id check by keyup
      			document.getElementById('form-signin-student-id').addEventListener("keyup", function(){
	      			msg(signInidCheck(), 'form-signin-message', 'Sorry, You are not the member of this class.');
    	  		});

      			// submit 送出還要再檢查一次 + login (thru parse)
      			document.getElementById('form-signin').addEventListener("submit", function(){
      				if(!signInidCheck()){
      					alert('You are not the member of this class');
      					return false;
      				}
      				loginCheck();
      			});

      			//sign up
      			//id check by keyup
      			document.getElementById('form-signup-student-id').addEventListener("keyup", function(){
	      			msg(signUpidCheck(), 'form-signup-message', 'Sorry, but you cannot sign up for the evaluation form since you are not a member of this class.');
    	  		});

      			//password2 match check by keyup
      			document.getElementById('form-signup-password1').addEventListener("keyup", function(){
      				msg(passwordCheck(), 'form-signup-message', 'The password doesn\'t match');
      			})

      			//submit + sign up (thru parse)
      			document.getElementById('form-signup').addEventListener("submit", function(){
      				if(!signUpidCheck()) {
      					alert('You are not the member of this class.');
      					return false;
      				}
      				if(!passwordCheck()) {
      					alert('Password doesn\'t match.');
      					return false;
      				}
  					signupCheck();
      			});
      		}
		},

	    evaluate: function(){
	    	var loginState = Parse.User.current();
	      //把版型印到瀏覽器上();
	      	if(loginState){
	      		document.getElementById("content").innerHTML = template.evaluationView();
	      	} else {
	      		handler.login();
	      	}

	      //基本上和上課範例購物車的函數很相似，這邊會用Parse DB
	      //問看看Parse有沒有這個使用者之前提交過的peer review物件(
	      //沒有的話: 從TAHelp生一個出來(加上scores: [‘0’, ‘0’, ‘0’, ‘0’]屬性存分數並把自己排除掉)
	      //把peer review物件裡的東西透過版型印到瀏覽器上();
	      //綁定表單送出的事件(); // 如果Parse沒有之前提交過的peer review物件，要自己new一個。或更新分數然後儲存。
	      //);
	    },
	  };

	  var App = Parse.Router.extend({
	  	routes: {
	  		'': 'index',
	  		'login/*redirect': 'login',
	  		'peer-evaluation': 'evaluate',
	  	},
	  	
	  	index: handler.evaluate, 
	  //what's the best way to redirect index to login/evaluation page based on user's loginstate?
	  	login: handler.login,
	  	evaluate: handler.evaluate,
	  });
	  
	  this.Router = new App();
	  Parse.history.start();
	  handler.navbar();
})();