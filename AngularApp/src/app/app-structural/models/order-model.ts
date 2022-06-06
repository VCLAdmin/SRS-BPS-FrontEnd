import { Subscription } from "rxjs";
import { BpsUnifiedModel } from "src/app/app-common/models/bps-unified-model";
import { BpsUnifiedProblem } from "src/app/app-common/models/bps-unified-problem";

export class OrderModel {
  orderPlaced: boolean = false;
  orderPlacedOn: Date;
  show_CancelOrder: boolean = true;
  /* -- Order Summary --------------------------------------------------------------- */
  /* ----------------------------------------------------------------------------------- */
  hasFullAccess: boolean = false;
  amount_Subtotal: number = 0;
  amount_Shipping: number = 0;
  // amount_Shipping1: number = 0;
  // amount_Shipping2: number = 0;
  amount_TotalBeforeTax: number = 0;
  // amount_TotalBeforeTax1: number = 0;
  // amount_TotalBeforeTax2: number = 0;
  amount_EstimatedTax: number = 0;
  // amount_EstimatedTax1: number = 0;
  // amount_EstimatedTax2: number = 0;
  amount_SchucoPartnerDiscount: number = 0;
  amount_Total: number = 0;
  minAmount_PerOrder: number = 25000;
  // amount_Total1: number = 0;
  // amount_Total2: number = 0;

  /*-- Shipping Address -- -------------------------------------------------------------------------*/
  /*------------------------------------------------------------------------------------------------*/
  show_ShippingAddressPanel: boolean = false;
  show_ShipToAddress: string = 'ADDRESS';
  valid_ShipToAddress: boolean = false;
  store_Address: StoreAddressModel;
  shipping_Address: ShippingAddressModel;
  type_ShippingMethod: string = 'TL'; //'STL'

  /*-- Disclaimer -- -------------------------------------------------------------------------------*/
  /*------------------------------------------------------------------------------------------------*/
  check_OneDisclaimer: boolean = false;
  check_TwoDisclaimer: boolean = false;
  show_Disclaimer: boolean = false;
  allow_ToPlaceOrder: boolean = false;
  /*-- Product Info -- -----------------------------------------------------------------------------*/
  /*------------------------------------------------------------------------------------------------*/
  show_ProductInfo: boolean = false;
  current_ProblemGuid: string;
  current_ProjectGuid: string;
  current_ProjectId: number;

  data_AllOrders: any[] = [];
  allProducts: BpsUnifiedProblem[] = [];
  allOrders: OrderApiModel;
}

export class ShippingAddressModel {
  Email: string;
  FirstName: string;
  LastName: string;
  PhoneNumber: string;
  Email2: string;
  Address: string;
  Apartment: string;
  PostalCode: string;
  City: string;
  State: string;
  Country: string;
  County: string;
  Lat: number;
  Lng: number;
}

export class StoreAddressModel {
  Email: string;
  PhoneNumber: string;
  Address: string;
}

export class OrderApiModel {
  OrderId: number;
  OrderExternalId: string;
  ProjectId: number;
  DealerId: number;
  DealerName: string;
  ParentOrderId: number;
  Notes: string;

  ShippingAddressId: number;
  ShippingCost: number;
  Tax: number;
  Total: number;
  Discount: number;
  DiscountPercentage: number;
  ShippingMethod: boolean;

  CreatedByName: string;
  CreatedOn: Date;
  ModifiedByName: string;
  ModifiedOn: Date;

  Line1: string;
  Line2: string;
  State: string;
  City: string;
  Country: string;
  County: string;
  Longitude: number;
  Latitude: number;
  PostalCode: string;
  AdditionalDetails: string;
  AddressType: string;
  Current_Process: string;
  Current_Status: string;
  OrderDetails: OrderDetailsApiModel[];
  OrderStatus: OrderStatusApiModel[];
  SubOrder: OrderApiModel[];
  Distance: number; // in meters
  TaxRate: number;
}

export class OrderDetailsApiModel {
  OrderDetailId: number;
  OrderDetailExternalId: number;
  OrderId: number;
  ProductId: number;
  DesignURL: string;
  JsonURL: string;
  ProposalURL: string;
  OrderDetailscol: string;
  UnitPrice: string;
  Qty: number;
  SubTotal: number;
  AdditionalDetails: string;
  OrderStatus: OrderStatusApiModel[];

  ImagePath: string;
}

export class OrderStatusApiModel {
  OrderId: number;
  StatusId: number;
  StatusCode: string;
  StatusDescription: string;
  StatusModifiedOn: Date;
  StatusModifiedBy: number;
}