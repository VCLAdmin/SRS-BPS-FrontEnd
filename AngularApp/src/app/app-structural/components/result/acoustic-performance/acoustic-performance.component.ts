import { Component, OnInit, ViewChild, AfterViewInit, Input, ElementRef, SimpleChanges, OnChanges } from '@angular/core';
import { ResultService } from 'src/app/app-structural/services/result.service';
import * as math from 'mathjs';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { _ } from '@biesbjerg/ngx-translate-extract/dist/utils/utils';
import { BpsUnifiedModel } from 'src/app/app-common/models/bps-unified-model';

@Component({
  selector: 'app-acoustic-performance',
  templateUrl: './acoustic-performance.component.html',
  styleUrls: ['./acoustic-performance.component.css']
})
export class AcousticPerformanceComponent implements OnInit, AfterViewInit, OnChanges {

  @ViewChild('audioVisualizer') canvas: ElementRef;
  @Input() unified3DModel: BpsUnifiedModel;
  selectedAudio: string = 'plane';
  audioPercentage: number = 0;
  // isPlayingAudio: boolean = false;
  activeTab: string = 'RwRes'; //Chart, Table
  radioValueA_hovered: boolean = true;
  radioValueB_hovered: boolean = false;
  radioValueC_hovered: boolean = false;
  showTable: boolean = false;
  // audio: HTMLAudioElement = new Audio();

  audioUrls = { plane: "assets/Audio/plane.mp3", road: "assets/Audio/road.mp3", train: "assets/Audio/train.mp3" };
  Gain = Array.from(Array(21), () => 0);
  frequency = [50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000];
  xAxisTicks: any[] = [];
  selectedWindowOpening = 0;
  // this.selectedAudio = this.audioUrls.plane;
  context = null;
  lowshelfFilter = null;
  highshelfFilter = null;
  biquadFilter = new Array(21);
  biquadFilterMag = [];
  source = null;
  analyser = null;
  preAnalyser = null;
  playing: boolean = false;
  column = 0;
  yAxisLabelRight = '';
  animationFrameCount = 0;
  playText: string = this.translate.instant(_('result.play'));
  stopText: string = this.translate.instant(_('result.stop'));
  
  constructor(private resultService: ResultService, private translate: TranslateService) {
    this.legendText = this.translate.instant(_('result.legend'));
  }
  selectedIndex = 0;

  ngOnInit(): void {
    this.loadPerformanceInfo();
  }

  loadPerformanceInfo(): void {
    this.yAxisLabel = this.translate.instant(_('result.sound-transmission-loss')) + " (dB)";
    this.yAxisLabel2 = 'Deficiencies';
    this.yAxisLabelRight = this.translate.instant(_('result.sound-transmission-loss')) + " (dB)";
    this.chartData = [
      { name: "0% " + this.translate.instant(_('result.opening')), series: [] },
      { name: "1% " + this.translate.instant(_('result.opening')), series: [] },
      { name: "2% " + this.translate.instant(_('result.opening')), series: [] },
      { name: "5% " + this.translate.instant(_('result.opening')), series: [] },
      { name: "100% " + this.translate.instant(_('result.opening')), series: [] }
    ];
    this.xAxisLabel = this.translate.instant(_('result.frequency')) + " (Hz)";
    this.frequency.forEach(element => {
      this.xAxisTicks.push(Math.log10(element));
    });
    if (this.unified3DModel && this.unified3DModel.AnalysisResult && this.unified3DModel.AnalysisResult.AcousticResult) {
      this.onClickChangeAudioSelection();
      this.updateFilter();
      this.setData(this.unified3DModel.AnalysisResult.AcousticResult.AcousticUIOutput);
    }
    // this.acousticAnalysisSubscription = this.resultService.acousticResultSubject.subscribe((data)=>{
    //   this.unified3DModel = data;
    //   this.onClickChangeAudioSelection();
    //   this.updateFilter();
    // });

  }
  ngOnChanges(Changes: SimpleChanges): void {
    if (Changes) {
      if (Changes.unified3DModel && Changes.unified3DModel.currentValue) {
        this.loadPerformanceInfo();
      }
    }
  }
  // closeTab({ index }: { index: number }): void {
  //   this.tabs.splice(index, 1);
  // }

  ngAfterViewInit() { }

  ngOnDestroy() {
    this.stopAudio();
  }

  updateSelectedWindowOpening() {
    switch (this.audioPercentage) {
      case 0:
        this.selectedWindowOpening = 0;
        break;
      case 25:
        this.selectedWindowOpening = 1;
        break;
      case 50:
        this.selectedWindowOpening = 2;
        break;
      case 75:
        this.selectedWindowOpening = 5;
        break;
      case 100:
        this.selectedWindowOpening = 100;
        break;
      default:
        this.selectedWindowOpening = 0;
        break;
    }
    this.updateFilter();
  }

  onClickPlayAudio(): void {
    if (this.playing) {
      this.stopAudio();
    } else {
      this.playAudio();
    }

  }

  stopAudio() {
    if (this.context) {
      this.context.suspend();
      this.playing = false;
    }
  }

  playAudio() {
    // window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.AudioContext = window.AudioContext;
    this.playing = true;
    var request = new XMLHttpRequest();
    request.open('GET', this.audioUrls[this.selectedAudio], true);
    request.responseType = 'arraybuffer';
    let that = this;

    // Decode asynchronously
    request.onload = function () {
      that.context.decodeAudioData(request.response, (buffer) => {
        if (!that.source.buffer) {
          that.source.buffer = buffer;
          that.source.start();
        }
        if (that.context.state === 'suspended') {
          that.context.resume();
        }
        that.drawTimeDomain();
        //Designer.AudioProcessor.drawFrequencyDomain();
      });
    }
    request.send();
  }

  resetAudio() {
    if (this.context) {
      this.context.suspend();
      this.playing = false;
    }
  }

  currentAudio: string;
  onClickChangeAudioSelection() {
    let isValueChanged = this.currentAudio && this.selectedAudio && this.currentAudio != this.selectedAudio ? true : false;
    if (isValueChanged) {
      this.column = 300;
    }
    this.currentAudio = this.selectedAudio;
    if (this.playing) {
      this.stopAudio();
    }
    this.updateSource();
    this.updateFilter();
  }


  updateSource() {
    // window.AudioContext = window.AudioContext || window.webkitAudioContext;
    window.AudioContext = window.AudioContext;
    this.context = new AudioContext();
    var context = this.context;
    this.source = context.createBufferSource();
    this.source.loop = true;
    this.preAnalyser = context.createAnalyser();
    this.preAnalyser.fftSize = 2048;
    var preAnalyser = this.preAnalyser;
    this.analyser = context.createAnalyser();
    this.analyser.fftSize = this.preAnalyser.fftSize;
    var analyser = this.analyser;

    var sound = this.source;
    sound = sound.connect(preAnalyser);
    // add lowshelfFilter
    var lowshelfFilter = context.createBiquadFilter();
    this.lowshelfFilter = lowshelfFilter;
    lowshelfFilter.type = "lowshelf";
    lowshelfFilter.frequency.value = this.frequency[0];
    lowshelfFilter.gain.value = this.Gain[0];
    sound = sound.connect(lowshelfFilter);
    for (var i in this.frequency) {
      var biquadFilter = context.createBiquadFilter();
      this.biquadFilter[i] = biquadFilter;
      biquadFilter.type = "peaking";
      biquadFilter.frequency.value = this.frequency[i];
      biquadFilter.gain.value = this.Gain[i];  // gain/loss in dB, see web audio documentation
      biquadFilter.Q.value = 4.32;
      sound = sound.connect(biquadFilter);
    }
    // add highshelfFilter
    var highshelfFilter = context.createBiquadFilter();
    this.highshelfFilter = highshelfFilter;
    highshelfFilter.type = "highshelf";
    var length = this.frequency.length;
    highshelfFilter.frequency.value = this.frequency[length - 1];
    highshelfFilter.gain.value = this.Gain[length - 1];
    sound = sound.connect(highshelfFilter);

    // connect analyser
    sound.connect(analyser);
    analyser.connect(context.destination);
  }

  updateFilter() {
    if (this.unified3DModel && this.unified3DModel.AnalysisResult) {
      const result = this.unified3DModel.AnalysisResult.AcousticResult.AcousticUIOutput;
      if (result.LossDistributions) {
        this.frequency = result.LossDistributions[0].map(x => x.Frequency);
        switch (this.selectedWindowOpening) {
          case 0:
            this.Gain = result.LossDistributions[0].map(x => -x.STL);
            break;
          case 1:
            this.Gain = result.LossDistributions[1].map(x => -x.STL);
            break;
          case 2:
            this.Gain = result.LossDistributions[2].map(x => -x.STL);
            break;
          case 5:
            this.Gain = result.LossDistributions[3].map(x => -x.STL);
            break;
          case 100:
            this.Gain = result.LossDistributions[4].map(x => -x.STL);
            break;
          default:
            this.Gain = result.LossDistributions[4].map(x => -x.STL);
            break;
        }

        this.lowshelfFilter.gain.value = this.Gain[0];

        this.biquadFilterMag = [];
        for (var i in this.frequency) {
          var biquadFilter = this.biquadFilter[i];
          biquadFilter.frequency.value = this.frequency[i];
          biquadFilter.gain.value = this.Gain[i];  // gain/loss in dB, see web audio documentation
        }

        //optimize gain
        var optimizedGain = this.Gain;
        if (this.selectedWindowOpening < 100) {
          optimizedGain = this.filterGainOptimize();
        }

        //apply optimized gain
        for (var i in this.frequency) {
          var biquadFilter = this.biquadFilter[i];
          biquadFilter.gain.value = optimizedGain[i];  // gain/loss in dB, see web audio documentation

          // get frf start here
          var frequencyArray = new Float32Array(21);
          frequencyArray = frequencyArray.map((x, ind) => x = this.frequency[ind]);
          var magResponseOutput = new Float32Array(21);
          var phaseResponseOutput = new Float32Array(21);
          biquadFilter.getFrequencyResponse(frequencyArray, magResponseOutput, phaseResponseOutput);
          this.biquadFilterMag.push(magResponseOutput);
          // get frf ends here
          //       }

          //       this.highshelfFilter.gain.value = this.Gain[this.frequency.length-1];
          //   }
        }
      }
    }
  }

  drawTimeDomain = () => {
    if (this.playing) {
      requestAnimationFrame(this.drawTimeDomain);

      if (this.animationFrameCount != 10) {
        this.animationFrameCount += 1;
        return;
      }
      else {
        this.animationFrameCount = 0;
      }

      var canvasCtx = this.canvas.nativeElement.getContext("2d");
      var arrayLength = this.analyser.fftSize;
      var amplitudeArray = new Uint8Array(arrayLength);
      this.analyser.getByteTimeDomainData(amplitudeArray);

      var minValue = 9999999;
      var maxValue = 0;

      for (var i = 0; i < amplitudeArray.length; i++) {
        var value = amplitudeArray[i] / 256;
        if (value > maxValue) {
          maxValue = value;
        } else if (value < minValue) {
          minValue = value;
        }
      }

      var canvasHeight = this.canvas.nativeElement.height;
      var canvasWidth = this.canvas.nativeElement.width;
      var y_lo = canvasHeight * (1 - minValue);
      var y_hi = canvasHeight * (1 - maxValue);

      canvasCtx.fillStyle = '#ffffff';
      canvasCtx.fillRect(this.column, y_lo, 1.5, y_hi - y_lo);

      // loop around the canvas when we reach the end
      this.column += 1.5;
      if (this.column >= 300) {
        this.column = 0;
        canvasCtx.clearRect(0, 0, canvasWidth, canvasHeight);
      }
    }
  }

  drawFrequencyDomain = () => {
    if (this.playing) {
      requestAnimationFrame(this.drawFrequencyDomain);
      var canvasCtx = this.canvas.nativeElement.getContext("2d");
      var bufferLength = this.analyser.frequencyBinCount;
      var dataArray = new Uint8Array(bufferLength);
      this.analyser.getByteFrequencyData(dataArray);
      var preDataArray = new Uint8Array(bufferLength);
      this.preAnalyser.getByteFrequencyData(preDataArray);
      var range = 256.0;

      var xAxisScale = 3;
      canvasCtx.lineWidth = 0.2;
      canvasCtx.strokeStyle = "rgb(255, 255, 255)";
      var sliceWidth = xAxisScale * this.canvas.nativeElement.width / bufferLength;
      canvasCtx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

      // draw frequency of filtered data
      var x = 0;
      canvasCtx.beginPath();
      for (var i = 0; i < bufferLength; i++) {

        var v = dataArray[i] / range;
        var y = this.canvas.nativeElement.height * (1 - v);
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      canvasCtx.stroke();

      // draw frequency of pre-filtered data
      canvasCtx.strokeStyle = "rgb(255, 0, 0)";
      var x = 0;
      canvasCtx.beginPath();
      for (var i = 0; i < bufferLength; i++) {

        var v = preDataArray[i] / range;
        var y = this.canvas.nativeElement.height * (1 - v);
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      canvasCtx.stroke();

      // draw frf
      canvasCtx.strokeStyle = "rgb(0, 255, 0)";
      var x = 0;
      canvasCtx.beginPath();
      var filterArray = new Array(bufferLength);
      for (var i = 0; i < bufferLength; i++) {
        filterArray[i] = dataArray[i] - preDataArray[i];
        var v = filterArray[i] / range;
        var y = this.canvas.nativeElement.height * (0.0 - v);
        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      canvasCtx.stroke();

      // draw filter mag in db
      for (var j = 0; j < 21; j++) {
        canvasCtx.strokeStyle = "rgb(255, 255, 0)";
        canvasCtx.beginPath();
        var filterArray_1 = this.biquadFilterMag[j].map(x => x);
        for (var i = 0; i < bufferLength; i++) {
          var v = 20 * Math.log10(filterArray_1[i]) / range;
          var y = this.canvas.nativeElement.height * (0.0 - v);
          var x = xAxisScale * this.frequency[i] * this.canvas.nativeElement.width / 24000;
          if (i === 0) {
            canvasCtx.moveTo(x, y);
          } else {
            canvasCtx.lineTo(x, y);
          }
        }
        canvasCtx.stroke();
      }
    }
  }

  filterGainOptimize() {
    // get biquadFilter frequency response at center frequencies
    var B = [];
    for (var i in this.frequency) {

      var biquadFilter = this.biquadFilter[i];
      var frequencyArray = new Float32Array(21);
      frequencyArray = frequencyArray.map((x, ind) => x = this.frequency[ind]);
      var magResponseOutput = new Float32Array(21);
      var phaseResponseOutput = new Float32Array(21);
      biquadFilter.getFrequencyResponse(frequencyArray, magResponseOutput, phaseResponseOutput);
      var magArrayInDb = Array.from(magResponseOutput.map(x => x = 20 * Math.log10(x) / this.Gain[i]));
      B.push(magArrayInDb);
    }
    B = math.transpose(B);  // arrange frequency response for a filter in column

    // get target gain
    var targetGain = this.Gain;

    // solve optimizedGain
    var optimizedGain = math.lusolve(B, targetGain)

    return optimizedGain
  }

  getTotalRw() {
    if (this.unified3DModel && this.unified3DModel.AnalysisResult && this.unified3DModel.AnalysisResult.AcousticResult && this.unified3DModel.AnalysisResult.AcousticResult.AcousticUIOutput && this.unified3DModel.AnalysisResult.AcousticResult.AcousticUIOutput.TotalRw) {
      return this.unified3DModel.AnalysisResult.AcousticResult.AcousticUIOutput.TotalRw;
    }
    else {
      return null;
    }
  }



  loading = true;
  view: any[];
  trimYAxisTicks = false;
  trimXAxisTicks = false;
  // options
  legend: boolean = true;
  legendPosition: string = 'below';
  legendText: string;
  showLabels: boolean = true;
  animations: boolean = true;
  roundDomains: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;
  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string;
  yAxisLabel: string;
  yAxisLabel2: string;
  timeline: boolean = true;
  chartData: any;

  colorScheme = {
    domain: ["#f18700", "#007496", "#0084aa", "#00a2d1", "#00b1e5", "#00c0f8"]
  };

  onSelect(data): void {
  }

  onActivate(data): void {
  }

  onDeactivate(data): void {
  }

  setData(dataAcousticUIOutput: any) {
    let data = dataAcousticUIOutput.LossDistributions;
    if (dataAcousticUIOutput.classification) {
      let classification = dataAcousticUIOutput.classification.Deficiencies;
      let nc = dataAcousticUIOutput.classification.NC;
      let i = 0;
      for (const sub of this.frequency) {
        if (sub < 125 || sub > 4000) { }
        else {
          if (nc[i]) {
            this.chartDataBasic.filter(f => f.frequency === sub)[0].nc = nc[i];
          } //else this.chartDataBasic.filter(f => f.frequency === sub)[0].nc = 0;
          if (classification[i]) {
            this.chartDataBasic.filter(f => f.frequency === sub)[0].deficiencies = classification[i];
          } //else this.chartDataBasic.filter(f => f.frequency === sub)[0].deficiencies = 0;
          i++;
        }
      }
    }
    var elem: number = 0;
    for (const sub of data) {
      for (const subsub of sub) {
        //("frequency": frequency[0], "deficiencies": 0, "opening0": 52.1, "opening1": 42.1, "opening2": 21.1, "opening5": 22.1, "opening100": 12.51)
        if (elem === 0) this.chartDataBasic.filter(f => f.frequency === subsub.Frequency)[0].opening0 = subsub.STL.toFixed(0);
        else if (elem === 1) this.chartDataBasic.filter(f => f.frequency === subsub.Frequency)[0].opening1 = subsub.STL.toFixed(0);
        else if (elem === 2) this.chartDataBasic.filter(f => f.frequency === subsub.Frequency)[0].opening2 = subsub.STL.toFixed(0);
        else if (elem === 3) this.chartDataBasic.filter(f => f.frequency === subsub.Frequency)[0].opening5 = subsub.STL.toFixed(0);
        else if (elem === 4) this.chartDataBasic.filter(f => f.frequency === subsub.Frequency)[0].opening100 = subsub.STL.toFixed(0);
        this.chartData[elem].series.push({
          name: subsub.Frequency,
          value: subsub.STL
        });
      }
      elem++;
    }
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  // apply pow10 to yAxis tick values and tootip value
  getMathPower(val: number) {
    return Math.round(Math.pow(10, val));
  }

  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  legendTitle = 'Legend';
  showGridLines = true;
  innerPadding = '10%';
  lineChartScheme = {
    name: 'coolthree',
    selectable: true,
    group: 'Ordinal',
    domain: ["#007496", "#0084aa", "#696969", "#f18700", "#00c0f8", "#00a2d1"]
  };

  comboBarScheme = {
    name: 'singleLightBlue',
    selectable: true,
    group: 'Ordinal',
    domain: ['#696969']
  };

  showRightYAxisLabel: boolean = true;

  chartDataBasic = [{ 
    "frequency": this.frequency[0],  "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[1],  "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[2],  "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[3],  "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[4],  "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[5],  "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[6],  "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[7],  "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[8],  "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[9],  "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[10], "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[11], "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[12], "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[13], "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[14], "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[15], "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[16], "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[17], "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[18], "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[19], "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }, {
    "frequency": this.frequency[20], "nc": null, "deficiencies": null, "opening0": 0, "opening1": 0, "opening2": 0, "opening5": 0, "opening100": 0  }
  ];
}
