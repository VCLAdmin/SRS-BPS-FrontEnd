export class FabricatorModel {
    FabricatorId: number = 0;
    Name: string = '';
    FabricatorGuid: string = '';
    PrimaryContactName: string = '';
    PrimaryContactEmail: string = '';
    PrimaryContactPhone: string = '';

    Line1: string = '';
    Line2: string = '';
    City: string = '';
    PostalCode: string = '';
    State: string = '';
    latitude: number;
    longitude: number;

    SupportsAWS: number;
    SupportsADS: number;
    SupportsASS: number;
}
