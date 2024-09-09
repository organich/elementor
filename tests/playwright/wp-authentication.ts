import { APIRequest, APIRequestContext } from '@playwright/test';
import axios from 'axios';

export async function login( apiRequest: APIRequest, user: string, password: string, baseUrl: string ) {
	// Important: make sure we authenticate in a clean environment by unsetting storage state.
	const context = await apiRequest.newContext( { storageState: undefined } );

	await context.post( `${ baseUrl }/wp-login.php`, {
		form: {
			log: user,
			pwd: password,
			'wp-submit': 'Log In',
			redirect_to: `${ baseUrl }/wp-admin/`,
			testcookie: '1',
		},
	} );
	return context;
}

export async function loginApi( user: string, pw: string, url: string ) {
	const data = new FormData();
	data.append( 'log', user );
	data.append( 'pwd', pw );
	data.append( 'wp-submit', 'Log In' );
	data.append( 'redirect_to', `${ url }/wp-admin/` );
	data.append( 'testcookie', '1' );

	const config = {
		method: 'post',
		maxBodyLength: Infinity,
		url: `${ url }/wp-login.php`,
		data,
	};

	const response = await axios.request( config );

	const cookies: Array<{name: string, value: string, domain: string, path: string}> = [];
	const domain = new URL( url );

	response.headers[ 'set-cookie' ].forEach( ( cookie ) => {
		const data1 = cookie.split( ';' )[ 0 ].split( '=' );
		const obj = { name: data1[ 0 ], value: data1[ 1 ], domain: domain.hostname, path: '/' };
		cookies.push( obj );
	} );

	if ( response.status !== 200 ) {
		throw new Error( JSON.stringify( response.data ) );
	}
	return cookies;
}

export async function fetchNonce( context: APIRequestContext, baseUrl: string ) {
	const response = await context.get( `${ baseUrl }/wp-admin/post-new.php` );

	if ( ! response.ok() ) {
		throw new Error( `
				Failed to fetch nonce: ${ response.status() }.
				${ await response.text() }
				${ response.url() }
			` );
	}
	const pageText = await response.text();
	const nonceMatch = pageText.match( /var wpApiSettings = .*;/ );
	if ( ! nonceMatch ) {
		throw new Error( `Nonce not found on the page:\n"${ pageText }"` );
	}

	return nonceMatch[ 0 ].replace( /^.*"nonce":"([^"]*)".*$/, '$1' );
}
