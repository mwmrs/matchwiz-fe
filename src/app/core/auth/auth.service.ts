import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { LoginRequest, LoginResponse, RegisterRequest, User } from '../api/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(req: LoginRequest) {
    return this.http.post<LoginResponse>('/api/auth/login', req);
  }

  register(req: RegisterRequest) {
    return this.http.post<User>('/api/auth/register', req);
  }

  getMe() {
    return this.http.get<User>('/api/users/me');
  }
}
