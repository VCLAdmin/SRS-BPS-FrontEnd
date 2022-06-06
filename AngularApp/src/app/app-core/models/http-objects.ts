import { Injectable } from '@angular/core';

const apiBaseUrl = 'api';


export class HttpObject {
  
  protected baseUrl: string;
  protected get: string;
  protected getOne: string = '';
  protected create: string;
  protected update: string;
  protected delete: string;

  constructor(baseUrl: string, getUrl: string, createUrl: string, updateUrl: string, deleteUrl: string, getOneUrl?: string) {
    this.baseUrl = baseUrl;
    this.get = getUrl;
    this.getOne = getOneUrl as string;
    this.create = createUrl;
    this.update = updateUrl;
    this.delete = deleteUrl;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getApiBaseUrl(): string {
    return apiBaseUrl + '/' + this.baseUrl + '/';
  }


  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  getCreateUrl(): string {
    return apiBaseUrl + '/' + this.baseUrl + '/' + this.create;
  }

  setCreateUrl(url: string): void {
    this.create = url;
  }

  getUpdateUrl(): string {
    return apiBaseUrl + '/' + this.baseUrl + '/' + this.update;
  }

  setUpdateUrl(url: string): void {
    this.update = url;
  }

  getDeleteUrl(): string {
    return apiBaseUrl + '/' + this.baseUrl + '/' + this.delete;
  }

  setDeleteUrl(url: string): void {
    this.delete = url;
  }

  getGetUrl(): string {
    return apiBaseUrl + '/' + this.baseUrl + '/' + this.get;
  }

  setGetUrl(url: string): void {
    this.get = url;
  }

  getGetOneUrl(): string {
    return apiBaseUrl + '/' + this.baseUrl + '/' + this.getOne;
  }

  setGetOneUrl(url: string): void {
    this.getOne = url;
  }
}
