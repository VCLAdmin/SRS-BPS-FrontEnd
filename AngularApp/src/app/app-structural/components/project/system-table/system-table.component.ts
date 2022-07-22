import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ConfigPanelsService } from 'src/app/app-structural/services/config-panels.service';
import { PanelsModule } from 'src/app/app-structural/models/panels/panels.module';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-system-table',
  templateUrl: './system-table.component.html',
  styleUrls: ['./system-table.component.css']
})
export class SystemTableComponent implements OnInit, AfterViewInit {

  private destroy$ = new Subject<void>();
  isPopoutOpened: boolean = false;

  constructor(private cpService: ConfigPanelsService) { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.cpService.obsPopout.pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        if (response.panelsModule === PanelsModule.SystemTable) {
          if (response.isOpened) {
            this.onPopoutOpened();
          }
          this.isPopoutOpened = response.isOpened;
        }
      });
  }

  onPopoutOpened() {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
