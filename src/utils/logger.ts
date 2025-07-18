export const devLog = import.meta.env.DEV
  ? console.error.bind(console)
  : () => {};
