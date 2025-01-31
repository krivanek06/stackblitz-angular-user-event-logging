import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  template: `
    <div class="h-[20px] bg-red-300 p-4">
      Hello from
      {{ name }}!
    </div>
    <a target="_blank" href="https://angular.dev/overview"> Learn more about Angular </a>
  `,
})
export class App {
  name = 'ee';
}

bootstrapApplication(App);
