import { useState, useCallback, useEffect } from 'react';
//set timer which basically ensures that we lock the user out automatically if toke expired
let logoutTimer;
export const useAuth = () => {
	const [ token, setToken ] = useState(false);
	const [ tokenExpirationDate, setTokenExpirationDate ] = useState();
	const [ userId, setUserId ] = useState(false);
	//we wnat also set a kind of timer after the user logged
	const login = useCallback((uid, token, expirationDate) => {
		setToken(token);
		setUserId(uid);
		//create expirtion date
		//here tokenExpirationDate is deffrent of useState coz in another scope
		const tokenExpirationDate = expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60);
		setTokenExpirationDate(tokenExpirationDate);
		//globa JS browser API and we can add a new entry with .setItem
		localStorage.setItem(
			'userData',
			JSON.stringify({
				userId: uid,
				token: token,
				//toISOSstring to ensure that no data gets lost when this date is stringify
				expiration: tokenExpirationDate.toISOString()
			})
		);
	}, []);
	const logout = useCallback(() => {
		setToken(null);
		setTokenExpirationDate(null);
		setUserId(null);
		localStorage.removeItem('userData');
	}, []);
	useEffect(
		() => {
			if (token && tokenExpirationDate) {
				const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
				logoutTimer = setTimeout(logout, remainingTime);
			} else {
				clearTimeout(logoutTimer);
			}
		},
		[ token, logout, tokenExpirationDate ]
	);
	// add auto login // app.js the frist file run in react therfore we do this function here
	// add function to useEffect to check local storge for a token
	// the dependencies function will be an empty array that means this function will only run once
	// whene the component rendered for first time //mounts//
	// useEffect always runs after the render cycle, so react well rendered component down the run useEffect
	useEffect(
		() => {
			//check local storge.getItem and then the same key that we used it to store 'userData'
			//json.parse to convert json string back to regular JS
			const storedData = JSON.parse(localStorage.getItem('userData'));
			if (storedData && storedData.token && new Date(storedData.expiration) > new Date()) {
				login(storedData.userId, storedData.token, new Date(storedData.expiration));
			}
		},
		[ login ]
	);
	return { token, login, logout, userId };
};
