var express = require("express");
//var bodyParser = require("body-parser");//Para poder obtener los valores de un formulario
var User = require("./models/user").User; //Middleware personal: DAO User
var session = require("express-session"); //Es dependencia de redis: RedisStore
//var cookieSession = require("cookie-session");// Guarda sessiones en cookies, no ocupa redis
var router_app = require("./routes_app");//Maneja las ligas de la aplicacion.
var session_middleware = require("./middlewares/session");
var methodOverride = require("method-override");
var formidable = require("express-formidable"); // Para el guardado de archivos
var RedisStore = require("connect-redis")(session);
var realtime = require("./realtime");

var http = require("http");

var app = express();
var server = http.Server(app);

//Configurar la app para menejar la session con redis 
var sessionMiddleware = session({
	store: new RedisStore({}), //Aquí se configura el puerto, contraseña de regis al momento de instalarlo: port:6379
	secret: "super ultra secret word",
	resave: false,
	saveUninitialized: false,
});

realtime(server, sessionMiddleware);

//Para dejar los recursos: CSS, JS
app.use("/estatico",express.static('public'));
app.use(express.static('assets'));

//app.use(bodyParser.json()); //Para peticiones application/json
//app.use(bodyParser.urlencoded({extended: false}));

//Sobreescribir los metodos de los formularios: PUT
app.use(methodOverride("_method"));

/*app.use(session({
	secret: "123dcfjovjdfio",
	resave: false, //ReGuarda la sessión por cada inición de sesión
	saveUninitialized: false
}));*/
//Guarda la session en la cookies y no se pierde aunque se reinicie el server
/*app.use(cookieSession({
	name: "session",
	keys: ["llave-1", "llave-2"]
}));*/

app.use(sessionMiddleware);
//Comprobar session

//Para el manejo de archivos: subir, descargar
app.use(formidable({ keepExtensions: true }));

app.set("view engine", "jade");


app.get("/", function(req, res){
	//console.log(req.session.user_id);
	res.render("index");
});

app.get("/login", function(req, res){
	res.render("login");
	console.log("login");
	/*User.find(function(err, doc) {
		console.log(doc);
	});*/
});

app.get("/logout", function(req, res){
	if(req.session.user_id != null){
		req.session.destroy();
		console.log("cerrar sesion");
		res.redirect("/");
	}
});

app.get("/register", function(req, res){
	res.render("register");
});

app.post("/sessions", function(req, res){
	console.log("Email " + req.fields.email); //req.body - Se cambio por req.fields por conflictos con formidable
	console.log("Contraeña " + req.fields.password);
	//console.log(req);
	User.findOne({email: req.fields.email, password: req.fields.password}, function(err, user){
		if(user != null){
			req.session.user_id = user._id ;
			//console.log(req.session);
			//req.session.save();
			res.redirect("/sis");	
		}else{
			res.redirect("/login");
		}
		
	});

});

app.use("/sis", session_middleware);
app.use("/sis", router_app);

app.post("/users", function(req, res){
	console.log("Email " + req.fields.email);
	console.log("Contraeña " + req.fields.password);

	//Se crea un objeto a partir del modelo user
	var user = new User({email: req.fields.email, 
						password: req.fields.password,
						password_confirmation : req.fields.password_confirmation,
						username: req.fields.username
					});
	console.log(user.password_confirmation);
	//Se guarda el objeto.
	user.save().then(function(){
		res.send("Guardamos el usuario exitosamente");	
	}, function(err){
		if(err){
			console.log(String(err));
			res.send("Hubo un error al guardar las información");
		}
	});
	/*user.save(function(err){
		if(err){
			console.log(String(err));
			res.send("Guardamos tus datos");
			//res.send("error: " + err);
		}else{
			
			res.send("Se guardó!!");
		}
	});
	*/
});

server.listen(8010);