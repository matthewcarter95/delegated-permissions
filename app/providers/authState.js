import { eachElement, elementMapper, parseJwt } from '../utils';

export var authState = {
	accessToken: undefined,
	isAuthenticated: false,
	user: undefined,
};

export const authStateProvider = new Proxy(authState, {
	set: (target, key, value) => {
		target[key] = value;

		switch (key) {
			case 'accessToken':
				console.log('setting token...');
				value = value ? parseJwt(value) : '';

				document.getElementById(elementMapper[key]).innerHTML = JSON.stringify(value, null, 4);
				break;
			case 'isAuthenticated':
				eachElement('.auth-invisible', (e) => e.classList[value ? 'add' : 'remove']('auth-hidden'));

				eachElement('.auth-visible', (e) => e.classList[value ? 'remove' : 'add']('auth-hidden'));

				if (!value) {
					target.accessToken = undefined;
					target.user = undefined;
				}
				break;
			case 'user':
				document
					.querySelectorAll(`[id^=${elementMapper[key]}]`)
					.forEach((element) => (element.innerHTML = !value ? '' : JSON.stringify(value, null, 4)));

				eachElement('.profile-image', (element) => (element.src = value?.picture || ''));
				eachElement('.user-name', (element) => (element.innerText = value?.name || ''));
				eachElement('.user-email', (element) => (element.innerText = value?.email || ''));
				eachElement('.user-given-name', (element) => (element.innerText = value?.given_name || ''));
				
				// Update specific user fields
				document.getElementById('user-given-name').innerText = value?.given_name || '';
				document.getElementById('user-family-name').innerText = value?.family_name || '';
				document.getElementById('user-email').innerText = value?.email || '';

				break;
			default:
				break;
		}

		return true;
	},
});