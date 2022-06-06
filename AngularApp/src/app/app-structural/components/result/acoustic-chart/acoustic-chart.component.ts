import { Component, ElementRef, Input, NgZone, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { _ } from "@biesbjerg/ngx-translate-extract/dist/utils/utils";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_dark from "@amcharts/amcharts4/themes/dark";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { BpsUnifiedModel } from "src/app/app-common/models/bps-unified-model";
am4core.useTheme(am4themes_dark);
am4core.useTheme(am4themes_animated);

@Component({
  selector: "app-acoustic-chart",
  templateUrl: "./acoustic-chart.component.html",
  styleUrls: ["./acoustic-chart.component.css"],
})

export class AcousticChartComponent implements OnInit, OnChanges {
  @Input() ChartDataList: any[];
  @Input() unified3DModel: BpsUnifiedModel;
  private chart: am4charts.XYChart;
  baseFont = "UniversForSchueco-530Med";
  baseColor = am4core.color("#778d98");

  amChartLogo: Element;
  amChartLogoParent: HTMLInputElement;

  constructor(private zone: NgZone, private translate: TranslateService, private _elementRef: ElementRef) {
    this.amChartLogoParent = this._elementRef.nativeElement;
  }

  ngOnInit(): void { }

  ngOnChanges(Changes: SimpleChanges): void {
    if (Changes) {
      if (Changes.unified3DModel && Changes.unified3DModel.currentValue) {
        this.loadPerformanceChartInfo();
      }
    }
  }
  loadPerformanceChartInfo() {
    // Themes begin
    am4core.useTheme(am4themes_dark);
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    var chart = am4core.create("chartdiv", am4charts.XYChart);
    let colors = ["#007496", "#0084aa", "#00a2d1", "#00c0f8", "#f18700", "#696969", "#81D8D0"];

    // Export
    this.configureExportMenu(chart);
    // Data for both series
    var data = this.ChartDataList;

    chart.numberFormatter.numberFormat = "#";
    chart.maskBullets = false;
    chart.fontSize = 12;
    chart.fontFamily = this.baseFont;
    chart.tooltipContainer.fontSize = 12;

    /* Create axes */
    /* Category axis  ---------------------------------------*/
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "frequency";
    categoryAxis.title.text = this.translate.instant(_('result.frequency')) + " (Hz)";
    categoryAxis.title.fill = this.baseColor;
    categoryAxis.minX = 0;
    categoryAxis.maxX = 5000;
    categoryAxis.fontSize = 12;
    categoryAxis.fontFamily = this.baseFont;
    categoryAxis.renderer.minGridDistance = 30;
    categoryAxis.cursorTooltipEnabled = true;
    categoryAxis.renderer.fullWidthTooltip = true;
    categoryAxis.renderer.labels.template.fill = this.baseColor;
    categoryAxis.tooltip.background.fillOpacity = 0.8;
    categoryAxis.tooltip.background.cornerRadius = 5;

    /* Create value axis  ---------------------------------------*/
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    //valueAxis.logarithmic = true;
    valueAxis.title.text = this.translate.instant(_('result.sound-transmission-loss')) + " (dB)";
    valueAxis.title.fill = this.baseColor;
    valueAxis.min = 0;
    valueAxis.max = 60;
    valueAxis.strictMinMax = true;
    valueAxis.fontSize = 12;
    valueAxis.fontFamily = this.baseFont;
    valueAxis.renderer.labels.template.fill = this.baseColor;
    valueAxis.tooltip.background.fillOpacity = 0.8;
    valueAxis.tooltip.background.cornerRadius = 5;

    //lineSeries ---------------------------------------
    let tooltipFormat = "[font-family: UniversForSchueco-530Med; font-size: 10px; width: 150px]{categoryX}[/] (Hz)\n [/][font-family: UniversForSchueco-530Med; font-size: 10px; width: 150px]{valueY}[/] (dB)[/]";
    this.LineSeries(chart, 'TL', 'opening0', 'frequency', colors[4], tooltipFormat);
    // this.LineSeries(chart, '1% Opening', 'opening1', 'frequency', colors[3], tooltipFormat);
    // this.LineSeries(chart, '2% Opening', 'opening2', 'frequency', colors[2], tooltipFormat);
    // this.LineSeries(chart, '5% Opening', 'opening5', 'frequency', colors[1], tooltipFormat);
    // this.LineSeries(chart, '100% Opening', 'opening100', 'frequency', colors[0], tooltipFormat);

    /* Create series */
    this.ColumnSeries(chart, 'Deficiencies', 'deficiencies', 'frequency', colors[5], tooltipFormat);

    /* lc Dashed lines */
    //this.LineSeries(chart, 'NC', 'nc', 'frequency', colors[6], tooltipFormat, true);
    this.LineSeries(chart, 'NC', 'nc', 'frequency', colors[6], tooltipFormat, true);

    //data ---------------------------------------
    chart.data = data;

    //legend ---------------------------------------
    this.configureLegend(chart);

    //cursor ---------------------------------------
    this.configureCursor(chart, categoryAxis);

    //scrollbar Y & X ---------------------------------------
    this.configureScrollbar(chart);

    setTimeout(function () {
      this.amChartLogo = document.querySelectorAll('title[id*="id-"]');
      this.amChartLogo.forEach(element => {
        if (element.innerHTML === "Chart created using amCharts library") {
          this.amChartLogoParent = element.parentNode;
          this.amChartLogoParent.style.display = "none";
        }
      });
    }, 500);
  }
  ngAfterViewInit() {
    this.loadPerformanceChartInfo();
  }
  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }
  ColumnSeries(chart: any, name: string, valueY: string, categoryX: string, color: string, tooltipText: string): any {
    var columnSeries = chart.series.push(new am4charts.ColumnSeries());
    columnSeries.name = name;
    columnSeries.dataFields.valueY = valueY;
    columnSeries.dataFields.categoryX = categoryX;
    columnSeries.stroke = am4core.color(color);
    columnSeries.fill = am4core.color(color);
    //[#fff font-size: 12px]{name} in {categoryX}:\n[/][#fff font-size: 0px]{valueY}[/] [#fff]{additional}[/]
    //columnSeries.columns.template.tooltipText = tooltipText;
    columnSeries.columns.template.propertyFields.fillOpacity = "fillOpacity";
    columnSeries.columns.template.propertyFields.stroke = "stroke";
    columnSeries.columns.template.propertyFields.strokeWidth = "strokeWidth";
    columnSeries.columns.template.propertyFields.strokeDasharray = "columnDash";
    columnSeries.propertyFields.strokeDasharray = "lineDash";
    columnSeries.showOnInit = true;

    // Drop-shaped tooltips
    columnSeries.tooltipText = tooltipText;
    columnSeries.tooltip.background.cornerRadius = 5;
    columnSeries.tooltip.background.strokeOpacity = 0;
    columnSeries.tooltip.background.fillOpacity = 0.9;
    columnSeries.tooltip.pointerOrientation = "horizontal";
    columnSeries.tooltip.label.minWidth = 40;
    columnSeries.tooltip.label.minHeight = 20;
    columnSeries.tooltip.label.textAlign = "left";
    columnSeries.tooltip.label.textValign = "middle";

    var columnTemplate = columnSeries.columns.template;
    columnTemplate.strokeWidth = 1;
    columnTemplate.strokeOpacity = 1;
    columnTemplate.maxWidth = 20;

    let distanceState = columnSeries.columns.template.states.create("hover");
    distanceState.properties.fillOpacity = 0.9;
    return columnSeries;
  }
  LineSeries(chart: any, name: string, valueY: string, categoryX: string, color: string, tooltipText: string, dashed: boolean = false) {
    var lineSeries = chart.series.push(new am4charts.LineSeries());
    lineSeries.name = name;
    lineSeries.dataFields.valueY = valueY;
    lineSeries.dataFields.categoryX = categoryX;
    lineSeries.stroke = am4core.color(color);
    lineSeries.fill = am4core.color(color);
    lineSeries.strokeWidth = 1;
    lineSeries.propertyFields.strokeDasharray = "lineDash";
    lineSeries.showOnInit = true;
    if (dashed) {
      // lineSeries.fillOpacity = .1;
      // lineSeries.tensionX = 1;
      lineSeries.noRisers = true;
      lineSeries.strokeDasharray = "2,3";
    }

    // Drop-shaped tooltips
    lineSeries.tooltipText = tooltipText;
    lineSeries.tooltip.background.cornerRadius = 5;
    lineSeries.tooltip.background.strokeOpacity = 0;
    lineSeries.tooltip.background.fillOpacity = 0.9;
    lineSeries.tooltip.pointerOrientation = "horizontal";
    lineSeries.tooltip.label.minWidth = 40;
    lineSeries.tooltip.label.minHeight = 20;
    lineSeries.tooltip.label.textAlign = "left";
    lineSeries.tooltip.label.textValign = "middle";

    var bullet = lineSeries.bullets.push(new am4charts.Bullet());
    bullet.fill = am4core.color(color); // tooltips grab fill from parent by default
    bullet.tooltipText = tooltipText
    var circle = bullet.createChild(am4core.Circle);
    circle.radius = 3;
    circle.fill = am4core.color(color);//"#30303d"
    circle.strokeWidth = 1;
  }
  StepLineSeries(chart: any, name: string, valueY: string, categoryX: string, color: string, tooltipText: string, dashed: boolean = false) {
    // Create series
    var lineSeries = chart.series.push(new am4charts.StepLineSeries());
    lineSeries.name = name;
    lineSeries.dataFields.valueY = valueY;
    lineSeries.dataFields.categoryX = categoryX;
    lineSeries.stroke = am4core.color(color);
    lineSeries.fill = am4core.color(color);
    lineSeries.strokeWidth = 1;
    lineSeries.propertyFields.strokeDasharray = "lineDash";
    lineSeries.showOnInit = true;
    if (dashed) {
      lineSeries.fillOpacity = .1;
      lineSeries.tensionX = 1;
      lineSeries.noRisers = true;
      lineSeries.strokeDasharray = "2,2";
    }

    // Drop-shaped tooltips
    lineSeries.tooltipText = tooltipText;
    lineSeries.tooltip.background.cornerRadius = 5;
    lineSeries.tooltip.background.strokeOpacity = 0;
    lineSeries.tooltip.background.fillOpacity = 0.9;
    lineSeries.tooltip.pointerOrientation = "horizontal";
    lineSeries.tooltip.label.minWidth = 40;
    lineSeries.tooltip.label.minHeight = 20;
    lineSeries.tooltip.label.textAlign = "left";
    lineSeries.tooltip.label.textValign = "middle";

    var bullet = lineSeries.bullets.push(new am4charts.Bullet());
    bullet.fill = am4core.color(color); // tooltips grab fill from parent by default
    bullet.tooltipText = tooltipText
    var circle = bullet.createChild(am4core.Circle);
    circle.radius = 3;
    circle.fill = am4core.color(color);//"#30303d"
    circle.strokeWidth = 1;
  }
  configure_(chart: any) {
  }
  configureExportMenu(chart: any) {
    //https://www.amcharts.com/docs/v4/concepts/exporting/
    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.menu.align = "right";
    chart.exporting.menu.verticalAlign = "top";
    chart.exporting.menu.items = [
      {
        "label": "&#8681;",
        "menu": [
          { "type": "jpg", "label": "Jpeg" },
          { "type": "xlsx", "label": "Xlsx" },
          { "type": "print", "label": "PDF" }
        ]
      }
    ];
  }
  configureLegend(chart: any) {
    chart.legend = new am4charts.Legend();
    chart.legend.labels.template.text = "[bold {color}]{name}[/]";
    chart.legend.fontSize = 13;
    chart.legend.fontFamily = this.baseFont;
    chart.legend.labels.template.fill = am4core.color('#778d98');
    chart.legend.valueLabels.template.fill = am4core.color('#778d98');
  }
  configureCursor(chart: any, xAxis: any) {
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.fullWidthLineX = true;
    chart.cursor.xAxis = xAxis;
    chart.cursor.lineX.strokeOpacity = 0;
    chart.cursor.lineX.fill = this.baseColor;
    chart.cursor.lineX.fillOpacity = 0.1;
  }
  configureScrollbar(chart: any) {
    // Create vertical scrollbar and place it before the value axis
    // chart.scrollbarY = new am4core.Scrollbar();
    // chart.scrollbarY.toBack();
    // var scrollbarX = new am4core.Scrollbar();
    // scrollbarX.marginBottom = 20;
    // scrollbarX.marginRight = 20;
    // chart.scrollbarX = scrollbarX;

    // Create a horizontal scrollbar with previe and place it underneath the date axis
    // chart.scrollbarX = new am4charts.XYChartScrollbar();
    // chart.scrollbarX.s series.push(series);
    // chart.scrollbarX.parent = chart.bottomAxesContainer;
    // valueAxis.start = 0.79;
    // valueAxis.keepSelection = true;
  }
}