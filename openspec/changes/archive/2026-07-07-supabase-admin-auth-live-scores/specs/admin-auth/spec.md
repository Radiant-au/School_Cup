## ADDED Requirements

### Requirement: Admin routes require an authenticated Supabase session

The `/fifaOwner` and `/fifaOwner/match/:id` routes SHALL be wrapped in an auth guard that resolves the current Supabase session. When no session exists, the guard SHALL render the login screen (or redirect to `/fifaOwner/login`) instead of the admin content. The guard SHALL render a neutral loading state while the session is being resolved so unauthenticated content never flashes.

#### Scenario: Unauthenticated admin visit

- **WHEN** a user navigates to `/fifaOwner` without a Supabase session
- **THEN** the login screen is shown and no admin fixture/match content is rendered.

#### Scenario: Session resolving shows loading state

- **WHEN** the auth guard mounts and `supabase.auth.getSession()` has not yet resolved
- **THEN** a loading indicator is rendered and neither admin content nor the login form is shown until resolution completes.

#### Scenario: Authenticated admin visit

- **WHEN** a user with a valid Supabase session navigates to `/fifaOwner`
- **THEN** the admin fixtures list renders normally.

### Requirement: Email + password login

The admin login screen SHALL collect an email and password and authenticate via `supabase.auth.signInWithPassword`. On success it SHALL navigate to `/fifaOwner`. On failure it SHALL show the Supabase error message without revealing whether the email or password was the wrong field. The login form SHALL disable the submit button while a request is in flight.

#### Scenario: Successful login

- **WHEN** the admin submits a valid email and password
- **THEN** `signInWithPassword` resolves successfully and the user is navigated to `/fifaOwner`.

#### Scenario: Invalid credentials

- **WHEN** the admin submits an incorrect email or password
- **THEN** the login screen remains visible and displays the Supabase-returned error message; the submit button is re-enabled.

#### Scenario: Concurrent submit prevention

- **WHEN** a login request is in flight
- **THEN** the submit button is disabled and a second submission cannot be triggered.

### Requirement: Admin session persistence

The Supabase client SHALL persist the admin session across page reloads using the default browser session storage. On app start, the auth guard SHALL restore the session from storage rather than forcing a re-login on every reload.

#### Scenario: Reload keeps session

- **WHEN** the admin reloads the page on `/fifaOwner/match/:id` after a successful login
- **THEN** the session is restored from storage and the live-match screen renders without re-prompting for credentials.

### Requirement: Sign out from admin

The admin UI SHALL expose a sign-out action that calls `supabase.auth.signOut()`. After sign-out completes, the user SHALL be navigated to `/fifaOwner/login` and the admin fixtures/match content SHALL no longer be accessible without re-authenticating.

#### Scenario: Sign out

- **WHEN** the admin taps the sign-out control
- **THEN** the Supabase session is terminated and the user is redirected to `/fifaOwner/login`.

#### Scenario: Content inaccessible after sign out

- **WHEN** the admin attempts to navigate back to `/fifaOwner` immediately after sign out
- **THEN** the auth guard redirects them to the login screen.

### Requirement: Admin login route

A `/fifaOwner/login` route SHALL be registered in `src/App.tsx` rendering the login screen. When an already-authenticated user visits `/fifaOwner/login`, they SHALL be redirected to `/fifaOwner` instead of seeing the login form.

#### Scenario: Authenticated user visits login route

- **WHEN** a user with a valid session navigates to `/fifaOwner/login`
- **THEN** they are redirected to `/fifaOwner`.

#### Scenario: Route registered

- **WHEN** `src/App.tsx` is inspected
- **THEN** a `Route` for `/fifaOwner/login` exists alongside the existing `/fifaOwner` and `/fifaOwner/match/:id` routes.
