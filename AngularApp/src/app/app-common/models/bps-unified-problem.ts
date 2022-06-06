export class BpsUnifiedProblem {
    ProblemId: number;
    ProblemGuid: string;
    ProblemName: string;
    ProjectId: number;
    CreatedOn: Date;
    ModifiedOn: Date;
    UnifiedModel: string;
    OrderPlaced: boolean;

    AcousticResult: boolean;
    StructuralResult: boolean;
    ThermalResult: boolean;
    EnableAcoustic: boolean;
    EnableStructural: boolean;
    EnableThermal: boolean;
}
