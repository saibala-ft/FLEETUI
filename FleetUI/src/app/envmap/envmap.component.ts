import { Component, EventEmitter, Output, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { formatDate } from '@angular/common';
interface Zone {
  type: 'high' | 'medium' | 'low';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
}
@Component({
  selector: 'app-envmap',
  templateUrl: './envmap.component.html',
  styleUrls: ['./envmap.component.css']
})
export class EnvmapComponent implements AfterViewInit {
  @Output() closePopup = new EventEmitter<void>();
  @ViewChild('imageCanvas') imageCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('overlayCanvas') overlayCanvas!: ElementRef<HTMLCanvasElement>;
 
  fileName: string | null = null;
  mapName: string = '';
  siteName: string = '';
  height: number | null = null;
  width: number | null = null;
  showImage: boolean = false;
  imageSrc: string | null = null;
  showOptionsLayer: boolean = false;
  nodes: { x: number, y: number }[] = [];
  selectedAsset: 'docking' | 'charging' | 'picking' | null = null;
  assetImages: { [key: string]: HTMLImageElement } = {};
  plottingMode: 'single' | 'multi' | null = null;
  connectivityMode: 'uni' | 'bi' | null = null;
  zoneColor: string | null = null;
  isPlottingEnabled: boolean = false;
  isDrawingZone: boolean = false;
  startX: number | null = null;
  startY: number | null = null;  
  isOptionsMenuVisible = false;
  isCalibrationLayerVisible = false;
 
  currentZone: Zone | null = null;
  robotImages: { [key: string]: HTMLImageElement } = {};
  isRobotPopupVisible: boolean = false;
  tableData: { mapName: string, siteName: string }[] = []; // Holds table data
  private zones: { startX: number, startY: number, endX: number, endY: number }[] = [];
 
 
 
  ngAfterViewInit(): void {
     // Preload asset images
     this.assetImages['docking'] = new Image();
     this.assetImages['docking'].src = 'assets/Asseticon/docking-station.svg';
 
     this.assetImages['charging'] = new Image();
     this.assetImages['charging'].src = 'assets/Asseticon/charging-station.svg';
 
     this.assetImages['picking'] = new Image();
     this.assetImages['picking'].src = 'assets/Asseticon/picking-station.svg';
 
     this.robotImages['robotA'] = new Image();
     this.robotImages['robotA'].src = 'assets/CanvasRobo/robotA.svg';
 
    this.robotImages['robotB'] = new Image();
    this.robotImages['robotB'].src = 'assets/CanvasRobo/robotB.svg';
  }
  selectAsset(assetType: 'docking' | 'charging' | 'picking'): void {
    this.selectedAsset = assetType;
    this.isPlottingEnabled = false; // Disable other plotting modes when placing an asset
  }
  onRobotsPlaced(event: { type: 'robotA' | 'robotB', count: number }): void {
    const canvas = this.overlayCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    const robotImage = this.robotImages[event.type];
 
    for (let i = 0; i < event.count; i++) {
      const x = Math.random() * (canvas.width - robotImage.width);
      const y = Math.random() * (canvas.height - robotImage.height);
      ctx!.drawImage(robotImage, x, y);
    }
  }
 
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.fileName = file.name;
      this.showImage = false;
 
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imageSrc = e.target!.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
 
  open(): void {
    if (this.mapName && this.siteName && this.imageSrc) {
      this.fileName = null;
      this.showImage = true;
            // Add mapName and siteName to tableData
 
 
      const img = new Image();
      img.src = this.imageSrc;
 
      img.onload = () => {
        if (this.imageCanvas && this.imageCanvas.nativeElement) {
          const canvas = this.imageCanvas.nativeElement;
          const ctx = canvas.getContext('2d')!;
 
          canvas.width = this.width || img.width;
          canvas.height = this.height || img.height;
 
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
 
          if (this.overlayCanvas && this.overlayCanvas.nativeElement) {
            const overlay = this.overlayCanvas.nativeElement;
            overlay.width = canvas.width;
            overlay.height = canvas.height;
          }
        }
       
      };
    } else {
      alert('Please enter both Map Name and Site Name before clicking Open.');
    }
  }
 
  close(): void {
    this.closePopup.emit();
  }
 
  setPlottingMode(mode: 'single' | 'multi'): void {
    this.plottingMode = mode;
    this.isPlottingEnabled = true;
  }
  setConnectivityMode(mode: 'uni' | 'bi'): void {
    if (this.nodes.length < 2) {
      alert('Please plot at least two nodes before setting connectivity.');
      return;
    }
    this.connectivityMode = mode;
    this.isPlottingEnabled = false;
  }
  setZoneColor(color: string): void {
    this.zoneColor = color;
    this.isDrawingZone = true;
  }
  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (this.selectedAsset && this.overlayCanvas && this.overlayCanvas.nativeElement) {
      const canvas = this.overlayCanvas.nativeElement;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
 
      const ctx = canvas.getContext('2d');
      const img = this.assetImages[this.selectedAsset];
 
      ctx!.drawImage(img, x - img.width / 2, y - img.height / 2);
 
      // Reset the selected asset after placing it
      this.selectedAsset = null;
    }
    if (this.isPlottingEnabled && this.overlayCanvas && this.overlayCanvas.nativeElement) {
      const canvas = this.overlayCanvas.nativeElement;
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
 
      const ctx = canvas.getContext('2d');
 
      if (this.plottingMode === 'single') {
        ctx!.beginPath();
        ctx!.arc(x, y, 5, 0, 2 * Math.PI, false);
        ctx!.fillStyle = 'red';
        ctx!.fill();
 
        this.nodes.push({ x, y });
 
        this.isPlottingEnabled = false;
      } else if (this.plottingMode === 'multi') {
        ctx!.beginPath();
        ctx!.arc(x, y, 5, 0, 2 * Math.PI, false);
        ctx!.fillStyle = 'red';
        ctx!.fill();
 
        this.nodes.push({ x, y });
      }
 
      if (this.connectivityMode) {
        this.drawConnections();
      }
    }
 
    if (this.isDrawingZone) {
      this.startX = event.clientX;
      this.startY = event.clientY;
    }
  }
  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDrawingZone && this.startX !== null && this.startY !== null && this.overlayCanvas && this.overlayCanvas.nativeElement) {
      const canvas = this.overlayCanvas.nativeElement;
      const ctx = canvas.getContext('2d');
      const rect = canvas.getBoundingClientRect();
      const x = (event.clientX - rect.left) * (canvas.width / rect.width);
      const y = (event.clientY - rect.top) * (canvas.height / rect.height);
 
      ctx!.clearRect(0, 0, canvas.width, canvas.height); // Clear previous drawing
      this.drawZone(this.startX, this.startY, event.clientX, event.clientY);
    }
  }
  @HostListener('mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    if (this.isDrawingZone && this.startX !== null && this.startY !== null) {
      this.isDrawingZone = false;
      this.startX = null;
      this.startY = null;
    }
  }
  drawZone(startX: number, startY: number, endX: number, endY: number): void {
    if (!this.overlayCanvas || !this.zoneColor) return;
 
    const canvas = this.overlayCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x1 = (startX - rect.left) * (canvas.width / rect.width);
    const y1 = (startY - rect.top) * (canvas.height / rect.height);
    const x2 = (endX - rect.left) * (canvas.width / rect.width);
    const y2 = (endY - rect.top) * (canvas.height / rect.height);
 
    ctx!.beginPath();
    ctx!.rect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
    ctx!.fillStyle = this.zoneColor;
    ctx!.fill();
  }
 
 
  drawConnections(): void {
    if (this.nodes.length < 2) return;
 
    const canvas = this.overlayCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
 
    for (let i = 0; i < this.nodes.length - 1; i++) {
      const startNode = this.nodes[i];
      const endNode = this.nodes[i + 1];
 
      // Draw line
      ctx.beginPath();
      ctx.moveTo(startNode.x, startNode.y);
      ctx.lineTo(endNode.x, endNode.y);
      ctx.stroke();
 
      // Draw arrow if unidirectional or bidirectional
      if (this.connectivityMode === 'uni') {
        this.drawArrow(ctx, startNode.x, startNode.y, endNode.x, endNode.y);
      } else if (this.connectivityMode === 'bi') {
        this.drawArrow(ctx, startNode.x, startNode.y, endNode.x, endNode.y);
        this.drawArrow(ctx, endNode.x, endNode.y, startNode.x, startNode.y);
      }
    }
  }
 
  drawArrow(ctx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number): void {
    const headLength = 10; // Length of the arrow head
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
 
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(toX, toY);
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.fill();
  }
 
 
  toggleOptionsMenu(): void {
    this.isOptionsMenuVisible = !this.isOptionsMenuVisible;
  }
 
  hideCalibrationLayer(): void {
    this.isOptionsMenuVisible = false;
  }
  openRobotPopup(): void {
    this.isRobotPopupVisible = true;
  }
 
  closeRobotPopup(): void {
    this.isRobotPopupVisible = false;
  }
  placeRobots(selectedRobots: any[]): void {
    if (!this.overlayCanvas) return;
 
    const canvas = this.overlayCanvas.nativeElement;
    const ctx = canvas.getContext('2d')!;
    selectedRobots.forEach(robot => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
 
      const img = new Image();
      img.src = robot.image;
      img.onload = () => {
        ctx.drawImage(img, x - img.width, y - img.height );
      };
    });
  }
}
 
