import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { Feature } from 'src/app/app-core/models/feature';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import { CommonService } from '../services/common.service';
/**
 * Add the template content to the DOM if the condition is true.
 */
@Directive({
  selector: '[appCheckPermissions]'
})
export class CheckPermissionsDirective {
  private hasView = false;
  @Input() appCheckPermissions: Feature;
  constructor( 
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private commonService: CommonService,
    private permissionService: PermissionService
    ) { }
    
    ngOnInit(){
      let user = this.commonService.getUser();
      if (!!user && this.permissionService.checkPermission(this.appCheckPermissions)) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      } else {
        this.viewContainer.clear();
      }
    }
   // @Input() set appCheckPermissions(condition: any) {
      // if (condition && this.hasView) {
      //   this.viewContainer.createEmbeddedView(this.templateRef);
      //   this.hasView = true;
      // } else if (!condition && !this.hasView) {
      //   this.viewContainer.clear();
      //   this.hasView = false;
      // }
    //}

}