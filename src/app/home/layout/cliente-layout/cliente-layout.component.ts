
import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RouterModule, RouterOutlet } from "@angular/router";
import { FooterComponent } from "../footer/footer.component";
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-cliente-layout.component',
  imports: [RouterModule, FooterComponent, RouterOutlet, NavbarComponent],
  templateUrl: './cliente-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClienteLayoutComponent { }
