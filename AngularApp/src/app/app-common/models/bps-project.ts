

export class BpsProject {
    ProjectId: number = 0;
    UserId: number = 0;
    ProjectName: string = '';
    ProjectGuid: string = '';
    ProjectLocation: string = '';
    // Problems: BpsProblem[] = [];
    ProblemIds: number[] = [];
    CreatedOn: Date = new Date();
    ModifiedOn: Date = new Date();
    OrderPlaced: boolean = false;
    OrderStatus: string = '';

    Line1: string = '';
    Line2: string = '';
    State: string = '';
    City: string = '';
    Country: string = '';
    County: string = '';
    Longitude: number = 0;
    Latitude: number = 0;
    PostalCode: string = '';
}
