export class FeatureModel{
    FeatureId: number;
    FeatureGuid: string;
    Feature: string;
    ParentId: number;
    Permission: Permission;

}
export enum Permission{
    NoAccess= 1,
    ReadOnly,
    WriteAccess,
    FullAccess
}

export enum Feature{
    Login = 1,//1
    BPSLogo,//2
    SRSLogo,//3
    LandingPageBPS,//4
    LandingPageSRS,//5
    ContactList,//6
    Migration,//7
    Home,//8
    CreateNewOrder,//9
    OrderChart,//10
    OrderList,//11
    CurrentBalance,//12
    GetDealerInfo,//13
    CreateNewProject,//14
    PhysicsTypesIntro,//15
    ProblemList,//16
    AnalysisStatus,//17
    SchucoUSALink,//18
    WindowDefaultImageV1,//19
    WindowDefaultImageV2,//20
    GetProjects,//21
    GetSRSProjects,//22
    VersionBPS,//23
    VersionSRS,//24
    Configure,//25
    Window,//26
    Facade,//27
    MyOrder,//28
    Result,//29
    Report,//30
    Operability,//31
    FacadeInsertUnitText,//32
    TiltTurn,//33
    SideHung,//34
    BottomHung,//35
    TopHung,//36
    ParallelOpening,//37
    SingleDoor,//38
    DoubleDoor,//39
    Max4VentsAllowed,//40
    Framing,//41
    AWS_75_SI_plus,//41
    AWS_75_BS_SI_plus,//42
    AWS_75_BS_HI_plus,//43
    AWS_90_SI_plus,//44
    AWS_90_BS_SI_plus,//45
    ADS_75,//46
    FWS_35_PD_SI,//47
    FWS_35_PD_HI,//48
    FWS_50_HI,//49
    FWS_50,//50
    FWS_60_SI,//51
    FWS_60_SI_Green,//52
    FWS_60_HI,//53
    FWS_60,//54
    UDC_80,//55
    UDC_80_HI,//56
    UDC_80_SI,//57
    UDC_80_SI_with_XPS_Filling,//58
    ProfileColor,//59
    HandleColor,//60
    InsideHandle,//61
    GlassPanel,//62
    GlassPanelHeader,//63
    FacadeGlassPanelHeader,//64
    GlassPanelShortInfo,//65
    GlassPanelFullInfo,//66
    GlassPanelSideTableShort,//67
    GlassPanelSideTableFull,//68
    CalculateSubTotalCost,//69
    QuickCheck,//70
    Load,//71
    Acoustic,//72
    Structural,//73
    Thermal,//74
    ReadSectionMultiCall,//75
    RunAnalysisMultiCall,//76
    Compute,//77
    Checkout,//78
    PhysicsTypes,//79
    ProductTypes,//80
    OrderingApp,//81
    AnalysisApp,//82
    SlidingDoor,//83
    SlidingUnit,//84
    Type_2A_Left,
    Type_2A_Right,
    Type_2A_1_i_Left,
    Type_2A_1_i_Right,
    Type_2D_1_i,
    Type_3E_Left,
    Type_3E_Right,
    Type_3E_1_Left,
    Type_3E_1_Right,
    Type_3F,
    ASE_60,
    ASE_80_HI,
    TripleTrackType

}
