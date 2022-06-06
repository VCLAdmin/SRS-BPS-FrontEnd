import { BpsAcousticResult as AcousticResult } from './bps-acoustic-result';
import { UDCStructuralResult, FacadeStructuralResult, StructuralResult as StructuralResult } from './bps-structural-result';
import { ThermalResult as ThermalResult } from './bps-thermal-result';

export class AnalysisResult {
    AcousticResult: AcousticResult;
    StructuralResult: StructuralResult;
    FacadeStructuralResult: FacadeStructuralResult;
    ThermalResult: ThermalResult;

    UDCStructuralResult: UDCStructuralResult;
}
