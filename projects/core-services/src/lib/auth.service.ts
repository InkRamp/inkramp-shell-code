// projects/core-services/src/lib/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  id = 'auth of shellsa';

  constructor(){
    console.log("This is coming from the shared auth service of SHELL")
  }

  login(user: string) {
    console.log(`[AuthService] Logged in: ${user}`);
  }
}
