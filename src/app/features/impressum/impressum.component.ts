import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { catchError, of } from 'rxjs';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslocoModule } from '@jsverse/transloco';
import type { LegalNotice } from '../../core/api/models/legal-notice';

@Component({
  selector: 'app-impressum',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatProgressSpinnerModule, TranslocoModule],
  templateUrl: './impressum.component.html',
  styleUrl: './impressum.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImpressumComponent {
  protected readonly legalNotice = toSignal(
    inject(HttpClient).get<LegalNotice>('/api/legal-notice').pipe(
      catchError(() => of(null))
    )
  );
}
