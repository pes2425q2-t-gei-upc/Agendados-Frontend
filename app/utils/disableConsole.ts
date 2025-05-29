// utils/disableConsole.ts
// Deshabilitar console logs en producción

/* eslint-disable no-console */
if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}
/* eslint-enable no-console */
