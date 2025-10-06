import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-test-env',
  template: `
    <div style="padding: 20px; background: #f0f0f0; margin: 20px; border-radius: 8px;">
      <h3>Environment Debug Info</h3>
      <p><strong>Production:</strong> {{ environment.production }}</p>
      <p><strong>Backend URL:</strong> {{ environment.backendApiUrl }}</p>
      <p><strong>Client ID:</strong> {{ environment.spotify.clientId }}</p>
    </div>
  `,
  standalone: true
})
export class TestEnvComponent {
  environment = environment;
}
