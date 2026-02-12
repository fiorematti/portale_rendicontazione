export const environment = {
  apiBaseUrl: 'http://localhost:5000',
  msal: {
    clientId: '37bdcadd-4948-4dff-9c60-a3d119fa4ab5',
    authority: 'https://login.microsoftonline.com/b3c5783b-8e0b-4639-85b6-e17c2dabed5b',
    scopes: ['api://37bdcadd-4948-4dff-9c60-a3d119fa4ab5/user_impersonation'],
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200/login',
  },
};