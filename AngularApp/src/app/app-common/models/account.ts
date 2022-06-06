import { User } from './user';

export class Account {
    constructor(private UserName:string, private Password: string, private Language: string = 'en-US', public User: User=null){
        this.UserName = UserName;
        this.Password = Password;
        this.Language = Language;
        this.User = User ;
    } 
}
