export class LossDistributionPoint{
    Frequency: number;
    Tau: number;
    STL: number;
}

export class Classification {
    STC: number;
    OITC: number;
    Rw: number;
    C: number;
    Ctr: number;
    NC: number[];
    Deficiencies: number[];
}

export class AcousticUIOutput{
    classification: Classification;
    LossDistributions: LossDistributionPoint[] | any;
    TotalRw: number;
}
export class BpsAcousticResult {
    AcousticUIOutput: AcousticUIOutput;
    reportFileUrl: string;
}
