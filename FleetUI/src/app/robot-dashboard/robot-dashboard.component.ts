import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-robot-dashboard',
  templateUrl: './robot-dashboard.component.html',
  styleUrls: ['./robot-dashboard.component.css']
})
export class RobotDashboardComponent implements OnInit {

  robotActivities = [
    { id: 1, name: 'AMR-001', task: 'Transporting materials', progress: 85, status: 'Actively Working' },
    { id: 2, name: 'AMR-002', task: 'Docking for recharging', progress: 20, status: 'Charging' },
    { id: 3, name: 'AMR-003', task: 'Navigating to waypoint B', progress: 65, status: 'Actively Working' },
    { id: 4, name: 'AMR-004', task: 'Awaiting new task', progress: 100, status: 'Pending' }
  ];

  notifications = [
    { message: 'Low Battery - AMR-001', timestamp: '2024-08-16 14:32' },
    { message: 'Task Assigned - AMR-002', timestamp: '2024-08-16 14:32' },
    { message: 'Obstacle Detected - AMR-003', timestamp: '2024-08-16' },
    { message: 'Low Battery - AMR-004', timestamp: '2024-08-16 14:32' },
    { message: 'Emergency Stop - AMR-005', timestamp: '2024-08-16 14:32' }
    
  ];

  currentView: string = 'robot';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.navigate(['/statistics/robot']);
  }

  setView(view: string): void {
    this.currentView = view;
    if (view === 'robot') {
      this.router.navigate(['/statistics/robot']);
    } else {
      this.router.navigate(['/statistics/operation']);
    }
  }
}
