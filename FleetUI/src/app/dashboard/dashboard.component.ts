import {
  Component,
  AfterViewInit,
  ChangeDetectorRef,
  ViewChild,
  
} from '@angular/core';
import domtoimage from 'dom-to-image-more';
import RecordRTC from 'recordrtc';
import { ProjectService } from '../services/project.service';
import { environment } from '../../environments/environment.development';
import { UptimeComponent } from '../uptime/uptime.component';
import { ThroughputComponent } from '../throughput/throughput.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements AfterViewInit {
  @ViewChild(UptimeComponent) UptimeComponent!: UptimeComponent;
  @ViewChild(ThroughputComponent) throughputComponent!: ThroughputComponent;

  eventSource!: EventSource;
  ONBtn = false;
  showDashboard = false;
  selectedFloor = 'Floor 1';
  floors = ['Floor 1'];
  zoomLevel = 1.1;
  isPanning = false;
  lastX = 0;
  lastY = 0;
  offsetX = 0;
  offsetY = 0;
  mapDetails:any | null = null;
  nodes:any[]= [];
  edges:any[]=[];
  zones:any[]=[];
  assets:any[]=[];

  showChart2 = true; // Controls blur effect for Chart2
  showChart3 = true;

  recording = false;
  private recorder: any;
  private stream: MediaStream | null = null; // Store the MediaStream here
  showModelCanvas: boolean = false;  // Initially hide the modelCanvas
  constructor(
    private projectService: ProjectService,
    private cdRef: ChangeDetectorRef
  ) {
    if (this.projectService.getIsMapSet()) return;
    this.onInitMapImg(); // yet to remove..
  }

  async ngAfterViewInit() {
    
    this.loadCanvas();
    await this.getMapDetails();
    if (this.showModelCanvas) {
      // this.cdRef.detectChanges(); // Detect changes to ensure DOM is ready
      this.loadModelCanvas();     // Safely load the modelCanvas
    }
  }

  async getMapDetails() {
    let mapData = this.projectService.getMapData();
    let response = await fetch(`http://${environment.API_URL}:${environment.PORT}/dashboard/maps/${mapData.mapName}`);
    if (!response.ok) throw new Error(`Error with status code of ${response.status}`);
    let data = await response.json();
    if (!data.map) return;
    mapData = data.map;
    
    this.nodes = mapData.nodes;
    this.edges = mapData.edges;
    this.assets = mapData.assets;
    this.zones = mapData.zones;
  }
  

  // guess no need..
  async ngOnInit() {
    if (this.projectService.getIsMapSet()) return;
    await this.onInitMapImg();
    this.loadCanvas();
  }

  async onInitMapImg() {
    let project = this.projectService.getSelectedProject();
    let mapArr = [];
    // console.log(project);

    const response = await fetch(
      `http://${environment.API_URL}:${environment.PORT}/fleet-project/${project._id}`,
      { credentials: 'include' }
    );
    if (!response.ok)
      console.error('Error while fetching map data : ', response.status);
    let data = await response.json();
    let projectSites = data.project.sites;
    mapArr = projectSites
      .map((sites: any) => {
        for (let map of sites.maps) {
          return {
            id: map.mapId,
            mapName: map.mapName,
            siteName: sites.siteName,
          };
        }
        return null;
      })
      .filter((item: any) => item !== null);

    if (!mapArr.length) return;
    const mapResponse = await fetch(
      `http://${environment.API_URL}:${environment.PORT}/dashboard/maps/${mapArr[0].mapName}`
    );
    let mapData = await mapResponse.json();
    this.projectService.setMapData({
      ...mapArr[0],
      imgUrl: mapData.map.imgUrl,
    });
    this.loadCanvas();
  }

  // start-stop the operation!
  startStopOpt() {
    if (this.UptimeComponent) this.UptimeComponent.getUptimeIfOn(); // call the uptime comp function
    if (this.throughputComponent) this.throughputComponent.getThroughPutIfOn();
  }

  toggleONBtn() {
    this.ONBtn = !this.ONBtn;
    if (this.ONBtn) this.getliveAmrPos();
    if (!this.ONBtn) this.eventSource.close(); // try take of it..
  }

  getOnBtnImage(): string {
    return this.ONBtn
      ? '../../assets/icons/off.svg'
      : '../../assets/icons/on.svg';
  }
  toggleModelCanvas() {
    this.showModelCanvas = !this.showModelCanvas;
    this.loadCanvas();  // Redraw the canvas based on the updated state
  }


  getliveAmrPos() {
    const URL = `http://${environment.API_URL}:${environment.PORT}/stream-data/live-AMR-pos`;
    if (this.eventSource) this.eventSource.close();

    this.eventSource = new EventSource(URL);
    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log(data);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      this.eventSource.close();
    };
  }

  loadCanvas() {
    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
  
    if (ctx) {
      const img = new Image();
      let imgName = this.projectService.getMapData();
      img.src = `http://${imgName.imgUrl}`;
  
      img.onload = () => {
        canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
        canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
        this.drawImageScaled(ctx, img);
  
        // Conditionally draw nodes based on showModelCanvas flag
        if (this.showModelCanvas) {
          this.nodes.forEach((node) => {
            this.drawNode(ctx, node.nodePosition.x, node.nodePosition.y, node.nodeId);
          });
        }
      };
    }
  }
  loadModelCanvas() {
    const canvas = document.getElementById('modelCanvas') as HTMLCanvasElement;
    if (!canvas) {
      console.error('modelCanvas element not found in the DOM');
      return;
    }
    const ctx = canvas.getContext('2d');
    console.log(ctx);
    
    
    if (ctx) {
      // Set canvas dimensions
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
  
      // Clear any previous drawings
      // ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      // Draw nodes (assuming each node has properties like x, y, and nodeType or id)
      this.nodes.forEach((node) => {
        console.log( node.nodePosition.x, node.nodePosition.y, node.nodeId);
        this.drawNode(ctx, node.nodePosition.x, node.nodePosition.y, node.nodeId);
      });
      
    } else {
      console.error('2D context not available');
    }
  }
  
  drawNode(ctx: CanvasRenderingContext2D, x: number, y: number, label: string) { 
    // Set node style (for example, circle)
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2 * Math.PI); // Draw circle with radius 10
    ctx.fillStyle = '#00f'; // Blue color
    ctx.fill();
  
    // Add a label to the node
    ctx.fillStyle = '#000'; // Black text color
    ctx.font = '12px Arial';
    ctx.fillText(label, x + 12, y); // Place label slightly right to the node
  }
    
  drawImageScaled(ctx: CanvasRenderingContext2D, img: HTMLImageElement) {
    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
  
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.save();
    ctx.translate(canvasWidth / 2 + this.offsetX, canvasHeight / 2 + this.offsetY);
    ctx.scale(this.zoomLevel, this.zoomLevel);
    ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
    ctx.restore();
  }

  getFloorMap(floor: string): string {
    switch (floor) {
      case 'Floor 1':
        return '../../assets/maps/Map3.svg';
      default:
        return '../../assets/maps/Map1.svg';
    }
  }

  onFloorChange(event: Event) {
    this.loadCanvas();
  }

  zoomIn() {
    this.zoomLevel *= 1.2;
    this.loadCanvas();
  }

  zoomOut() {
    this.zoomLevel /= 1.2;
    this.loadCanvas();
  }

  panStart(event: MouseEvent) {
    if (this.isPanning) {
      this.lastX = event.clientX;
      this.lastY = event.clientY;
      document.addEventListener('mousemove', this.panMove);
      document.addEventListener('mouseup', this.panEnd);
      document.body.style.cursor = 'grabbing';
    }
  }
  // Rest of your existing component methods like panStart(), toggleONBtn(), etc.
  panStartModelCanvas(event: MouseEvent) {
    // Handle pan start for modelCanvas
    console.log('Panning on Model Canvas', event);
  }
  panMove = (event: MouseEvent) => {
    if (this.isPanning) {
      const deltaX = event.clientX - this.lastX;
      const deltaY = event.clientY - this.lastY;
      this.lastX = event.clientX;
      this.lastY = event.clientY;

      this.offsetX += deltaX / this.zoomLevel;
      this.offsetY += deltaY / this.zoomLevel;

      this.loadCanvas();
    }
  };

  panEnd = () => {
    document.removeEventListener('mousemove', this.panMove);
    document.removeEventListener('mouseup', this.panEnd);
    if (this.isPanning) {
      document.body.style.cursor = 'grab';
    } else {
      document.body.style.cursor = 'default';
    }
  };

  togglePan() {
    this.isPanning = !this.isPanning;
    document.body.style.cursor = this.isPanning ? 'grab' : 'default';
  }

  captureCanvas() {
    const element = document.getElementsByClassName('container')[0];
    console.log('Container element:', element); // Log the container to check if it exists
    if (element) {
      domtoimage
        .toPng(element)
        .then((dataUrl: string) => {
          const link = document.createElement('a');
          link.href = dataUrl;
          link.download = 'page_capture.png'; 
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        })
        .catch((error: Error) => {
          console.error('Error capturing page:', error);
        });
    } else {
      console.error('Container element not found.');
    }
  }
  

  toggleDashboard() {
    this.showDashboard = !this.showDashboard;
  }

  toggleRecording() {
    this.recording = !this.recording;
    if (this.recording) {
      this.startRecording();
    } else {
      this.stopRecording();
    }
  }

  async startRecording() {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'application', // This may help to limit to the application window
        },
        audio: false,
      });
      this.recorder = new RecordRTC(stream, {
        type: 'video',
        mimeType: 'video/webm',
      });
      this.recorder.startRecording();
      this.stream = stream; // Store the stream reference
    } catch (error) {
      console.error('Error starting screen recording:', error);
      this.recording = false;
    }
  }

  stopRecording() {
    if (this.recorder) {
      this.recorder.stopRecording(() => {
        const blob = this.recorder.getBlob();
        const mp4Blob = new Blob([blob], { type: 'video/mp4' });
        this.invokeSaveAsDialog(mp4Blob, 'recording.mp4');
      });
    }

    // Stop all tracks in the stream to stop sharing
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null; // Clear the stream reference
    }
  }

  invokeSaveAsDialog(blob: Blob, fileName: string) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
  }
}
