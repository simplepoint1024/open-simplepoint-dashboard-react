import {setupWorker} from 'msw/browser';
import {handlers} from "../../../../mocks";

export default setupWorker(
  ...handlers
).start()