const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');
//check token and if it's a valid token
//the requset body is not a great choice coz example dalate or get method in our project does't have a req.body
//so useing headers it good
module.exports = (req, res, next) => {
	if (req.method === 'OPTIONS') {
		return next();
	}
	try {
		// scenario one we handling first if authrization header is not set all and therefore split fails
		//scenario tow is that it succeeds but we had in there does not give us such a token
		const token = req.headers.authorization.split(' ')[1];
		if (!token) {
			throw new Error('Authenticatio failied');
		}
		//here we need to verify the token
		//so here we validating the token and once it is valid we let the request continue
		//and we add data to the request
		const decodedToken = jwt.verify(token, process.env.JWT_KEY);
		//add to the request includes my user id which i get from the decoded token and there userId
		req.userData = { userId: decodedToken.userId };
		next();
	} catch (err) {
		const error = new HttpError('Authentication failed', 401);
		return next(error);
	}
};
