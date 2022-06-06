import { Point } from './bps-unified-model';

export class FrameSeg{
    FrameSegID: number;
    PointA: { X: number, Y: number};
    PointB: { X: number, Y: number};
    ArticleCombo: string;
}
export class ThermalFrame {
    FrameSegs :FrameSeg[];
    Area: number;
    Uf: number;
    UfNote: any;
    //HeatLoss: number; //??
    ThermalFrameID: number;
}
export class ThermalUIGlass{
    GlassID: number[];
    Ug: number;
    Area: number;
}
export class ThermalUIGlassEdge{
    GlassID: number[];
    Psi: number;
    Length: number;
}

export class ThermalFacadeMember
{
    FrameSegs: FrameSegment[];
    ArticleID: string;
    Area: number;
    Uf: number;
    HeatLoss: number;
    FacadeFrameID: number;
    Width: number;
}
export class ThermalUIFacadeGlassEdge
{
    GlassID: number[];
    PsiH: number;
    PsiV: number;
    LengthH: number;
    LengthV: number;
}

export class FrameSegment
{
    FrameSegID: number;
    PointA: Point;
    PointB: Point;
    ArticleCombo: string;
}

export class ThermalUIPanel
{
    GlassID: number[];
    Up: number;
    Area: number;
}
export class ThermalUIPanelEdge
{
    GlassID: number[];
    Psi: number;
    Length: number;
}

export class ThermalGlassEdge
{
    GlassID: number;
    Psi: number;
    Length: number;
}
export class ThermalUIInsertUnitFrameEdge
{
    GlassID: number[];
    Psi: number;
    Length: number;
}

export class ThermalGlass
{
    GlassID: number;
    Ug: number;
    Area: number;
}
export class ThermalPanel{
    GlassID: number;
    Up: number;
    Area: number; 
}
export class ThermalPanelEdge
{
    GlassID: number;
    PanelDiscript: string;
    Psi: number;
    Length: number;
    HeatLoss: number;
}
export class ThermalInsertUnitFrame{
    GlassID: number;
    ArticleIDCombo: string;
    Uf: number;
    Area: number; 
}
export class GlassGeometricInfo{
    GlassID: number;
    PointCoordinates: number[];
    CornerCoordinates: number[];
    VentCoordinates: number[];
    InsertOuterFrameCoordinates: number[];
    VentOpeningDirection: string;
    VentOperableType: string;
}
export class ThermalOutput{
    ThermalFrames: ThermalFrame[];
    ThermalFacadeMembers: ThermalFacadeMember[];
    ThermalUIFacadeGlassEdges: ThermalUIFacadeGlassEdge[];
    ThermalUIGlasses: ThermalUIGlass[];
    ThermalUIGlassEdges: ThermalUIGlassEdge[];  
    ThermalUIPanels: ThermalUIPanel[];
    ThermalUIPanelEdges: ThermalUIPanelEdge[];
    ThermalUIInsertUnitFrameEdges: ThermalUIInsertUnitFrameEdge[];
    ThermalUIInsertUnitGlasses: ThermalGlass[];
    ThermalUIInsertUnitPanels: ThermalPanel[];
    ThermalUIInsertUnitGlassEdges: ThermalGlassEdge[];
    ThermalUIInsertUnitPanelEdges : ThermalPanelEdge[];
    ThermalUIInsertUnitFrames: ThermalInsertUnitFrame[];
    GlassGeometricInfos: GlassGeometricInfo[];
    TotalArea: number;
    TotalUw: number;
}
export class ThermalResult {
    ThermalUIResult: ThermalOutput;
    reportFileUrl: string;
}
