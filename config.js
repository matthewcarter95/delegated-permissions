const defaultAuthConfig = {
  authorizationParams: {
    scope: 'openid profile email',
  },
};

const config = {
  auth: {
    ...defaultAuthConfig,
    issuer: 'https://demo-red-amphibian-2018.okta.com/oauth2/default',
    clientId: '0oalnvo5fzOSYBZr4697',
    // audience: ['api://default'],
  },
  app: {
    enableSilentAuth: true,
    port: 3000,
  },
  server: {
    permissions: ['AuthRocks'],
  },
};

export default config;
