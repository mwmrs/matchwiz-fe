# MatchwizFe

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.13.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

---
  What was implemented:
  
  - Foundation — Angular Material 3 (Stadium Pulse dark theme), @ngrx/signals, @jsverse/transloco (EN/DE), MSW, ng-openapi-gen
  - OpenAPI spec (openapi.yaml) + generated typed API client in src/app/core/api/ (31 models, 12 service tags)
  - MSW mocks — all 12 API tags mocked with seed data (3 users, 2 competitions, Bundesliga matchdays, 6 teams)
  - AuthStore (NgRx signals) — JWT persisted to localStorage, APP_INITIALIZER awaits session restore before routing
  - NotificationStore — unread badge in the top bar
  - Guards — authGuard, adminGuard, publicGuard with lazy-loaded routes
  - Layouts — desktop sidenav + mobile bottom navigation
  - All 6 features — Login/Register, Dashboard (groups, matchday, missing predictions alert), Matchday Predictions (score inputs, locked after
  kickoff), Rankings (medal icons, "You" highlight), Preferences (language/timezone/theme/toggles), Admin (Competition CRUD + scoring rules,
  Group management + invite + approvals, Team/Matchday/Match CRUD + result entry)
  - i18n — full EN and DE translation keys wired throughout

  **To log in: username admin, password password (admin role) or alice/bob with password (user role).**

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
