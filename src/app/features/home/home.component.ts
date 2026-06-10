import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';

interface Step {
  icon: string;
  titleKey: string;
  textKey: string;
}

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButtonModule, MatIconModule, TranslocoModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly transloco = inject(TranslocoService);

  protected readonly activeLang = toSignal(this.transloco.langChanges$, {
    initialValue: this.transloco.getActiveLang(),
  });

  protected toggleLang(): void {
    this.transloco.setActiveLang(this.activeLang() === 'de' ? 'en' : 'de');
  }

  protected readonly steps: Step[] = [
    { icon: 'group_add',       titleKey: 'home.step1Title', textKey: 'home.step1Text' },
    { icon: 'sports_soccer',   titleKey: 'home.step2Title', textKey: 'home.step2Text' },
    { icon: 'emoji_events',    titleKey: 'home.step3Title', textKey: 'home.step3Text' },
    { icon: 'leaderboard',     titleKey: 'home.step4Title', textKey: 'home.step4Text' },
  ];
}
