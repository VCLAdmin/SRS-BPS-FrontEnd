import { AccessRole } from './access-role';

export class User {
    UserId: number;
    UserGuid: string;
    UserName: string;
    NameFirst: string;
    NameLast: string;
    Email:string;
    Language: string;
    Company: string;
    Hash: string;
    Salt: Uint8Array; //byte[]
    AccessRole: AccessRole[]=[];
}
