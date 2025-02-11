import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RegisterUser, LoginUser } from '../models/user';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';

import {  ResponseLogin} from '../models/auth.model'
@Injectable({
  providedIn: 'root'
})

export class GeneralServiceService {


  constructor(
    private http: HttpClient,

  ) { }

  createUser(user: RegisterUser ) {
    return this.http.post(`${environment.apiUrl}/register`, user );
  }


  Login(username: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/login`, 
      { username, 
      password });
  }



  register(username:string, password:string, confirm_password:string){
    return this.http.post(`${environment.apiUrl}/register`, {
      username,
      password,
      confirm_password});
  }

}



