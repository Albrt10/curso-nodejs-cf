var mongoose = require("mongoose");
var Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

//Creamos conexión con la base Fotos.
mongoose.connect("mongodb://127.0.0.1/fotos",{useMongoClient: true});

var posibles_valores = ["F", "M"];
var email_match = [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,"Coloca un email válido"];
var password_validation  = {
	validator : function(p){
		return this.password_confirmation == p;
	},
	message: "Las contrañas no son iguales"
}

// Colecciones => Tablas
// Documentos => Filas o registros

//Definición de esquema y se instancía el esquema creado
var user_schema = new Schema({
	name: String,
	//username: String,
	username: {type: String, required:true, maxlength:[50,"Username muy grande"]},
	//password: String,
	password: {type:String, minlength :[8,"El password es muy corto"], validate: password_validation},
	//age: Number,
	age: {type: Number, min:[5,"La edad no puede ser menor que 5"], max: [100, "la edad no puede ser mayor que 100"]},
	email: {type: String, required: "El correo es obligatorio", match: email_match},
	date_of_birth: Date,
	sex : {type: String, enum: {values: posibles_valores, message: "Opción no váñida"} }
});

user_schema.virtual("password_confirmation").get(function() {
	return this.p_c;
}).set(function(password) {
	this.p_c = password;
});

//Crear modelo a partir del esquema.
var User = mongoose.model("User", user_schema);

module.exports.User = User;

/* TIPOS DE DATOS VÁLIDOS
	String
	Number
	Date
	Buffer
	Boolean
	Mixed
	Objectid
	Array
*/