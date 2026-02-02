import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SidebarComponent } from "./sidebar/sidebar.component";
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  imports: [SidebarComponent, RouterModule],
  templateUrl: './admin-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLayoutComponent { }
