import { Component, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { MenuComponent } from './component/menu/menu';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, 
            MenuComponent, 
            CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.sass'
})
export class App {
  protected readonly title = signal('fin-app');

  currentRoute: string = '';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url; // Atualiza a rota atual
      });
  }

  isLoginPage(): boolean {
    // console.log('Current Route:', this.currentRoute);
    // return this.currentRoute === '/login';
    return false;
  }

  // navigateToDashboard() {
    // this.router.navigate(['/games/list']);
  // }
}
