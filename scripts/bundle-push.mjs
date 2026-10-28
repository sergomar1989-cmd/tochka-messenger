import { build } from 'esbuild';
await build({
  entryPoints: ['src/push-send.js'],
  bundle: true,
  platform: 'browser',
  format: 'esm',
  target: 'es2022',
  outfile: 'functions/api/push-send.js',
  logLevel: 'info'
});
