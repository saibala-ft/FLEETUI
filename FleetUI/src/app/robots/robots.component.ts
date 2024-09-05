import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RobotDetailPopupComponent } from '../robot-detail-popup/robot-detail-popup.component';

export interface Robot {
  id: number;
  name: string;
  imageUrl: string;
  status: string;
  battery: string;
  serialNumber: string;
  // Add other fields as needed
}


@Component({
  selector: 'app-robots',
  templateUrl: './robots.component.html',
  styleUrls: ['./robots.component.css']
})
export class RobotsComponent implements OnInit {

  robotImages: string[] = [
    'agv1.png',
    'agv2.png',
    'agv3.png',
    // Add more images from assets/robots
  ];


  robots: Robot[] = [
    {
      id: 1,
      serialNumber: '1000000',
      name: 'Forklift AGV',
      imageUrl: "../../assets/robots/agv1.png",
      status: 'Active',
      battery: '40%',
    },
    {
      id: 2,
      serialNumber: '101589',
      name: 'Forklift AGV',
      imageUrl: "../../assets/robots/agv1.png",
      status: 'Active',
      battery: '40%'
    },
    {
      id: 3,
      serialNumber: '101589',
      name: 'Forklift AGV',
      imageUrl: "../../assets/robots/agv1.png",
      status: 'Active',
      battery: '40%'
    },
    {
      id: 4,
      serialNumber: '101589',
      name: 'Forklift AGV',
      imageUrl: "../../assets/robots/agv1.png",
      status: 'Active',
      battery: '40%'
    },
    {
      id: 5,
      serialNumber: '101589',
      name: 'Forklift AGV',
      imageUrl: "../../assets/robots/agv1.png",
      status: 'Active',
      battery: '40%'
    },
    {
      id: 6 ,
      serialNumber: '101589',
      name: 'Forklift AGV',
      imageUrl: "../../assets/robots/agv1.png",
      status: 'Active',
      battery: '40%'
    },
    // Add more robots...
  ];

  showPopup = false;
  isEditPopupOpen = false;
  menuOpenIndex: number | null = null;

  newRobot: Robot = {
    id: 0,
    name: '',
    imageUrl: '',
    status: 'Active',
    battery: '100%',
    serialNumber: ''
  };

  editRobotData: Robot = {
    id: 0,
    name: '',
    imageUrl: '',
    status: 'Active',
    battery: '100%',
    serialNumber: ''
  };
  getImagePath(imageName: string): string {
    return `../../assets/robots/${imageName}`;
  }


  editIndex: number | null = null;
  centerIndex: any;

  togglePopup() {
    this.showPopup = !this.showPopup;
  }

  toggleMenu(index: number) {
    console.log('Toggling menu for index:', index); // Debugging log
    if (this.menuOpenIndex === index) {
      this.menuOpenIndex = null;
    } else {
      this.menuOpenIndex = index;
    }
  }

  closeMenu() {
    this.menuOpenIndex = null;
  }

  addRobot() {
    if (this.newRobot.name && this.newRobot.imageUrl && this.newRobot.serialNumber && this.newRobot.status && this.newRobot.battery) {
      this.newRobot.id = this.robots.length > 0 ? this.robots[this.robots.length - 1].id + 1 : 1;
      this.robots.push({ ...this.newRobot });
      this.newRobot = { id: 0, name: '', imageUrl: '',  serialNumber: '',  status: 'Active', battery: '100%' };
      this.togglePopup();
    } else {
      alert('Please fill out all fields.');
    }
  }

  editRobot(index: number) {
    this.isEditPopupOpen = true;
    this.editIndex = index;
    this.editRobotData = { ...this.robots[index] };
    this.menuOpenIndex = null;
  }

  saveRobot() {
    if (this.editIndex !== null) {
      this.robots[this.editIndex] = {
        id: this.editRobotData.id,
        name: this.editRobotData.name,
        imageUrl: this.editRobotData.imageUrl,
        serialNumber: this.editRobotData.serialNumber || 'DefaultSerialNumber',
       
       
        status: this.editRobotData.status,
        battery: this.editRobotData.battery,
        
      };
      this.closeEditPopup();
    }
  }

  closeEditPopup() {
    this.isEditPopupOpen = false;
    this.editIndex = null;
    this.editRobotData = { 
      id: 0, 
      name: '', 
      imageUrl: '', 
      serialNumber: '' ,
      status: 'Active', 
      battery: '100%',
      
    };
  }

  deleteRobot(index: number) {
    this.robots.splice(index, 1);
    this.updateRobotIds();
    this.menuOpenIndex = null;
  }

  updateRobotIds() {
    this.robots.forEach((robot, index) => {
      robot.id = index + 1;
    });
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  constructor(public dialog: MatDialog) {}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  openRobotDetail(robot: Robot): void {
    this.dialog.open(RobotDetailPopupComponent, {
      width: '70%',
      data: robot
    });
  }
}
