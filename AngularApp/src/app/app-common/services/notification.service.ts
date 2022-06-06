import { Component, Injectable, TemplateRef, ViewChild } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzMessageService } from 'ng-zorro-antd/message';

// @Component({
//   template: `
//     <ng-template #notificationTemplate>
//     <div class="ant-notification-notice-content">
//       <div class="ant-notification-notice-with-icon">
//         <span class="ant-notification-notice-icon">
//           <span *ngIf="logoToShow === 'Acoustic'">
//             <img src="../../../../../../assets/bps-icons/sps_rectangle_icon_acoustic_active.svg" />
//           </span>
//           <span *ngIf="logoToShow === 'Structural'">
//             <img src="../../../../../../assets/bps-icons/sps_rectangle_icon_structural_active.svg" />
//           </span>
//           <span *ngIf="logoToShow === 'Thermal'">
//             <img src="../../../../../../assets/bps-icons/sps_rectangle_icon_thermal_active.svg" />
//           </span>
//           <span *ngIf="iconCustom !== ''">
//             <i nz-icon [nzType]="iconCustom" style="color: rgb(16, 142, 233);"></i>
//           </span>
//         </span>
//         <div class="ant-notification-notice-message">{{title}}</div>
//         <div class="ant-notification-notice-description">{{message}}</div>
//       </div>
//     </div>
//   </ng-template>
//   `
// })
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  ngStyleSettings = {
    nzStyle: {
      width: '320px',
      marginLeft: '293px'
    },
    nzClass: 'ant-notification-cust-level1',
    nzTop: '55px',
    nzDuration: 0
  }

  constructor(
    private notification: NzNotificationService,
    private nzMessageService: NzMessageService) { }

  BasicNotification(title: string, message: string, duration: number = 0, placement: string = 'topLeft', position: string = '293px'): void {
    this.notification.config({ nzPlacement: placement });
    this.ngStyleSettings.nzDuration = duration;
    this.ngStyleSettings.nzStyle.marginLeft = position;
    this.notification.blank(title, message, this.ngStyleSettings);
  }
  SuccessNotification(title: string, message: string, duration: number = 0 * 1000, placement: string = 'topLeft', position: string = '293px'): void {
    this.notification.config({ nzPlacement: placement });
    this.ngStyleSettings.nzDuration = duration;
    this.ngStyleSettings.nzStyle.marginLeft = position;
    this.notification.success(title, message, this.ngStyleSettings);
  }
  InfoNotification(title: string, message: string, duration: number = 0 * 1000, placement: string = 'topLeft', position: string = '293px'): void {
    this.notification.config({ nzPlacement: placement });
    this.ngStyleSettings.nzDuration = duration;
    this.ngStyleSettings.nzStyle.marginLeft = position;
    this.notification.info(title, message, this.ngStyleSettings);
  }
  WarningNotification(title: string, message: string, duration: number = 0 * 1000, placement: string = 'topLeft', position: string = '293px'): void {
    this.notification.config({ nzPlacement: placement });
    this.ngStyleSettings.nzDuration = duration;
    this.ngStyleSettings.nzStyle.marginLeft = position;
    this.notification.warning(title, message, this.ngStyleSettings);
  }
  ErrorNotification(title: string, message: string, duration: number = 0 * 1000, placement: string = 'topLeft', position: string = '293px'): void {
    this.notification.config({ nzPlacement: placement });
    this.ngStyleSettings.nzDuration = duration;
    this.ngStyleSettings.nzStyle.marginLeft = position;
    this.notification.error(title, message, this.ngStyleSettings);
  }
  // @ViewChild('notificationTemplate', { read: TemplateRef, static: false }) notificationTemplate: TemplateRef<{}>;
  // CustomNotification(title: string, message: string, duration: number = 0 * 1000, placement: string = 'topLeft'): void {
  //   this.notification.config({ nzPlacement: placement });
  //   this.ngStyleSettings.nzDuration = duration;
  //   this.notification.template(this.notificationTemplate, this.ngStyleSettings);
  // }

  cancel(): void {
    this.nzMessageService.info('click cancel');
  }
  confirm(): void {
    this.nzMessageService.info('click confirm');
  }
}