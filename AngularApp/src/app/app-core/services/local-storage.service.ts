import { AuthToken } from '../models/auth-token.interface';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  private lsPrevix = 'bps-';
  private storedKeys: string[] = [];

  constructor() { };

  /* Auth token for BPS */
  public setAuthToken(authToken: AuthToken): void {
    localStorage.setItem(this.lsPrevix + 'auth-token', JSON.stringify(this._validateToken(authToken)));
  }

  public getAuthToken(): AuthToken {
    const authTokenString = localStorage.getItem(this.lsPrevix + 'auth-token');
    let token: AuthToken = {
      access_token: '',
      refresh_token: '',
      expires_in: 0,
      token_type: 'Bearer',
      expiration_date: ''
    };
    try {
      if (authTokenString !== null) {
        token = JSON.parse(authTokenString);
      }
    } catch (e) {
      localStorage.removeItem(this.lsPrevix + 'auth-token');
      throw new Error('Invalid token');
    }
    return this._validateToken(token);
  }

  public removeAuthToken(): void {
    localStorage.removeItem(this.lsPrevix + 'auth-token');
  }

  private _validateToken(authToken: AuthToken): AuthToken {

    if (typeof authToken.access_token !== 'string') {
      localStorage.removeItem(this.lsPrevix + 'auth-token');
      throw new Error('Invalid token');
    }

    // if (typeof authToken.expires_in !== 'number') {
    //   localStorage.removeItem(this.lsPrevix + 'auth-token');
    //   throw new Error('Invalid token');
    // }

    // if (typeof authToken.refresh_token !== 'string') {
    //   localStorage.removeItem(this.lsPrevix + 'auth-token');
    //   throw new Error('Invalid token');
    // }

    // if (typeof authToken.token_type !== 'string') {
    //   localStorage.removeItem(this.lsPrevix + 'auth-token');
    //   throw new Error('Invalid token');
    // }

    return authToken;
  }

  /* Auth token for PhysicsCore */
  public setAuthPCToken(authPCToken: AuthToken): void {
    localStorage.setItem('auth-pc-token', JSON.stringify(this._validatePCToken(authPCToken)));
  }

  public getAuthPCToken(): AuthToken {
    const authPCTokenString = localStorage.getItem('auth-pc-token');
    let token: AuthToken = {
      access_token: '',
      refresh_token: '',
      expires_in: 0,
      token_type: 'Bearer',
      expiration_date: ''
    };
    try {
      if (authPCTokenString !== null) {
        token = JSON.parse(authPCTokenString);
      }
    } catch (e) {
      localStorage.removeItem('auth-pc-token');
      throw new Error('Invalid physics core token');
    }
    return this._validatePCToken(token);
  }

  public removeAuthPCToken(): void {
    localStorage.removeItem('auth-pc-token');
  }

  private _validatePCToken(authPCToken: AuthToken): AuthToken {
    if (typeof authPCToken.access_token !== 'string') {
      localStorage.removeItem('auth-pc-token');
      throw new Error('Invalid physics core token');
    }
    if (typeof authPCToken.expires_in !== 'number') {
      localStorage.removeItem('auth-pc-token');
      throw new Error('Invalid physics core token');
    }
    if (typeof authPCToken.refresh_token !== 'string') {
      localStorage.removeItem('auth-pc-token');
      throw new Error('Invalid physics core token');
    }
    if (typeof authPCToken.token_type !== 'string') {
      localStorage.removeItem('auth-pc-token');
      throw new Error('Invalid physics core token');
    }
    return authPCToken;
  }


  public hasKey(key: string): boolean {
    this.storedKeys.forEach(k => {
      if (k === key) {
        return true;
      }
    });
    const value = localStorage.getItem(key);
    return value !== null && value !== undefined && value !== 'undefined';
  }

  public setKey(key: string): void {
    if (!this.hasKey(key)) {
      this.storedKeys.push(key);
    }
  }

  public setValue<T>(key: string, value: T): void {

    if (!this.storedKeys.includes(key)) {
      this.setKey(key);
    }

    localStorage.setItem(key, JSON.stringify(value));
  }

  public getValue<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    if (value === null || value === undefined || value === 'undefined') {
      return null;
    }
    const object = <T>JSON.parse(value);
    return object;
  }

  clearLocalStorage() {
    localStorage.clear();
  }

  removeValue(key: string): void {
    localStorage.removeItem(key);
  }
}
