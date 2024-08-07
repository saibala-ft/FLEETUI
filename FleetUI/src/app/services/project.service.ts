import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import path from 'path';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private projectCreatedKey = 'projectCreated';
  private selectedProjectKey = 'selectedProject';

  constructor(private cookieService: CookieService) {}

  setProjectCreated(created: boolean) {
    this.cookieService.set('is-project-setted', JSON.stringify(created), {
      path: '/',
    });
    // localStorage.setItem(this.projectCreatedKey, JSON.stringify(created));
  }

  isProjectCreated(): boolean {
    const storedValue = this.cookieService.get('is-project-setted');
    return storedValue ? JSON.parse(storedValue) : false;
  }

  setSelectedProject(project: any) {
    this.cookieService.set('project-data', JSON.stringify(project), {
      path: '/',
    });
    // localStorage.setItem(this.selectedProjectKey, JSON.stringify(project));
  }

  getSelectedProject() {
    const storedProject = this.cookieService.get('project-data');
    // const storedProject = localStorage.getItem(this.selectedProjectKey);
    return storedProject ? JSON.parse(storedProject) : null;
  }

  clearProjectData() {
    this.cookieService.delete('project-data');
    this.cookieService.delete('is-project-setted');
    // localStorage.removeItem(this.projectCreatedKey);
    // localStorage.removeItem(this.selectedProjectKey);
  }
}
