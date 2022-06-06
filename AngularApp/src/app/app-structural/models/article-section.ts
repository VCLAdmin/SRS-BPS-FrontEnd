export class ArticleSection {
    Id: string;
    ArticleName: string;
    InsideW: string;
    OutsideW: string;
    Depth: string;
    DistBetweenIsoBars: any;
    Disabled: boolean;
    IsCustomRow: boolean;
    constructor(Id, ArticleName, InsideW, OutsideW, DistBetweenIsoBars, Depth, Disabled, IsCustomRow) {
        this.Id = Id.toString();
        this.ArticleName = ArticleName.toString();
        this.InsideW = InsideW.toString();
        this.OutsideW = OutsideW.toString();
        this.Depth = Depth.toString();
        this.DistBetweenIsoBars = DistBetweenIsoBars;
        this.Disabled = Disabled;
        this.IsCustomRow = IsCustomRow;
    }
}
