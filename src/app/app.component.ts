import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CodeCommenterComponent } from './code-commentor/code-commentor.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CodeCommenterComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    title = 'angular-ai-commenter';
}