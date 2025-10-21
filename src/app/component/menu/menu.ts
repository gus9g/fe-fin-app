import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [RouterModule],
  templateUrl: './menu.html',
  styleUrls: ['./menu.sass']
})
export class MenuComponent {
  // isCollapsed = true;
  
  constructor(private router: Router) {}

  logout() {
    // this.authService.logout();
  }
  
  isActive(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}
