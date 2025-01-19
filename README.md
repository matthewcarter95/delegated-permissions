# Okta CIS devCamp App

This App is part of the devCamp presented by [Okta](https://okta.com).

The app utilizes a [proxy provider](https://www.javascripttutorial.net/es6/javascript-proxy/) for state management.

## Configuring the App

### Challenge 1

1. In your tenant's application settings, be sure to set `https://*.local-credentialless.webcontainer.io` in the:
   `Sign-in redirect URI`
2. Set the full-qualified domain name in the Sign-out redirect URI

3. Open the `config.js` file.
4. Set the `issuer` to the Default Authorization server URL.
5. Copy the `clientId` from the SPA app created in your Okta tenant.

```javascript
/*
 * config.js
 */
const config = {
	auth: {
		...defaultAuthConfig,
		issuer: 'https://demo-silver-cattle-71709.okta.com/oauth2/default',
		clientId: 'RBz9va21UvCeuSTYT9nMoRTZah1iTnoH',

```

### Challenge 2

1. If you opted to set your API `audience` value to something other than as instructed, copy the `audience` value from the `Identifier` field found on the API you created in your tenant and paste it into the `config.js` file.

```javascript
/*
 * config.js
 */
const config = {
	auth: {
		...defaultAuthConfig,
		domain: 'atko-rocks-gentle-animal.demo-platform-staging.auth0app.com',
		clientId: 'RBz9va21UvCeuSTYT9nMoRTZah1iTnoH',
		/* UNCOMMENT this line ( ⌘ + / or CTRL + / ) to test the private API */
		// audience: ['api://authrocks'],
	},
	app: {
		port: 3000,
	},
};
```

3. Uncomment line `11` of `config.js` to test the private api.

<br/>

---

<br/>

### LICENSE

This project is licensed under the MIT license. See the [LICENSE](LICENSE.txt) file for more info.
<br/>
<br/>

---
