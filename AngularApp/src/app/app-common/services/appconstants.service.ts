import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppconstantsService {

  constructor() { }

  public readonly APP_BASIC_ROUTE: string = '/app';
  public readonly API_BASIC_ROUTE: string = '/api';
  public readonly DEFAULT_GUID: string = '00000000-0000-0000-0000-000000000000';
  public CURRENT_CULTURE: string = 'EN-US';
  public readonly MAX_SAFE_INTEGER: number = 2147483647;
  public readonly GOOGLE_API_KEY: string = 'AIzaSyCOOGBpQ9b2Y3DSed1gm4dXGTue2f2y0-E';

  // API Servers
   public readonly APP_DOMAIN: string = 'https://localhost:58119/';                           //SRS 2.0 API localhost server
  // public readonly APP_DOMAIN: string = 'https://api.srs.vcldesign.com/';                    //SRS 2.0 API PROD server
  // public readonly APP_DOMAIN: string = 'https://srsapitest.vcldesign.com/';                    //SRS 2.0 Test server
  // public readonly APP_DOMAIN: string = 'https://apiwebtest.vcldesign.com/';                 //BPS 3.6 Test server
  // public readonly APP_DOMAIN: string = 'https://apiweb.vcldesign.com/';                     //BPS 3.6 API PROD server

  // PhysicsCore Servers
  // public readonly PHYSICS_CORE_DOMAIN: string = 'http://localhost:51558/';                  //SRS 2.0 API localhost server
  // public readonly PHYSICS_CORE_DOMAIN: string = 'https://physicscore.vcldesign.com/';       //SRS 2.0 PC API PROD server
  public readonly PHYSICS_CORE_DOMAIN: string = 'https://v2test.physicscore.vcldesign.com/';   //V2 PhysicsCore
  // public readonly PHYSICS_CORE_DOMAIN: string = 'https://test.physicscore.vcldesign.com/';  //BPS 3.6 PC Test server
  // public readonly PHYSICS_CORE_DOMAIN: string = 'https://physicscore.vcldesign.com/';       //BPS 3.6 PC PROD server


  //PhysicsCore ClientId & Secretkey
  public readonly PHYSICS_CORE_CLIENTID: string = 'a8b02c5a-6b63-4266-ba15-8a54f6b001f5';
  public readonly PHYSICS_CORE_CLIENTSECRET: string = '3*iloj-_2oe27@0v#pu!pvplpry#l+jm1j*cn+$6&vp4@mw=lw';
}
