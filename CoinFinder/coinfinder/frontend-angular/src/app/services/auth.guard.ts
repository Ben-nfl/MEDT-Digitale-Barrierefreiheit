// die zugangskontrolle entscheidet vor einem seitenwechsel, ob der geschützte bereich geöffnet werden darf.
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  // holt den anmeldedienst und die navigation, ohne dafür eine eigene klasse zu brauchen.
  const auth = inject(AuthService);
  const router = inject(Router);
  // hier wird nur geprüft, ob ein token gespeichert ist. ob er noch gültig ist, prüft diese stelle nicht.
  if (auth.isLoggedIn) return true;
  // ohne token wird die anmeldung geöffnet und der ursprünglich gewünschte seitenwechsel abgelehnt.
  router.navigate(['/login']);
  return false;
};
