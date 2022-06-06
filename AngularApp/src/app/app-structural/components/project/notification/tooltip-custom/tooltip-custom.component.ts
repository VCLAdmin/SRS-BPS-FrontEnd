import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-tooltip-custom',
  templateUrl: './tooltip-custom.component.html',
  styleUrls: ['./tooltip-custom.component.css']
})
export class TooltipCustomComponent implements OnInit {
  message: string = '';
  constructor() { }

  ngOnInit(): void {
  }

}
