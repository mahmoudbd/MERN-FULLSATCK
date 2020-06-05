const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
//simple javasecript object where i will map certain MIME type and file extensions
//coz multer gievs us some infromation about the MIME type for uploaded file
const MIME_TYPE_MAP = {
	'image/png': 'png',
	'image/jpeg': 'jpeg',
	'image/jpg': 'jpg'
};
const fileUpload = multer({
	//configure multer
	limits: 500000, //upload limit of 500 kilobytes
	storage: multer.diskStorage({
		// we can control how data should stored now this storg
		destination: (req, file, cb) => {
			cb(null, 'uploads/images');
		},
		filename: (req, file, cb) => {
			const ext = MIME_TYPE_MAP[file.mimetype];
			cb(null, uuidv4() + '.' + ext);
		}
	}),
	fileFilter: (req, file, cb) => {
		//with !! we convert undefind or null to false and we convert
		const isValid = !!MIME_TYPE_MAP[file.mimetype];
		let error = isValid ? null : new Error('Invalid mime type');
		//if validation failed
		cb(error, isValid);
	}
});

module.exports = fileUpload;
