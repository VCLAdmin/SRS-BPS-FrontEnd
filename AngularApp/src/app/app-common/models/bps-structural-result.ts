export class StructuralMemberResult {
    memberID: number;
    deflectionRatio: number;
    verticalDeflectionRatio: number;
    stressRatio: number;
    shearRatio: number;
    windLoadCapacity: number;
}

export class StructuralResult {
    MemberResults: StructuralMemberResult[];
    reportFileUrl: string;
    summaryFileUrl: string;
    errorMessage: string;
    windLoadCapacity: number;
}

export class FacadeStructuralMemberResult {
    memberID: number;
    outofplaneBendingCapacityRatio: number;
    outofplaneReinfBendingCapacityRatio: number;
    inplaneBendingCapacityRatio: number;
    outofplaneDeflectionCapacityRatio: number;
    inplaneDeflectionCapacityRatio: number;
    combinedStressRatio: number;
}
export class FacadeStructuralResult {
    MemberResults: FacadeStructuralMemberResult[];
    reportFileUrl: string;
    summaryFileUrl: string;
    errorMessage: string;
}

export class UDCStructuralMemberResult {
    memberID: number;
    outofplaneBendingCapacityRatio: number;
    inplaneBendingCapacityRatio: number;
    outofplaneDeflectionCapacityRatio: number;
    inplaneDeflectionCapacityRatio: number;
}
export class UDCStructuralResult {
    MemberResults: UDCStructuralMemberResult[];
    reportFileUrl: string;
    summaryFileUrl: string;
}
