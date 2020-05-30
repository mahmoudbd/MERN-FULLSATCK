const mongoose = require('mongoose');

// we use this package to make sure that we have a unique email
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: { type: String, required: true },
	//unique this property would just create an index for the email which in simple words
	//simply speeds up the querying process if you request the email
	//spicaly if you have a big databease
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true, minlength: 6 },
	image: { type: String, required: true },
	//ref property which allows to us to establish a connection between our current schema
	//and another schema  place schema
	//we used here an array not object because one user can have multiple places
	//This is how we tell mongoose that in documents based on schema we have multiple palces entries instead
	places: [ { type: mongoose.Types.ObjectId, required: true, ref: 'Place' } ]
});

userSchema.plugin(uniqueValidator);
//special method available here in mongoose
//and model the return a constructor function and we have to add to arguments in this function
//the first is the name of the model 'User'U must be capital, and the second is our schema
module.exports = mongoose.model('User', userSchema);
