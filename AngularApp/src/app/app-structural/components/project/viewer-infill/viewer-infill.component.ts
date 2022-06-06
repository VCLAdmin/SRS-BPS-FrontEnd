import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Feature } from 'src/app/app-core/models/feature';
import { PermissionService } from 'src/app/app-core/services/permission.service';
import * as THREE from 'three';
import { CommonService } from '../../../../app-common/services/common.service';


@Component({
  selector: 'app-viewer-infill',
  templateUrl: './viewer-infill.component.html',
  styleUrls: ['./viewer-infill.component.css']
})
export class ViewerInfillComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {   // ViewerInfill & ViewerBase
  @Input() isSidePanel: any;
  @Input() confirmedGlassPanelArticle: any;
  @ViewChild('spsGlassViewer') canvas: ElementRef<HTMLDivElement>;
  settings = { elementId: "sps-glass-viewer", cameraType: "ORTHOGRAPHIC" }
  camera: any;
  scene: any;
  renderer: any;
  container: any;
  controls: any;
  mainGroupName: any;
  initialized: boolean;
  mesh: any;
  plateCavityCount: number;
  infillMeshName: string;
  infillRowCount: number;
  glassImage: any;
  shouldRender: boolean;

  constructor(private commonService: CommonService, private permissionService: PermissionService) {
    this.camera = null;
    this.scene = null;
    this.renderer = null;
    this.container = null;
    this.controls = null;
    this.mainGroupName = "MainGroup";
    this.initialized = false;
    this.mesh;
    this.plateCavityCount = 0;
    this.infillMeshName = "InfillMesh_";
    this.infillRowCount = 0;
    this.shouldRender = true;
  }

  ngOnInit(): void {
    this.shouldRender = true;
  }

  ngAfterViewInit() {
    let aspect = this.canvas.nativeElement.clientWidth / this.canvas.nativeElement.clientHeight;
    switch (this.settings.cameraType) {
      case "PERSPECTIVE":
        this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 50000);
        break;
      default:
        this.camera = new THREE.OrthographicCamera(
          this.canvas.nativeElement.clientWidth / - 2,
          this.canvas.nativeElement.clientWidth / 2,
          this.canvas.nativeElement.clientHeight / 2,
          this.canvas.nativeElement.clientHeight / - 2,
          1, 1000);
    }
    this.scene = new THREE.Scene();
    this.renderer = this.commonService.getRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvas.nativeElement.clientWidth, this.canvas.nativeElement.clientHeight);
    this.renderer.setClearColor(0x474747);
    this.canvas.nativeElement.append(this.renderer.domElement);
    this.animate();
    this.initialized = false;
    this.setLighting();
    this.generateInfills();
    this.initialized = true;
    this.glassImage = this.exportImage();
    let img = document.createElement('img');
    img.setAttribute("src", this.glassImage);
    this.canvas.nativeElement.append(img);
    this.renderer.domElement.remove();
  }

  ngOnChanges(Changes: SimpleChanges) {
    if (Changes.confirmedGlassPanelArticle && this.canvas) {
      this.canvas.nativeElement.innerHTML = null;
      this.ngAfterViewInit();
    }
  }
  
  ngOnDestroy(){
    this.shouldRender = false;
  }

  animate() {
    if(this.shouldRender){
      //window.requestAnimationFrame(e => this.animate());
      //this.render();
    }
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  setLighting() {
    let directLight = new THREE.DirectionalLight(0xffffff, .8);
    let ambilight = new THREE.AmbientLight(0xffffff, .2);
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xf5f5f0, .2);
    // Move lights up
    directLight.position.y = 1000;
    ambilight.position.y = 1000;
    hemiLight.position.y = 1000;

    // Move lights forward
    directLight.position.z = 1000;
    ambilight.position.z = 1000;
    hemiLight.position.z = 1000;

    // Move Light left
    directLight.position.x = -1000;

    // Keep Light centered
    ambilight.position.x = 0;

    // Move Light right
    hemiLight.position.x = 1000;

    // Add lights to scene
    this.scene.add(directLight);
    this.scene.add(ambilight);
    this.scene.add(hemiLight);
  }

  onResized() {
    this.camera.aspect = this.canvas.nativeElement.clientWidth / this.canvas.nativeElement.clientHeight;
    this.camera.updateProjectionMatrix();

    //this.renderer.setSize(container.clientWidth, container.clientHeight);
  }


  generateInfills() {
    // PREMIERE PARTIE
    // let type = null;
    // let result = [];
    // let data = null;
    // let size = null;
    // let sizeInput = null;
    // let laminateSizeInput = null;
    // let laminateSize = null;
    // const space = "__";
    let result = [];
    let data = null;
    if(this.permissionService.checkPermission(Feature.GlassPanelShortInfo)){
      if (this.confirmedGlassPanelArticle) {
        this.confirmedGlassPanelArticle.composition.split("-").forEach((element, index) => {
          data = { type: null, material: null, name: null, laminate: false, size: 0, laminateSize: 0 };
          switch (index % 2) {
            case 0:
              data.type = "plate";
              break;
            case 1:
              data.type = "cavity";
              break;
          }
          data.size = (parseInt(element.split('/')[0]) / parseInt(element.split('/')[1]) ) * 25.4;
          data.material = this.confirmedGlassPanelArticle.type.split("-")[index].charAt(0).toUpperCase() + this.confirmedGlassPanelArticle.type.split("-")[index].slice(1);
          data.name = this.infillMeshName + this.infillRowCount.toString();
          this.infillRowCount++;
          data.laminate = false;
          result.push(data);
        });
      }
    }
    else if(this.permissionService.checkPermission(Feature.GlassPanelFullInfo)){
      if (this.confirmedGlassPanelArticle) {
        this.confirmedGlassPanelArticle.composition.split("-").forEach((element, index) => {
          data = { type: null, material: null, name: null, laminate: false, size: 0, laminateSize: 0 };
          switch (index % 2) {
            case 0:
              data.type = "plate";
              break;
            case 1:
              data.type = "cavity";
              break;
          }
          if(element.includes('[')) {
            element = element.substring(0, element.indexOf('['));
          }
          data.size = parseInt(element);
          data.material = this.confirmedGlassPanelArticle.type.split("-")[index].charAt(0).toUpperCase() + this.confirmedGlassPanelArticle.type.split("-")[index].slice(1);
          data.name = this.infillMeshName + this.infillRowCount.toString();
          this.infillRowCount++;
          data.laminate = false;
          if (isNaN(element)) {
            data.laminate = true;
            data.laminateSize = parseFloat(element.split('(')[1].substring(0, 4));
          }
          result.push(data);
        });
      }
    }
    
    const infillTable = result;

    let group = new THREE.Group();
    let row = null;
    let geometry = null;
    let material = null;
    let shape = null;
    let mesh = null;
    let width = null;
    let height = 0;
    let depth = null;
    let type = null;
    let size = null;
    let positionY = 0;
    let color = null;
    let wireframe = null;
    let plateMaterial = null;
    let isLaminate = false;
    let laminateGroup;
    let laminateGlassSize;
    let airSpaceGroup = null;

    this.camera.position.set(0, 0, 10);

    this.clearScene();
    this.plateCavityCount = infillTable.length;
    group.name = this.mainGroupName;
    this.scene.add(group);

    const debug = false;
    if (debug) {
      geometry = new THREE.SphereGeometry(.5, 32, 32);
      material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
      var sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(0, 0, 0);
      this.scene.add(sphere);
    }

    for (var i = 0, len = infillTable.length; i < len; i++) {
      row = infillTable[i];
      type = row.type;
      plateMaterial = row.material;
      isLaminate = row.laminate;
      size = row.size + row.laminateSize;
      depth = 5;
      if (type === "plate") width = 40;
      if (type === "plate" && (this.isPlateType(plateMaterial, 'glass') || this.isPlateType(plateMaterial, 'clear glass') ||this.isPlateType(plateMaterial, 'clear glass sb 60'))) {
        width = 40;
        color = 0x00a2d1;
        wireframe = false;
      }
      else if (type === "plate" && this.isPlateType(plateMaterial, 'clear glass sb 70')) {
        width = 40;
        color = 0x8ad5eb;
        wireframe = false;
      }
      else if (type === "plate" && this.isPlateType(plateMaterial, 'grey glass sb 70')) {
        width = 40;
        color = 0x656565;
        wireframe = false;
      }
      else if (type === "plate" && this.isPlateType(plateMaterial, 'grey glass')) {
        width = 40;
        color = 0x676767;
        wireframe = false;
      }
      else if (type === "plate" && this.isPlateType(plateMaterial, 'bronze glass sb 70')) {
        width = 40;
        color = 0xa46828;
        wireframe = false;
      }
      else if (this.isPlateType(plateMaterial, 'aluminium')) {
        width = 40;
        color = 0xbfbfbf;
        wireframe = false;
      }
      else if (type === "cavity" && this.isPlateType(plateMaterial, 'air')) {
        width = 12;
        color = 0xf18700;
        wireframe = false;
      }
      else if (this.isPlateType(plateMaterial, 'insulation')) {
        width = 40;
        color = 0xfffa7a;
        wireframe = false;
      }
      else if (type === "cavity" && this.isGasType(plateMaterial)) {
        width = 12;
        color = 0xf18700;
        wireframe = false;
      }

      // Create laminated plate layer
      if (isLaminate) {
        laminateGroup = new THREE.Group();

        // Create top layer of glass
        shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, row.size / 2);
        shape.lineTo(width, row.size / 2);
        shape.lineTo(width, 0);

        geometry = new THREE.ShapeGeometry(shape);
        material = new THREE.MeshPhongMaterial({
          color: color,
          wireframe: wireframe,
          side: THREE.DoubleSide
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = (row.size / 2) + (row.laminateSize);
        laminateGroup.add(mesh);

        // Create laminate in center
        shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, row.laminateSize);
        shape.lineTo(width, row.laminateSize);
        shape.lineTo(width, 0);

        geometry = new THREE.ShapeGeometry(shape);
        material = new THREE.MeshPhongMaterial({
          color: 0xff0000,
          wireframe: wireframe,
          side: THREE.DoubleSide
        });
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y += ((row.size / 2));
        laminateGroup.add(mesh);

        // Create bottom layer of glass
        shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, row.size / 2);
        shape.lineTo(width, row.size / 2);
        shape.lineTo(width, 0);

        geometry = new THREE.ShapeGeometry(shape);
        material = new THREE.MeshPhongMaterial({
          color: color,
          wireframe: wireframe,
          side: THREE.DoubleSide
        });
        mesh = new THREE.Mesh(geometry, material);
        laminateGroup.add(mesh);

        mesh = laminateGroup;

      }
      // Create air space layer
      else if (type === "cavity" && this.isGasType(plateMaterial)) {

        airSpaceGroup = new THREE.Group();
        const factor = 6;

        // Create Glue layer
        shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, size);
        shape.lineTo((width / 2), size);
        shape.lineTo(5, size - (size / factor));
        shape.lineTo(5, (size / factor));
        shape.lineTo((width / 2), 0);

        geometry = new THREE.ShapeGeometry(shape);
        material = new THREE.MeshPhongMaterial({
          color: 0x252525,
          wireframe: wireframe,
          side: THREE.DoubleSide
        });
        mesh = new THREE.Mesh(geometry, material);
        airSpaceGroup.add(mesh);

        // Create gasket layer
        shape = new THREE.Shape();
        shape.moveTo(0, (size / factor));
        shape.lineTo(0, size - (size / factor));
        shape.lineTo(1, size);
        shape.lineTo((width / 2), size);
        shape.lineTo((width / 2), 0);
        shape.lineTo(1, 0);

        const cutFactor = 0.75;
        const gasketCutout = new THREE.Shape();
        gasketCutout.moveTo(0 + cutFactor, (size / factor));
        gasketCutout.lineTo(0 + cutFactor, (size - (size / factor) - cutFactor));
        gasketCutout.lineTo(1 + cutFactor, size - cutFactor);
        gasketCutout.lineTo((width / 2) - cutFactor, size - cutFactor);
        gasketCutout.lineTo((width / 2) - cutFactor, 0 + cutFactor);
        gasketCutout.lineTo(1 + cutFactor, 0 + cutFactor);
        shape.holes.push(gasketCutout);

        geometry = new THREE.ShapeGeometry(shape);
        material = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          wireframe: wireframe,
          side: THREE.DoubleSide
        });

        mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = (width / 2) - 1;
        airSpaceGroup.add(mesh);

        mesh = airSpaceGroup

      }
      else if (this.isPlateType(plateMaterial, 'insulation')) {
        shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, size);
        shape.lineTo(width, size);
        // shape.lineTo(0, size - 1);
        // shape.lineTo(width, size - 1);
        shape.lineTo(width, 0);
        geometry = new THREE.ShapeGeometry(shape);
        material = new THREE.MeshPhongMaterial({
          color: color,
          wireframe: wireframe,
          side: THREE.DoubleSide
        });
        mesh = new THREE.Mesh(geometry, material);

        mesh.position.y = positionY - size;
        size += 1;
        group.add(mesh);
        shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, 1);
        shape.lineTo(width, 1);
        shape.lineTo(width, 0);
        geometry = new THREE.ShapeGeometry(shape);
        material = new THREE.MeshPhongMaterial({
          color: 0x000000,
          wireframe: wireframe,
          side: THREE.DoubleSide
        });
        mesh = new THREE.Mesh(geometry, material);
      }
      // Create plate with no laminate
      else {
        shape = new THREE.Shape();
        shape.moveTo(0, 0);
        shape.lineTo(0, size);
        shape.lineTo(width, size);
        shape.lineTo(width, 0);

        geometry = new THREE.ShapeGeometry(shape);
        material = new THREE.MeshPhongMaterial({
          color: color,
          wireframe: wireframe,
          side: THREE.DoubleSide
        });
        mesh = new THREE.Mesh(geometry, material);
      }

      mesh.name = row.name;
      group.add(mesh);

      if (debug) {
        this.renderer.render(this.scene, this.camera);
      }

      mesh.position.y = positionY - size;

      if (debug) {
        this.renderer.render(this.scene, this.camera);
      }

      positionY -= size;
    }
    if (this.isSidePanel) {
      this.camera.zoom = positionY > -100 ? 2.5 : positionY > -200 ? 1.3 : 1;
    } else {
      this.camera.zoom = positionY > -100 ? 2.5 : positionY > -200 ? 2 : 1;
    }
    this.camera.updateProjectionMatrix();
    this.camera.position.x += 25;
    this.camera.position.y -= 45;
    this.makeVertical();
    this.centerModelVertically(mesh);
    // this.animate();
    // this.render();
  }

  clearScene() {
    let mesh = this.scene.getObjectByName(this.mainGroupName);
    this.scene.remove(mesh);
  }

  isGasType(material) {
    material = material.toLowerCase();
    return material === "argon" || material === "luft" || material === "air";
  }
  isPlateType(material, type) {
    material = material.toLowerCase();
    return material === type;
  }

  makeVertical() {
    var model = this.getModel();
    model.rotateZ((Math.PI) / 2);
  }

  getModel() {
    return this.scene.getObjectByName(this.mainGroupName);
  }

  centerModelVertically(mesh) {
    var model = typeof mesh !== "undefined" ? mesh : this.getModel();
    var dimensions = this.getDimensions(model);
    var centroid = this.getCentroid(model);

    this.camera.position.set(centroid.x, centroid.y, centroid.z);
    this.camera.position.z = this.renderer.domElement.clientHeight / 2 / Math.tan(70 / 2);
    //dimensions.size.y

    /* --- Use if controls are enabled --- */
    if (this.controls) {
      this.controls.target = centroid;
      this.controls.update();
    }
  }

  getDimensions(mesh) {
    var box = new THREE.Box3().setFromObject(mesh);
    let size_value = new THREE.Vector3();
    box.getSize(size_value);
    var dimensions = {
      min: box.min,
      max: box.max,
      centroid: this.getCentroid(mesh),
      size: size_value
    }
    return dimensions;
  }

  getCentroid(object) {
    let BBhelper = new THREE.BoxHelper(object);
    if (!BBhelper.geometry.boundingSphere) {
      BBhelper.geometry.computeBoundingSphere();
    }
    let BSphere = BBhelper.geometry.boundingSphere;
    return BSphere.center.clone();
  }


  exportImage() {
    //this.renderer.domElement.getContext("experimental-webgl", { preserveDrawingBuffer: true });        
    //let base64String = this.renderer.domElement.toDataURL("image/png");
    //return base64String;

    return this.exportReportImage();
  }


  exportReportImage() {

    // Rotate infill meshes to face upward
    //this.makeHorizontal();

    // Center Infill meshes
    this.centerModelVertically(this.mesh);

    // Convert infil meshes to a wireframe
    //this.setWireFrame();

    // make viewer background white to match report paper
    //this.renderer.setClearColor(0xffffff);

    // Render the sceme
    this.renderer.render(this.scene, this.camera);

    // Configure renderer settings
    this.renderer.domElement.getContext("experimental-webgl", { preserveDrawingBuffer: true });

    // Export to base64
    let base64String = this.renderer.domElement.toDataURL("image/png");

    // Set viewer bg back to original color
    this.renderer.setClearColor(0x474747);

    // Remove wireframes
    //this.unsetWireFrame();

    // set meshes sideways again
    //this.makeVertical();

    // center meshes
    //this.centerModelVertically();

    // render scene
    this.render();

    // return base64
    return base64String;
  }
}
