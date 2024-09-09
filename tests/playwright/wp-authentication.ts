import { APIRequest, APIRequestContext, Browser, Page } from '@playwright/test';

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

export async function fetchNonce( context: APIRequestContext, browser: Browser, baseUrl: string ) {
	const response = await context.get( `${ baseUrl }/wp-admin/post-new.php` );

	if ( ! response.ok() ) {
		throw new Error( `
            Failed to fetch nonce: ${ response.status }.
            ${ await response.text() }
            ${ response.url() }
        ` );
	}

	let pageText = await response.text();
	if ( pageText.includes( 'WordPress has been updated! Next and final step is to update your database to the newest version' ) ) {
		const contextUI = await browser.newContext();
		const page: Page = await contextUI.newPage();
		await page.goto( `${ baseUrl }/wp-admin/post-new.php` );
		await page.getByText( 'Update WordPress Database' ).click();
		await page.getByText( 'Continue' ).click();

		const retryResponse = await context.get( `${ baseUrl }/wp-admin/post-new.php` );
		if ( ! retryResponse.ok() ) {
			throw new Error( `
                Failed to fetch nonce after database update: ${ retryResponse.status }.
                ${ await retryResponse.text() }
                ${ retryResponse.url() }
            ` );
		}

		pageText = await retryResponse.text();
		await browser.close();
	}

	const nonceMatch = pageText.match( /var wpApiSettings = .*;/ );
	if ( ! nonceMatch ) {
		throw new Error( `Nonce not found on the page:\n"${ pageText }"` );
	}

	return nonceMatch[ 0 ].replace( /^.*"nonce":"([^"]*)".*$/, '$1' );
}

