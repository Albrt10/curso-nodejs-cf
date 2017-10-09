var User = require("../models/user").User;

module.exports = function(req, res, next){
	//console.log(req.session);
	if(!req.session.user_id || req.session.user_id == "undefined" ){
		res.redirect("/login")
	}else{
		//console.log("Usuario: " + req.session.user_id);
		User.findById(req.session.user_id, function(err, user){
			if(err){
				console.log(err);
				res.redirect("/login");
			}else{
				res.locals = { user: user };
				next();
			}
		})
	}
}