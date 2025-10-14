import {setupWorker} from 'msw/browser';

// @ts-ignore
// const modules = require.context('./modules', true, /\.ts$/);
const modules = require.context('../modules', true, /mocks\/.*\.ts$/);
const handlers = modules.keys().map((key: any) => (modules(key) as { default: any }).default);
export const worker = setupWorker(
  ...handlers.flatMap((module: { apis: any[] }) => module),
);

