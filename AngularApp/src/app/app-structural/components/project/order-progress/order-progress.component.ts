import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-order-progress',
  templateUrl: './order-progress.component.html',
  styleUrls: ['./order-progress.component.css']
})
export class OrderProgressComponent implements OnInit {
  @Input() order: any;
  @Input() dealerInfo: any;
  @Input() shippingMethod: any;

  currentOrder: any;
  constructor() { }

  orderProgressList = [
    /*case "Order_Placed": case "Order Placed":  return "Pending"; break;
      case "In_Pre_Production": case "In Pre Production": return "In Process"; break;
      case "In_Fabrication": case "In Fabrication": return "In Process"; break;
      case "In_Assembly": case "In Assembly": return "In Process"; break;
      case "Shipped": return "In Process"; break;
      case "Delivered": return "In Process"; break;
      case "Completed": return "Completed"; break;
      case "Cancelled": return "Cancelled"; break;*/

    // { Index: 0, Status: "Pending", Progress: "Ordered", Description: "" },
    
    // // { Index: 0, Status: "In Process", Progress: "Order Placed", Description: "" },
    // // { Index: 1, Status: "In Process", Progress: "In Pre Production", Description: "" },
    // // { Index: 2, Status: "In Process", Progress: "In Fabrication", Description: "" },
    // // { Index: 3, Status: "In Process", Progress: "In Assembly", Description: "" },
    // // { Index: 4, Status: "In Process", Progress: "Shipped", Description: "" },
    // // { Index: 5, Status: "Completed", Progress: "Delivered", Description: "" },
    // { Index: 5, Status: "Completed", Progress: "Completed", Description: "" },
    // { Index: 5, Status: "Cancelled", Progress: "Cancelled", Description: "" }

    // new status added as per Client request
    { Index: 0, Status: "In Process", Progress: "Order Placed", Description: "" },
    { Index: 1, Status: "In Process", Progress: "Payment Received", Description: "" },
    { Index: 2, Status: "In Process", Progress: "In Pre Production", Description: "" },
    { Index: 3, Status: "In Process", Progress: "In Fabrication", Description: "" },
    { Index: 4, Status: "In Process", Progress: "In Assembly", Description: "" },
    { Index: 5, Status: "In Process", Progress: "Shipped", Description: "" },
    { Index: 6, Status: "Completed", Progress: "Delivered", Description: "" },
  ];

  orderCancelledProgressList = [
    // { Index: 0, Status: "Pending", Progress: "Ordered", Description: "" },
    { Index: 0, Status: "Order Placed", Progress: "In Process", Description: "" },
    { Index: 1, Status: "Cancelled", Progress: "Finished", Description: "" }];

  ngOnInit(): void {
    this.currentOrder = this.orderProgressList.filter(f => this.order.Status === undefined || this.order.Status === "" || f.Progress === this.order.Status)[0];
    this.currentOrder.Description = this.order.modifiedOn;
    if (this.order.OrderDetails && this.order.OrderStatus)
      this.order.OrderStatus.forEach(element => {
        var orderStatus = this.orderProgressList.filter(f => element.StatusDescription === "" || f.Progress === element.StatusDescription)[0];
        orderStatus.Description = element.StatusModifiedOn;
      });

    this.orderProgressList.forEach(element => {
      if (!element.Description) {
        var desc = this.orderProgressList.filter(e => e.Index > element.Index && e.Description)[0];
        if (desc)
          element.Description = desc.Description;
      }
    });
  }
}
