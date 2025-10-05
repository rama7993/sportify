import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <nav class="breadcrumb-nav" *ngIf="breadcrumbs.length > 0">
      <div class="container">
        <ol class="breadcrumb">
          <li
            class="breadcrumb-item"
            *ngFor="let breadcrumb of breadcrumbs; let last = last"
          >
            <a
              *ngIf="!last && breadcrumb.route"
              [routerLink]="breadcrumb.route"
              class="breadcrumb-link"
            >
              <i [class]="breadcrumb.icon" *ngIf="breadcrumb.icon"></i>
              {{ breadcrumb.label }}
            </a>
            <span *ngIf="last || !breadcrumb.route" class="breadcrumb-current">
              <i [class]="breadcrumb.icon" *ngIf="breadcrumb.icon"></i>
              {{ breadcrumb.label }}
            </span>
          </li>
        </ol>
      </div>
    </nav>
  `,
  styles: [
    `
      .breadcrumb-nav {
        background: rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding: 1rem 0;
        margin-bottom: 2rem;
      }

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0;
        padding: 0;
        list-style: none;
        font-size: 0.9rem;
      }

      .breadcrumb-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &:not(:last-child)::after {
          content: '›';
          color: rgba(255, 255, 255, 0.5);
          margin-left: 0.5rem;
        }
      }

      .breadcrumb-link {
        color: #1db954;
        text-decoration: none;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.25rem;

        &:hover {
          color: #1ed760;
          text-decoration: underline;
        }

        i {
          font-size: 0.8rem;
        }
      }

      .breadcrumb-current {
        color: rgba(255, 255, 255, 0.8);
        display: flex;
        align-items: center;
        gap: 0.25rem;

        i {
          font-size: 0.8rem;
        }
      }
    `,
  ],
})
export class BreadcrumbComponent {
  @Input() breadcrumbs: BreadcrumbItem[] = [];
}

export interface BreadcrumbItem {
  label: string;
  route?: string[];
  icon?: string;
}
