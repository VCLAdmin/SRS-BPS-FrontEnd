import { FabricatorModel } from "./fabricator-model";

export class DealerModel {
    OrderId: number;
    DealerId: number;
    DealerGuid: string;
    Name: string;
    PrimaryContactName: string;
    PrimaryContactEmail: string;
    PrimaryContactPhone: string;
    CreditLine: number;
    DefaultSalesTax: number;

    AWSFabricatorId: number = 0;
    ADSFabricatorId: number = 0;
    ASSFabricatorId: number = 0;
    ASSFabricator: FabricatorModel;
    ADSFabricator: FabricatorModel;
    AWSFabricator: FabricatorModel;

    Line1: string;
    Line2: string;
    State: string;
    City: string;
    PostalCode: string;
    latitude: number;
    longitude: number;
    Country: string;
    County: string;

    CreditUsed: number;
}
