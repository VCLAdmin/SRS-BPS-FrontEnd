import { Injectable } from '@angular/core';
import { CommonService } from 'src/app/app-common/services/common.service';
import { Feature, Permission } from '../models/feature';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private commonService: CommonService) { }

  checkPermission(feature: Feature, user: User = this.commonService.getUser(), permission: Permission=null): boolean {
    if(!user)
      return false;
    if(user.Features){
      const userAccessibleFeatures = user.Features.find(f => f.Feature === Feature[feature]);
      if(userAccessibleFeatures && 
          (userAccessibleFeatures.Permission == Permission.ReadOnly
            || userAccessibleFeatures.Permission == Permission.WriteAccess
            || userAccessibleFeatures.Permission == Permission.FullAccess))
        return true; //any permission except NoAccess
      // if (!!featurePermission) {
      //   switch (permission) {
      //     case Permission.NoAccess:
      //       return featurePermission.permission === Permission.NoAccess;
      //     case Permission.ReadOnly:
      //       return featurePermission.permission === Permission.ReadOnly;
      //     case Permission.WriteAccess:
      //       return featurePermission.permission === Permission.WriteAccess;
      //     case Permission.FullAccess:
      //         return featurePermission.permission === Permission.FullAccess;
      //   }
      // }
      return false;
    }
    return true;
  }
}
