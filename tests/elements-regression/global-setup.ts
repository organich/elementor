import { FullConfig, chromium } from '@playwright/test';
import { loginApi } from '../playwright/wp-authentication';

export async function globalSetup( config: FullConfig ) {
	const { baseURL, headless } = config.projects[ 0 ].use;
	const browser = await chromium.launch( { headless } );
	const context = await browser.newContext();
	const page = await context.newPage();
	const cookies = await loginApi(
		process.env.USERNAME || 'admin',
		process.env.PASSWORD || 'password',
		process.env.BASE_URL || 'http://localhost:8888',
	);
	await context.addCookies( cookies );
	await page.goto( `${ baseURL }/wp-admin` );
	await page.getByText( 'Dashboard' ).nth( 0 ).waitFor();

	let window: any;
	process.env.WP_REST_NONCE = await page.evaluate( () => window.wpApiSettings.nonce );
	const storageState = await page.context().storageState( { path: './storageState.json' } );
	process.env.STORAGE_STATE = JSON.stringify( storageState );
	process.env.BASE_URL = baseURL;
	return { page, storageState, baseURL, browser };
}

export default globalSetup;
