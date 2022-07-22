import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CeldType } from 'bps-components-lib';

@Component({
  selector: 'app-system-table-right',
  templateUrl: './system-table-right.component.html',
  styleUrls: ['./system-table-right.component.css']
})
export class SystemTableRightComponent implements OnInit {

  configurationCustomGrid: any;
  listOfDisplayData = [];
  listOfDisplayData2 = [];
  listOfDisplayData3 = [];
  data = [];
  data2 = [];
  data3 = [];
  sortName: string | null = null;
  sortValue: string | null = null;
  searchValue = '';
  arrow_hovered = false;
  @ViewChild('rightColumnTemplate', { read: TemplateRef, static: true }) rightColumnTemplate: TemplateRef<{}>;

  constructor() { }

  ngOnInit(): void {


    this.configurationCustomGrid = {
      fields: [
        {
          celdType: CeldType.Default,
          display: 'Name',
          property: 'description',
          width: '290px',
          showSort: true
        },
        {
          celdType: CeldType.TemplateRef,
          property: 'outside',
          width: '35px',
          showSort: false
        }
      ],
      fieldId: 'id'
    };

    this.loadData();
    this.listOfDisplayData = this.data.slice();
    this.listOfDisplayData2 = this.data2.slice();
    this.listOfDisplayData3 = this.data3.slice();


  }

  preventDefault($event: Event) {
    $event.preventDefault();
    $event.stopImmediatePropagation();
  }


  loadData(): void {
    this.data = [];
    this.data2 = [];
    this.data3 = [];
    for (let i = 0; i < 18; i++) {
      this.data.push({
        id: '' + i,
        description: 'Window system ' + (i+1),
        outside: {
          ref: this.rightColumnTemplate,
          context: {
            value: 'o',
            disabled: false,
            arrowHovered: false,
            index: i
          }
        },
        disabled:  false,
        bpsTable4CustomRow: true
      });
      this.data2.push({
        id: '' + i,
        description: 'Sliding Door system ' + (i+1),
        outside: {
          ref: this.rightColumnTemplate,
          context: {
            value: 'o',
            disabled: false,
            arrowHovered: false,
            index: i
          }
        },
        disabled:  false,
        bpsTable4CustomRow: true
      });
      this.data3.push({
        id: '' + i,
        description: 'Facade system ' + (i+1),
        outside: {
          ref: this.rightColumnTemplate,
          context: {
            value: 'o',
            disabled: false,
            arrowHovered: false,
            index: i
          }
        },
        disabled:  false,
        bpsTable4CustomRow: true
      });
    }
  }

  onHover(index, value) {
    this.listOfDisplayData[index].outside.context.arrowHovered = value;
  }

  log($event) {
    console.log($event);
  }

  sort(sort: { sortName: string; sortValue: string }): void {
    this.sortName = sort.sortName;
    this.sortValue = sort.sortValue;
    this.search();
  }

  filter(value: string): void {
    this.searchValue = value;
    this.search();
  }

  search(): void {
    const filterFunc = (item: any) => {
      return item.description.indexOf(this.searchValue) !== -1;
    };
    const data = this.data.filter((item: { description: string; uValue: string; rw: string }) => filterFunc(item));
    const data2 = this.data2.filter((item: { description: string; uValue: string; rw: string }) => filterFunc(item));
    const data3 = this.data3.filter((item: { description: string; uValue: string; rw: string }) => filterFunc(item));
    if (this.sortName && this.sortValue) {
      this.listOfDisplayData = data.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortName!] > b[this.sortName!]
            ? 1
            : -1
          : b[this.sortName!] > a[this.sortName!]
            ? 1
            : -1
      );
      this.listOfDisplayData2 = data2.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortName!] > b[this.sortName!]
            ? 1
            : -1
          : b[this.sortName!] > a[this.sortName!]
            ? 1
            : -1
      );
      this.listOfDisplayData3 = data3.sort((a, b) =>
        this.sortValue === 'ascend'
          ? a[this.sortName!] > b[this.sortName!]
            ? 1
            : -1
          : b[this.sortName!] > a[this.sortName!]
            ? 1
            : -1
      );
      this.listOfDisplayData = this.listOfDisplayData.slice();
      this.listOfDisplayData2 = this.listOfDisplayData2.slice();
      this.listOfDisplayData3 = this.listOfDisplayData3.slice();
    } else {
      this.listOfDisplayData = data;
      this.listOfDisplayData2 = data2;
      this.listOfDisplayData3 = data3;
    }
  }

}
