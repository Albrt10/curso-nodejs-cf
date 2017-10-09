var express = require("express");
var Imagen = require("./models/imagenes");
var fs = require("fs");
var redis = require("redis");

var client = redis.createClient();

var image_finder_middleware = require("./middlewares/find_image");

var router = express.Router();

router.get("/", function(req, res){
	Imagen.find({})
		.populate("creator")
		.exec(function(err, imgs){
			if(err){
				console.log(err);
			}else{
				res.render("app/home", {imagenes: imgs});
			}

		});
});

/* REST */

router.get("/imagenes/new", function(req, res){
	res.render("app/imagenes/new");
});

//Utiliza el middleware para las peticiones con /imagenes/:id*; *=lo que sea
router.all("/imagenes/:id*", image_finder_middleware);

router.get("/imagenes/:id/edit", function(req, res){
	res.render("app/imagenes/edit");
});

router.route("/imagenes/:id")
		.get(function(req, res){
			//client.publish("images", res.locals.imagen.toString());
			res.render("app/imagenes/show");
		})
		.put(function(req, res){
			res.locals.imagen.title = req.fields.title;
			res.locals.imagen.save(function(err){
				if(!err){
					res.render("app/imagenes/show");
				}else{
					res.render("app/imagenes/"+ req.params.id+ "/edit");
				}
			})
		})
		.delete(function(req, res){
			//Eliminar imagenes
			Imagen.findOneAndRemove({_id: req.params.id}, function(err){
				if(!err){
					res.redirect("/sis/imagenes")
				}else{
					console.log(err);
					res.redirect("/sis/imagenes/" + req.params.id);
				}
			});
		});


router.route("/imagenes")
		.get(function(req, res){
			Imagen.find({creator: res.locals.user._id}, function(err, imgs){
				if(err){
					res.redirect("/sis");
					return;
				}
				res.render("app/imagenes/index", {imagenes: imgs});
			});
		})
		.post(function(req, res){
			//console.log("postFile");
			//console.log(req.fields);//req.body.archivo
			//console.log(req.files.archivo);
			var extension = req.files.archivo.name.split(".").pop();
			var data = {
				title: req.fields.title,
				creator: res.locals.user.id,
				extension: extension
			}

			var imagen = new Imagen(data);

			imagen.save(function(err){
				if(!err){

					var imgJSON = {
						"id": imagen._id,
						"title": imagen.title,
						"extension": imagen.extension
					};

					client.publish("images", JSON.stringify(imgJSON));
					fs.rename(req.files.archivo.path, "public/imagenes/" + imagen._id + "." + extension);
					res.redirect("/sis/imagenes/" + imagen._id);
				}else{
					res.render(err);
				}
			})
		});

module.exports = router;