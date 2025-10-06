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
        padding: 1.5rem 0;
      }

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 0;
        padding: 0;
        list-style: none;
        font-size: 0.9rem;
        font-weight: 500;
      }

      .breadcrumb-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        &:not(:last-child)::after {
          content: '›';
          color: #1db954;
          margin-left: 0.75rem;
          font-size: 1.1rem;
          font-weight: 600;
        }
      }

      .breadcrumb-link {
        color: #1db954;
        text-decoration: none;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        font-weight: 600;

        &:hover {
          color: #1ed760;
          background: rgba(29, 185, 84, 0.1);
          text-decoration: none;
          transform: translateY(-1px);
        }

        i {
          font-size: 0.9rem;
          color: #1db954;
        }
      }

      .breadcrumb-current {
        color: rgba(255, 255, 255, 0.9);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
        background: rgba(29, 185, 84, 0.1);
        font-weight: 600;

        i {
          font-size: 0.9rem;
          color: #1db954;
        }
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .breadcrumb-nav {
          padding: 0.5rem 0;
          margin-bottom: 1rem;
        }

        .breadcrumb {
          font-size: 0.8rem;
          gap: 0.5rem;
        }

        .breadcrumb-item {
          gap: 0.25rem;

          &:not(:last-child)::after {
            margin-left: 0.5rem;
            font-size: 1rem;
          }
        }

        .breadcrumb-link,
        .breadcrumb-current {
          padding: 0.2rem 0.4rem;
          gap: 0.25rem;

          i {
            font-size: 0.8rem;
          }
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
