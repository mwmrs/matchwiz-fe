import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
import { APP_BASE_HREF } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);
  private readonly baseHref = inject(APP_BASE_HREF, { optional: true }) ?? '/';

  getTranslation(lang: string) {
    return this.http.get<Translation>(`${this.baseHref}i18n/${lang}.json`);
  }
}
