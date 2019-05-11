import { Injectable, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { IAuthenticationService } from "./authentication.service-interface";

@Injectable()
export class AuthenticationMockService implements IAuthenticationService {

  @Output("usernameChanged") usernameChanged = new EventEmitter<void>();
  @Output("authenticatedChanged") authenticatedChanged = new EventEmitter<void>();
  
  userName:string = "Dummy";

  login(username: string, password: string): Observable<any> {
    this.userName = username;
    this.authenticatedChanged.emit();
    this.usernameChanged.emit();
    return Observable.of(null);
  }

  logout():Observable<any> {
    // remove user from local storage to log user out
    this.userName = null;
    this.authenticatedChanged.emit();
    this.usernameChanged.emit();
    return Observable.of(null);
  }

  get authenticated(): boolean {
    return this.username!=null;
  }
  get username(): string {
    return this.userName;
  }
}
