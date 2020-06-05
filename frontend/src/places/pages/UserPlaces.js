import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import PlaceList from '../components/PlaceList';

// const DUMMY_PLACES = [
//   {
//     id: 'p1',
//     title: 'Empire State Building',
//     description: 'One of the most famous sky scrapers in the world!',
//     imageUrl:
//       'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
//     address: '20 W 34th St, New York, NY 10001',
//     location: {
//       lat: 40.7484405,
//       lng: -73.9878584
//     },
//     creator: 'u1'
//   },
//   {
//     id: 'p2',
//     title: 'Emp. State Building',
//     description: 'One of the most famous sky scrapers in the world!',
//     imageUrl:
//       'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg',
//     address: '20 W 34th St, New York, NY 10001',
//     location: {
//       lat: 40.7484405,
//       lng: -73.9878584
//     },
//     creator: 'u2'
//   }
// ];
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
//Loading places by user ID
const UserPlaces = () => {
	const [ loadedPlaces, setLoadedPlaces ] = useState();
	//user our custom hook to make Http reaqust
	const { isLoading, error, sendRequest, clearError } = useHttpClient();
	//user id here is requierd to send the request
	const userId = useParams().userId;
	//extract the user ID from URL then after we want to send our requset only once wherether we will use useEffect
	useEffect(
		() => {
			const fetchPalces = async () => {
				try {
					//from places-routes  then inject the user ID as dynmic
					const responseData = await sendRequest(`http://localhost:5000/api/places/user/${userId}`);
					//.places coz that key we are getting on the backend in places-controllers and will be an array
					setLoadedPlaces(responseData.places);
				} catch (err) {}
			};
			fetchPalces();
		},
		[ sendRequest, userId ]
	);
	const placeDeleteHandler = (deletedPlaceId) => {
		//only if the place iam looking at my existing array of places is not equal we will keep it coz if it equal it is the place i want to delete
		setLoadedPlaces((prevPlaces) => prevPlaces.filter((place) => place.id !== deletedPlaceId));
	};
	//const loadedPlaces = DUMMY_PLACES.filter((place) => place.creator === userId);
	return (
		<React.Fragment>
			<ErrorModal error={error} onClear={clearError} />
			{isLoading && (
				<div className="center">
					<LoadingSpinner />
				</div>
			)}
			{!isLoading && loadedPlaces && <PlaceList items={loadedPlaces} onDeletePlace={placeDeleteHandler} />}
		</React.Fragment>
	);
};

export default UserPlaces;
