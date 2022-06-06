import { AnalysisResult } from './analysis-result';

export class ProblemSetting {
    //for bps
    UserGuid: string;         // userGuid in database user table
    ProjectGuid: string;
    ProblemGuid: string;      // project in database project table
    EnableAcoustic: boolean = false;
    EnableStructural: boolean = false;
    EnableThermal: boolean = false;

    // for physics core
    ProductType: string = "Window";
    FacadeType: string;
    ProjectName: string;
    Location: string;
    ConfigurationName: string;
    UserNotes: string;
    // OrderPlaced: boolean;
    // OrderPlacedOn: Date;
    Client: string;              
    ProjectNumber: string;        
    LastModifiedDate: string; 
    DrawingNames: string[]; 
    // for UI only
    isAcousticEnabled: boolean = false;
    SlidingDoorType: string;
}
export class UserSetting {
    Language: string;
    UserName: string;
    //Client: string;
    ApplicationType: string;
    //UserDisplayName: string;
    //UserNotes: string;
    UserAccessRole: string;
}
export class FrameSystem {
    SystemType: string;
    UvalueType: string;
    InsulationType: string;
    InsulatingBarDataNote: string;
    InsulationMaterial: string;
    Alloys: string;
    xNumberOfPanels: number = 3;
    yNumberOfPanels: number = 2;
     // for facade only
    MajorMullionTopRecess: number;            //UnifiedInputVersion2.0. For SRS.
    MajorMullionBottomRecess: number;  
    
    //for UDC only
    VerticalJointWidth: number;
    HorizontalJointWidth: number;
    //Remove this for next release. Due to some issue in UI we are using below property
    InsulationZone: string;

    // added for SRS
    AluminumFinish: string;
    AluminumColor: string;
    //WeatherTightness: string;
}
export class Point {
    PointID: number;
    X: number;
    Y: number;
}
export class Member {
    MemberID: number;
    PointA: number;
    PointB: number;
    SectionID: number;
    MemberType: number; // same as SectionType. 1: Outer Frame, 2: Mullion, 3: transom
    Length_cm: number;
    TributaryArea: number;
    TributaryAreaFactor: number;
    Cp: number;

}
export class Infill {
    InfillID: number;
    BoundingMembers: number[];                 // follow this: [left, top, right, bottom]
    GlazingSystemID: number;                   // -1 if the type is panel
    PanelSystemID: number;                     // Facade. -1 if the type is glass
    //JunctionType: number;                    // Facade. Facade Only.
    OperabilitySystemID: number;
    
    BlockDistance: number;
    // VentArticleName: string;                   // -1 if we don't have any operabiltity for that particular glass
    //VentArticleID: number;                   // -1 if we don't have any operabiltity for that particular glass
    // VentInsideW: number;                       //-1 if we don't have any operabiltity for that particular glass
    // VentOutsideW: number;                      //-1  if we don't have any operabiltity for that particular glass
    // VentDistBetweenIsoBars: number;
    // JunctionType: number;
    // InsertedWindowType: string;
    VentWeight: number;
    LockingPointOption: number;
    HandlePosition: number;  

    InsertOuterFrameDepth: number;       // Angular Use Only - Facade Only. read from database Article table; -1 if we don't have any operabiltity for that particular glass
    InsertWindowSystem: string;
    InsertWindowSystemType: string;            // Facade Only. Window System Types
    //InsertWindowSystem: string;              // Facade Only

    // InsertOuterFrameArticleName: string;       // Facade Only. -1 if we don't have any operabiltity for that particular glass
    // InsertOuterFrameInsideW: number;           // Facade Only. read from database Article table; -1 if we don't have any operabiltity for that particular glass
    //  InsertOuterFrameOutsideW: number;          // Facade Only. read from database Article table; -1 if we don't have any operabiltity for that particular glass
    //  InsertOuterFrameDistBetweenIsoBars: number;// Facade Only. read from database Article table; -1 if we don't have any operabiltity for that particular glass
               

    UvalueType: string;                        // Facade Thermal: for inserted window
    InsulationType: string;                    // Facade Thermal: for inserted window, PA or PT
    // VentOpeningDirection: string;              //1. Inward, 2: Outward
    // VentOperableType: string;                  // 1. Tilt-Turn, 2: Side-Hung...
    // for solver internal use
    centerX: number;
    centerY: number;
    // InsertUvalueType: string;                  //for insert unit only
    //  InsertInsulationType: string;              //for insert unit only
    // InsertInsulationTypeName: string;          //for insert unit only

    // added variables for SRS

    GlazingBeadProfileArticleName: string;
    GlazingGasketArticleName: string;
    GlazingRebateGasketArticleName: string;
    GlazingRebateInsulationArticleName: string;

}
export class Plate {
    Material: string;
    H: number;
    InterH: number = 0;
    InterMaterial: string;
    UDF1: string;
}
export class Cavity {
    Lz: number;
    CavityType: string;
}
export class GlazingSystem {
    Manufacturer: string = "Vitro Architectural Glass";
    BrandName: string;
    GlazingSystemID: number;
    Rw: number;
    UValue: number;
    SpacerType: number;
    Description: string;
    Plates: Plate[];
    Cavities: Cavity[];
    Category: string;

    //for local use DOMMatrixReadOnly.
    //IsDefault: boolean;

    //for SRS
    Color: string;
    SHGC: number;
    VT: number;
    STC: number;
    OITC: number;
    RwC: number;
    RwCtr: number;
    PSIValue: number;
}
export class PanelSystem {
    PanelSystemID: number;
    PanelID: number;               // For Facade Only, from 1-10.
    Rw: number;
    UValue: number;
    PanelType: number;             // Panel Type 1, 2, 3, 4 based on EN ISO 12631
    Description: string;
    Plates: Plate[];
    Cavities: Cavity[];
    Thickness: number;
    Psi: number;
}
export class Section {
    SectionID: number;              // = 1,2,3 , SectionID and SectionType is same
    SectionType: number;            // same as MemberType. 1: Outer Frame, 2: Mullion, 3: transom, 4: FacadeMajorMullion, 5: FacadeTransom, 6: FacadeMinorMullion
    ArticleName: string;
    isCustomProfile: boolean;       // is custom profile
    InsideW: any;                   // number or string for '--' inward
    OutsideW: any;
    LeftRebate: number;
    RightRebate: number;
    DistBetweenIsoBars: number;
    d: number;                      // custom article parameters. from d to alpha.
    Weight: number;
    Ao: number;
    Au: number;
    Io: number;
    Iu: number;
    Ioyy: number;
    Iuyy: number;

    Zoo: number;
    Zuo: number;
    Zou: number;
    Zuu: number;
    Zol: number;                    // width left to center line, top part
    Zul: number;                    // width left to center line, bottom part
    Zor: number;                    // width right to center line, top part
    Zur: number;                    // width right to center line, bottom part

    RSn20: number;
    RSp80: number;
    RTn20: number;
    RTp80: number;
    Cn20: number;
    Cp20: number;
    Cp80: number;
    beta: number;                   // Optional, for future use
    A2: number;                     // Optional, for future use
    E: number;                      // Optional, for future use
    alpha: number;                  // Optional, for future use

    // Woyp: number;
    // Woyn: number;
    // Wozp: number;
    // Wozn: number;
    // Wuyp: number;
    // Wuyn: number;
    // Wuzp: number;
    // Wuzn: number;

    gammaM: number;

    Name: any;
    Description: any;
    InsideDimension: any;
    OutsideDimension: any;

    //for insert unit only - ANGULAR
    Depth: any;
}

export class FacadeSection {
    SectionID: number;              // = 1,2,3 , SectionID and SectionType is same
    SectionType: number;            // same as MemberType. 1: Outer Frame, 2: Mullion, 3: transom
    // 21:UDC Top Frame; 22: UDC Vertical Frame;  23: UDC Bottom Frame; 24: UDC Vertical Glazing Bar; 25: UDC Horizontal Glazing Bar;
    ArticleName: string;
    OutsideW: number;               // for display in pdf only
    BTDepth: number;
    A: number;                      //Area
    Iyy: number;                    //Moment of inertia for bending about the y-axis 
    Izz: number;                    //Moment of inertia for bending about the z-axis
    Asy: number;                    //Shear area in y-direction
    Asz: number;                    //Shear area in z-direction
    J: number;                      //Torsional constant
    E: number;                      //Young's modulus
    G: number;                      //Torsional shear modulus
    // // Density: number;          //Material Density
    EA: number;                     //Derived EA
    GAsy: number;                   //Derived GA
    GAsz: number;                   //Derived GA
    EIy: number;                    //Derived EIy
    EIz: number;                    //Derived EIz
    GJ: number;                     //Derived GJ
    Width: number;
    Zo: number;
    Zu: number;
    Zl: number;
    Zr: number;
    Material: string;
    beta: number;
    Weight: number;
    Wyy: number;
    Wzz: number;

    //for insert unit only - ANGULAR
    Depth: any;
    Name: any;
    Description: any;
    transomArticleId: any;
    isCustomProfile: boolean;       // is custom profile

    Ys: number;
    Zs: number;
    Ry: number;
    Rz: number;
    Wyp: number;
    Wyn: number;
    Wzp: number;
    Wzn: number;
    Cw: number;
    Beta_torsion: number;
    Zy: number;
    Zz: number;
    ReinforcementEIy: number;
    ReinforcementEIz: number;
    ReinforcementWeight: number;


}
export class SlabAnchor {
    SlabAnchorID: number;
    MemberID: number;
    AnchorType: string;           // "Fixed" or "Sliding"
    Y: number;
    X: number;
}

export class Reinforcement {
    ReinforcementID: number;
    MemberID: number;
    sectionID: number;
}

export class SpliceJoint {
    SpliceJointID: number;
    MemberID: number;
    JointType: string;           // "Hinged" or "Rigid"
    Y: number;
    X: number;
}
export class Geometry {
    Points: Point[];
    Members: Member[];
    Infills: Infill[];    
    GlazingSystems: GlazingSystem[];
    PanelSystems: PanelSystem[];
    OperabilitySystems: OperabilitySystem[];    
    DoorSystems: DoorSystem[];
    SlidingDoorSystems: SlidingDoorSystem[];
    SlabAnchors: SlabAnchor[];
    SpliceJoints: SpliceJoint[];
    Reinforcements: Reinforcement[];
    Sections: Section[];
    FacadeSections: FacadeSection[];

    //Internal User only
    CustomGlass: CustomGlass[];
}
export class Acoustic {
    WallType: number;
    Height: number;
    Width: number;
    RoomArea: number;
}
export class DinWindLoadInput {
    WindZone: number;               //WIND ZONE
    TerrainCategory: number;        //TERRAIN CATEGORY
    L0: number;                     //BUILDING WIDTH
    B0: number;                     //BUILDING DEPTH
    h: number;                      //BUILDING HEIGHT
    ElvW: number;                   //WINDOW ELEVATION
    WindowZone: number;             //WINDOW ZONE
    IncludeCpi: boolean = false;        // whether to include Cpi when calculate Cp
    pCpi: number;                 // user positive Cpi, added 2021.09.03
    nCpi: number;                 // user negative Cpi, added 2021.09.03
    RequestDescription: boolean;    //POSTCODE
    PostCodeValue: string;
}
export class LoadFactor {
    DeadLoadFactor: number;
    WindLoadFactor: number;
    HorizontalLiveLoadFactor: number;
    TemperatureLoadFactor: number;
}
export class SeasonFactor {
    SummerFactor: number;
    WinterFactor: number;
}
export class TempChange {
    Summer: number;
    Winter: number;
}
export class FacadeBC {
    PointIDs: number[];
    RestrainedDOFs: number[];           // RestainedDOF in global coordinate [1,2,3,4,5,6]
}
export class Structural {
    DispIndexType: number;              // 1 - User Defined, 2 - DIN EN 14351-1-2016 Class B, 3 - DIN EN 14351-1-2016 Class C, 4 - DIN EN 13830:2003, 5 - DIN EN 13830:2015/2020, 6 - US Standard
    DispHorizontalIndex: number;        // user specified displacement index, >0
    DispVerticalIndex: number;
    WindLoadInputType: number;          // 1 - user defined, 2 - DIN code
    dinWindLoadInput: DinWindLoadInput; // input for wind load calculation, ignored when WindLoadInputType =1;
    WindLoad: number = 0.96;            // user defined wind pressure, ignored when WindLoadInputType =2;
    HorizontalLiveLoad: number = 0;     // kN/m
    //HorizontalLiveLoadFactor: number = 0;
    HorizontalLiveLoadHeight: number = 0; // mm
    //Alloys: string;
    // FacadeBCs: string;
    LoadFactor: LoadFactor;
    SeasonFactor: SeasonFactor;
    TemperatureChange: TempChange;
    Cpp: number = 0;        //PRESSURE
    Cpn: number = 0;        //SUCTION
    Cp: number;

    //internal use only - angular
    ShowBoundaryCondition: boolean = false;
    ShowWindPressure: boolean = false;
    PositiveWindPressure: string;
    NegativeWindPressure: string;
    PostCodeValue: string;
}

export class Thermal {
    RelativeHumidity: number;
    InsulationZone: string;
}
export class ModelInput {
    //ProjectName: string;
    //Location: string;
    //ConfigurationName: string;
    FrameSystem: FrameSystem;
    Geometry: Geometry;
    Acoustic: Acoustic;
    Structural: Structural;
    Thermal: Thermal;
    SRSExtendedData: SRSExtendedData;
}

export class BpsUnifiedModel {
    UserSetting: UserSetting;
    ProblemSetting: ProblemSetting = new ProblemSetting();
    SRSProblemSetting: SRSProblemSetting = new SRSProblemSetting();
    UnifiedModelVersion: string;  //added 2021.08.31
    ModelInput: ModelInput;
    //for insert unit only - ANGULAR
    AnalysisResult: AnalysisResult;
    CollapsedPanels: CollapsedPanelStatus = new CollapsedPanelStatus();
}

export class CollapsedPanelStatus {
    LastModifiedDateForUM: Date = null;
    
    IsValid_Configure: boolean = false;
    Panel_Configure: boolean = false;
    
    IsValid_Operability: boolean = false;
    Panel_Operability: boolean = false;
        Panel_Operability_OuterFrame: boolean = false;
        Panel_Operability_VentFrame: boolean = false;
        Panel_Operability_HandleColor: boolean = false;

    IsValid_SlidingUnit: boolean = false;
    Panel_SlidingUnit: boolean = false;
    
    IsValid_Framing: boolean = false;
    Panel_Framing: boolean = false;
        Panel_Framing_MullionDepth: boolean = false;
        Panel_Framing_TransomDepth: boolean = false;
        Panel_Framing_IntMullionDepth: boolean = false;
        Panel_Framing_IntTransomDepth: boolean = false;
        Panel_Framing_Reinforcement: boolean = false;
        Panel_Framing_Custom: boolean = false;
    
    IsValid_Glass: boolean = false;
    Panel_Glass: boolean = false;
        Panel_Glass_Library: boolean = false;
        Panel_Glass_Library_Custom: boolean = false;
        Panel_Glass_Spacer: boolean = false;

    IsValid_Acoustic: boolean = false;
    Panel_Acoustic: boolean = false;
    
    IsValid_Structural: boolean = false;
    Panel_Structural: boolean = false;
        Panel_Structural_WindLoad: boolean = false;
        Panel_Structural_ProfileColor: boolean = false;
    
    IsValid_Thermal: boolean = false;
    Panel_Thermal: boolean = false;

    IsValid_Load: boolean = false;
    Panel_Load: boolean = false;

    IsAllowed_Compile: boolean = false; //Compute or CheckOut
}
export class CustomGlass {
    customGlassID: number;
    selectedType: string;
    name: string;
    element_xx_1: string;
    element_type_1: string;
    element_size_1: string;
    element_interlayer_1: string;

    element_ins_type_1: string;
    element_ins_size_1: string;

    element_xx_2: string;
    element_type_2: string;
    element_size_2: string;
    element_interlayer_2: string;

    element_ins_type_2: string;
    element_ins_size_2: string;

    element_xx_3: string;
    element_type_3: string;
    element_size_3: string;
    element_interlayer_3: string;

    uValue: string;
    glassrw: string;
}

// new classes added for SRS
export class DoorSystem {
    DoorSystemID: number;
    DoorSystemType: string;
    DoorSillArticleName: string; //Sill Profile Bottom
    DoorLeafArticleName: string;
    DoorPassiveJambArticleName: string;
    DoorThresholdArticleName: string;
    //
    DoorSillInsideW: number;                  //added 2021.08.31   Sill Profile Bottom InsideW
    DoorSillOutsideW: number;                 //added 2021.08.31    Sill Profile Bottom OutsideW
    DoorLeafInsideW: number;                  //added 2021.08.31
    DoorLeafOutsideW: number;                 //added 2021.08.31
    DoorPassiveJambInsideW: number;           //added 2021.08.31
    DoorPassiveJambOutsideW: number;           //added 2021.08.31
    DoorSidelightSillArticleName: string;  // Sill Profile Fixed Panel
    OutsideHandleArticleName: string; 
    OutsideHandleColor: string;
    OutsideHandleArticleDescription: string;  // Angular Use only  
    InsideHandleArticleName: string;
    InsideHandleColor: string;
    InsideHandleArticleDescription: string;  // Angular Use only
    HingeCondition: number;
    HingeArticleName: string;
    HingeArticleDescription: string;  //Angular Use only
    HingeColor: string;
    // DoorOpeningDirection: string;
    // DoorOperableType: string;
}

export class SlidingDoorSystem {
    SlidingDoorSystemID: number;             //Added 2022.02.01
    InsideHandleArticleName: string;        //Added 2022.02.01
    InsideHandleColor: string;              //Added 2022.02.01
    OutsideHandleArticleName: string;       //Added 2022.02.01
    OutsideHandleColor: string;             //Added 2022.02.01
    SlidingDoorSystemType: string;          //Added 2022.02.01, for BPS 4.0/SRS 3.0 will be either ASE 60 or ASE 80.HI
    SlidingOperabilityType: string;             //Added 2022.02.01, can be "Lift-and-slide" or "Sliding", but for BPS 4.0/SRS 3.0 it will only be "Lift-and-slide"
    SlidingVentSectionID: number;            //Added 2022.02.01
    SlidingVentInterlockSectionID: number;   //Added 2022.02.01
    InterlockReinforcement: Boolean;         //Added 2022.02.01, user sets as true or false to toggle external reinforcement on interlocks
    SteelTubeArticleName: string;               //Added 2022.02.22, if InterlockReinforcement is set to 'true,' this string will list article number for said reinforcement. Otherwise, string is null.
    StructuralProfileArticleName: string;   //Added 2022.02.22, this article is not assigned by user, but is rather required with double spilt ASE vent profiles (the kind used in SRS 3.0 release). 
    DoubleVentArticleName: string;          //Added 2022.02.22, this article is not assigned by user, but is required for Type 2D/1.i in SRS 3.0 release, as well as Type 3F in BPS 4.0 release (i.e. any Type that has a double vent interlock at middle)
    VentFrames: VentFrame[]; 
    MovingVent: string;  
    SlidingDoorType: string;
}

export class VentFrame {                    //Added 2022.02.01
    VentFrameID: number;                    //Added 2022.02.01
    Width: number;                          //Added 2022.02.01
    Type: string;                           //Added 2022.02.01, can be either "Fixed" or "Sliding" depending on Sliding Door configuration
    Track: number;                          //Added 2022.02.01, Tracks counted 1 up to 3 depending on configuration, with 1 most outward and 3 most inward track
}

export class OperabilitySystem {
    OperabilitySystemID: number;
    DoorSystemID: number;
    SlidingDoorSystemID: number;
    VentArticleName: string;
    VentInsideW: number;
    VentOutsideW: number;
    VentDistBetweenIsoBars: number;
    JunctionType: number;
    InsertedWindowType: string;
    InsertOuterFrameArticleName: string;
    InsertOuterFrameInsideW: number;
    InsertOuterFrameOutsideW: number;
    InsertOuterFrameDistBetweenIsoBars: number;
    InsertUvalueType: string;
    InsertInsulationType: string;
    InsertInsulationTypeName: string;
    VentOpeningDirection: string;
    VentOperableType: string;
    RebateGasketArticleName: string;
    CenterGasketArticleName: string;
    InsideHandleArticleName: string;
    InsideHandleArticleDescription: string;  // Angular Use only
    InsideHandleColor: string;
    // HandlePosition: number;
    // HandleColor: string;
    PickerIndex: number; // Angular Use only
}
export class SRSProblemSetting {
    isOrderPlaced: boolean;
    OrderNumber: string;
    SubTotal: number;
    Quantity: number;
    
    Client: string;
    ProjectNumber: string;
    LastModifiedDate: string;
    DrawingNames: string[];
    QuickCheckPassed: boolean = true; //true means no warning.
}
export class SRSExtendedData {
    Hardwares: Hardware[];
    MachiningInfo: MachiningInfo = new MachiningInfo();
}
export class Hardware {
    HardwareID: number;
    HardwareAlloy: string;
    HardwareFy: number;
    HardwareFu: number;
    HardwareFinishes: string;
}
export class MachiningInfo {
    GlueHoleOffsetsfromLeftTopCorner: number;
    NailHoleOffsetsfromLeftTopCorner: number;
}
