import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

async function prepare(): Promise<void> {
  if (isDevMode()) {
    const { startMockBackend } = await import('./mocks/browser');
    await startMockBackend();
  }
}

prepare()
  .then(() => bootstrapApplication(App, appConfig))
  .catch((err) => console.error(err));
