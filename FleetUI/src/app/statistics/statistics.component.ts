import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment.development';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css'],
})
export class StatisticsComponent {
  products: any;
  getSeverity(arg0: any) {
    throw new Error('Method not implemented.');
  }
  currentView: string = 'operation'; // Default to 'operation'
  operationPie: number[] = [0, 0, 0, 0, 0];
  selectedMap: any | null = null;
  operationActivities: any[] = [];

  // this.operationActivities = [
  // { taskId: 9, taskName: 'AMR-003', task: 'Transporting materials', progress: 90, status: 'Actively Working', },
  // ];

  notifications = [
    {
      message: 'Low Battery',
      taskId: 'AMR-001',
      timestamp: '2024-08-16 14:32',
    },
    {
      message: 'Task Assigned ',
      taskId: ' AMR-002',
      timestamp: '2024-08-16 14:32',
    },
    {
      message: 'Obstacle Detected ',
      taskId: ' AMR-003',
      timestamp: '2024-08-16',
    },
    // { message: 'Obstacle Detected - AMR-003', timestamp: '2024-08-16' },
  ];

  statisticsData: any = {
    systemThroughput: 0,
    systemThroughputChange: 3.5,
    systemUptime: 0,
    systemUptimeChange: 0.2,
    successRate: 0,
    successRateChange: -1.5,
    responsiveness: 0,
    responsivenessChange: 5.2,
  }; // Initialize the array with mock data

  filteredOperationActivities = this.operationActivities;
  filteredNotifications = this.notifications;

  taskStatus_interval: any | null = null;
  currTaskStatus_interval: any | null = null;

  constructor(
    private router: Router,
    private projectService: ProjectService,
    private cdRef: ChangeDetectorRef
  ) {
    if (!this.selectedMap) this.selectedMap = this.projectService.getMapData();
  }

  onViewAllClick() {
    this.router.navigate(['/tasks']); // Navigate to tasks page
  }

  setView(view: string): void {
    this.currentView = view;
    if (view === 'robot') {
      this.router.navigate(['/statistics/robot']);
    } else {
      this.router.navigate(['/statistics/operation']);
    }
  }

  async ngOnInit() {
    this.router.navigate(['/statistics/operation']); // Default to operation view
    this.selectedMap = this.projectService.getMapData();
    if (!this.selectedMap) return;
    this.getGrossStatus();
    this.operationPie = await this.fetchTasksStatus();
    this.taskStatus_interval = setInterval(async () => {
      this.operationPie = await this.fetchTasksStatus();
    }, 1000 * 10);
    this.operationActivities = await this.fetchCurrTasksStatus();
    this.filteredOperationActivities = this.operationActivities;
    this.currTaskStatus_interval = setInterval(async () => {
      let currTasks = await this.fetchCurrTasksStatus();
      // this.filteredOperationActivities.push(currTasks[0]);
      this.filteredOperationActivities = currTasks;
      // console.log(this.operationActivities);
      // this.filteredOperationActivities = [
      //   ...this.filteredNotifications,
      //   currTasks[0],
      // ];
    }, 1000 * 10);
  }

  async fetchFleetStatus(endpoint: string, bodyData = {}): Promise<any> {
    const response = await fetch(
      `http://${environment.API_URL}:${environment.PORT}/fleet-gross-status/${endpoint}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData),
      }
    );

    return await response.json();
  }

  // async to synchronous...
  async getGrossStatus() {
    const mapId = this.selectedMap.id;

    let throughputData = await this.fetchFleetStatus('system-throughput', {
      mapId: mapId,
    });
    if (throughputData.systemThroughput)
      this.statisticsData.systemThroughput = throughputData.systemThroughput;
    let uptime = await this.fetchFleetStatus('system-uptime', { mapId: mapId });
    if (uptime.systemUptime)
      this.statisticsData.systemUptime = uptime.systemUptime;
    let successRate = await this.fetchFleetStatus('success-rate', {
      mapId: mapId,
    });
    // yet to uncomment..
    // if (successRate.successRate)
    //   this.statisticsData.successRate = successRate.successRate;
    let responsiveness = await this.fetchFleetStatus('system-responsiveness', {
      mapId: mapId,
    });
    if (responsiveness.systemResponsiveness)
      this.statisticsData.responsiveness = responsiveness.systemResponsiveness;
  }

  async fetchCurrTasksStatus(): Promise<any[]> {
    let { timeStamp1, timeStamp2 } = this.getTimeStampsOfDay();
    let response = await fetch(
      `http://${environment.API_URL}:${environment.PORT}/fleet-tasks/curr-task-activities`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapId: this.selectedMap.id,
          timeStamp1: timeStamp1,
          timeStamp2: timeStamp2,
        }),
      }
    );
    // if(!response.ok) throw new Error(`Error occured with status code of : ${response.status}`)
    let data = await response.json();
    if (data.error) {
      console.log('Err occured while getting tasks status : ', data.error);
      return [];
    }

    if (data.tasks) {
      if (!('tasks' in data.tasks))
        return [
          { taskId: 'n/a', taskName: 'n/a', robotName: 'n/a', status: 'n/a' },
        ];
      let { tasks } = data.tasks;

      let fleet_tasks = tasks.map((task: any) => {
        return {
          taskId: task.task_id,
          taskName: task.sub_task[0]?.task_type
            ? task.sub_task[0]?.task_type
            : 'N/A',
          robotName: task.agent_ID, // agent_name
          status: task.task_status.status,
        };
      });

      return fleet_tasks;
    }
    return [];
  }

  async fetchTasksStatus(): Promise<number[]> {
    let { timeStamp1, timeStamp2 } = this.getTimeStampsOfDay(); // yet to take, in seri..
    // timeStamp1 = 1728410917;
    // timeStamp2 = 1728412500;

    let response = await fetch(
      `http://${environment.API_URL}:${environment.PORT}/fleet-tasks`,
      {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mapId: this.selectedMap.id,
          timeStamp1: timeStamp1,
          timeStamp2: timeStamp2,
        }),
      }
    );
    // if(!response.ok) throw new Error(`Error occured with status code of : ${response.status}`)
    let data = await response.json();

    if (data.error) {
      console.log('Err occured while getting tasks status : ', data.error);
      return [0, 0, 0, 0, 0];
    }
    if (!data.tasks?.tasks) return [0, 0, 0, 0, 0];
    const { tasks } = data.tasks;

    // if (data.tasksStatus) return data.tasksStatus;
    // ["completed", "In-progress", "todo", "err", "cancelled"];
    let tasksStatus = [0, 0, 0, 0, 0];
    let tot_tasks = 0;
    if (tasks) {
      let tasksStatusArr = tasks.map((task: any) => {
        return task.task_status.status;
      });
      for (let task of tasksStatusArr) {
        if (task === 'PICKED' || task === 'DROPPED' || task === 'COMPLETED')
          tasksStatus[0] += 1;
        else if (
          task === 'INPROGRESS' ||
          task === 'ONHOLD' ||
          task === 'ACCEPTED'
        )
          tasksStatus[1] += 1;
        else if (task === 'NOTASSIGNED') tasksStatus[2] += 1;
        else if (task === 'FAILED' || task === 'REJECTED') tasksStatus[3] += 1;
        else if (task === 'CANCELLED') tasksStatus[4] += 1;
      }
      for (let taskStatus of tasksStatus) {
        tot_tasks += taskStatus;
      }
      let completedTasks = tasksStatus[0];
      let errorTasks = tasksStatus[3];
      let cancelledTasks = tasksStatus[4];
      this.statisticsData.successRate = (
        ((completedTasks + errorTasks + cancelledTasks) / tot_tasks) *
        100
      ).toFixed(2);
      return tasksStatus;
    }
    return [0, 0, 0, 0, 0];
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value.toLowerCase();
    this.filteredOperationActivities = this.operationActivities.filter(
      (activity) =>
        activity.taskName.toLowerCase().includes(query) ||
        activity.taskId.toString().toLowerCase().includes(query) ||
        activity.robotName.toString().toLowerCase().includes(query) ||
        activity.status.toLowerCase().includes(query)
    );
  }

  onSearchNotifications(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value.toLowerCase();
    this.filteredNotifications = this.notifications.filter((notification) =>
      notification.message.toLowerCase().includes(query)
    );
  }

  getTimeStampsOfDay() {
    let currentTime = Math.floor(new Date().getTime() / 1000);
    let startTimeOfDay = this.getStartOfDay();
    return {
      timeStamp1: startTimeOfDay,
      timeStamp2: currentTime,
    };
  }

  getStartOfDay() {
    return Math.floor(new Date().setHours(0, 0, 0) / 1000);
  }

  /* ngOnDestroy() {
    if (this.taskStatus_interval) clearInterval(this.taskStatus_interval);
    if (this.currTaskStatus_interval)
      clearInterval(this.currTaskStatus_interval);
  } */
}
