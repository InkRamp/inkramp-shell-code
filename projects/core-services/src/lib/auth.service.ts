// projects/core-services/src/lib/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  id = 'auth of shellsa';

  constructor(){
    console.log("In constructor of auth service in shell")
  }

  login(user: string) {
    console.log(`[AuthService] Logged in: ${user}`);
  }
}
