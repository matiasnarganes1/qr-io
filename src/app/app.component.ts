import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QrGeneratorComponent } from './components/qr-generator.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, QrGeneratorComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'qr-generator';
}
