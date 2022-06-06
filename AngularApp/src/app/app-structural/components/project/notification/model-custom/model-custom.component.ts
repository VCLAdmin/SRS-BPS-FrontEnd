import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-model-custom',
  templateUrl: './model-custom.component.html',
  styleUrls: ['./model-custom.component.css']
})
export class ModelCustomComponent implements OnInit {
  constructor() { }
  title = 'Title';
  message = 'Your Message';
  isConfirmLoading =  false;
  ngOnInit(): void {
  }
  isVisibleMiddle = false;
  modelShow(title: string, message: string): void {
    this.title = title;
    this.message = message;
    this.isVisibleMiddle = true;
  }

  handleOkMiddle(): void {
    this.isVisibleMiddle = false;
    this.isConfirmLoading = true;
  }

  handleCancelMiddle(): void {
    this.isVisibleMiddle = false;
  }
}
