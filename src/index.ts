import server from './server';

(() => {
  try {
    server();
  } catch (error) {
    process.exit(1);
  }
})();
