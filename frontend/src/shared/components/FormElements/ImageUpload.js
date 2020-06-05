import React, { useRef, useState, useEffect } from 'react';

import Button from './Button';
import './ImageUpload.css';

const ImageUpload = (props) => {
	const [ file, setFile ] = useState();
	const [ previewUrl, setPreviewUrl ] = useState();
	const [ isValid, setIsValid ] = useState(false);

	const filePickerRef = useRef();
	//this function should trigger or execute whenever the file changes so we will pass
	useEffect(
		() => {
			// check if file is not undefind
			if (!file) {
				return;
			}
			//if we make it past so can generate an image preview //the fileReader helps us read file
			const fileReader = new FileReader();
			fileReader.onload = () => {
				setPreviewUrl(fileReader.result);
			};
			//this is to create URL we can output
			fileReader.readAsDataURL(file);
		},
		[ file ]
	);
	const pickedHandler = (event) => {
		let pickedFile;
		let fileIsValid = isValid;
		//files property that holds the files to user selected
		//if not undefind
		if (event.target.files && event.target.files.length === 1) {
			pickedFile = event.target.files[0];
			setFile(pickedFile);
			setIsValid(true);
			fileIsValid = true;
		} else {
			setIsValid(false);
			fileIsValid = false;
		}
		props.onInput(props.id, pickedFile, fileIsValid);
	};

	const pickImageHandler = () => {
		filePickerRef.current.click();
	};

	return (
		<div className="form-control">
			<input
				// the here id hidden  disply none
				id={props.id}
				ref={filePickerRef}
				style={{ display: 'none' }}
				type="file"
				//accept is a default attribute we can add inputs of type ='file'
				accept=".jpg,.png,.jpeg"
				onChange={pickedHandler}
			/>
			{/* allows us to control how the image preview   */}
			<div className={`image-upload ${props.center && 'center'}`}>
				<div className="image-upload__preview">
					{previewUrl && <img src={previewUrl} alt="Preview" />}
					{!previewUrl && <p>Please pick an image </p>}
				</div>
				<Button type="button" onClick={pickImageHandler}>
					PICK IMAGE
				</Button>
			</div>
			{!isValid && <p>{props.errorText}</p>}
		</div>
	);
};

export default ImageUpload;
