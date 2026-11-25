// diese einstellungen gelten für die ganze app und werden beim start übergeben.
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    // macht die seitenliste verfügbar, damit angular zwischen den ansichten wechseln kann.
    provideRouter(routes),
    // damit können die dienste anfragen an das backend schicken.
    provideHttpClient(),
  ]
};
