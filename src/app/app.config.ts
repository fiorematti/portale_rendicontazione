import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { MsalGuardConfiguration, MsalInterceptor, MsalInterceptorConfiguration, MsalModule } from '@azure/msal-angular';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';

import { routes } from './app.routes';
import { AuthTokenInterceptor } from './auth/auth.interceptor';

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: '37bdcadd-4948-4dff-9c60-a3d119fa4ab5',
    authority: 'https://login.microsoftonline.com/b3c5783b-8e0b-4639-85b6-e17c2dabed5b',
  },
  cache: {
    cacheLocation: 'localStorage'
  }
});

const guardConfig: MsalGuardConfiguration = {
  interactionType: InteractionType.Redirect,
  authRequest: {
    scopes: ['User.Read']
  }
};

const interceptorConfig: MsalInterceptorConfiguration = {
  interactionType: InteractionType.Redirect,
  protectedResourceMap: new Map<string, string[]>([])
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(MsalModule.forRoot(msalInstance, guardConfig, interceptorConfig)),
    { provide: HTTP_INTERCEPTORS, useClass: AuthTokenInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true }
  ]
};
