import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SettingsService } from './core/services/settings.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'expense-tracker';

  constructor(private settingsService: SettingsService) {
    // Injecting SettingsService will automatically initialize it
  }

  ngOnInit() {
    // Settings service is already initialized through constructor
  }
}