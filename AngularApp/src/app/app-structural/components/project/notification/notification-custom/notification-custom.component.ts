import { AfterViewInit, Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  selector: 'app-notification-custom',
  templateUrl: './notification-custom.component.html',
  styleUrls: ['./notification-custom.component.css'],
})

export class NotificationCustomComponent implements AfterViewInit {
  @ViewChild('notificationTemplate', { read: TemplateRef, static: true }) notificationTemplate: TemplateRef<{}>;
  iconCustom = '';
  placement = 'topLeft';
  duration = 10 * 1000;
  ngStyleSettings = {
    nzStyle: {
      width: '320px',
      marginLeft: '',
      marginTop: ''
    },
    nzBottom: '24px',
    nzTop: '55px',
    nzClass: 'ant-notification-cust-level1',
    nzDuration: 10 * 1000,
    nzData: null
  }
  ngAfterViewInit() {
  }
  constructor(private notification: NzNotificationService) { }

  createBasicNotification(template: TemplateRef<{}>): void {
    this.notification.config({ nzPlacement: this.placement });
    //this.ngStyleSettings.nzDuration = this.duration;
    this.notification.template(template, this.ngStyleSettings);
  }
  notificationShow(title: string, message: string, logoToShow: string): void {
    if (logoToShow === 'Trash') {
      this.placement = 'topRight';
    }
    if (logoToShow === 'WarningReport') {
      this.ngStyleSettings.nzStyle.marginLeft = '180px';
      this.ngStyleSettings.nzStyle.marginTop = '-30px';
    }
    this.notification.config({ nzPlacement: this.placement });
    this.ngStyleSettings.nzDuration = 0;
    this.ngStyleSettings.nzData = { title: title, message: message, logoToShow: logoToShow, iconCustom: '' };
    this.notification.template(this.notificationTemplate, this.ngStyleSettings);
  }
  notificationRemove(): void {
    setTimeout(() => {
      this.notification.remove();
    }, 100);
  }


  ngOnInit(): void {

  }
}
