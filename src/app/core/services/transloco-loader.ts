import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);
  private readonly baseHref =
    inject(DOCUMENT).querySelector('base')?.getAttribute('href') ?? '/';

  getTranslation(lang: string) {
    return this.http.get<Translation>(`${this.baseHref}i18n/${lang}.json`);
  }
}
