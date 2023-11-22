// const server = Bun.serve({
//   port: 3000,
//   fetch(request) {
//     return new Response("Welcome to Bun!");
//   },
// });

// console.log(`Listening on localhost: ${server.port}`);

import server from './server';

/* dotenv is used to load environment variables from a .env file */
(() => {
  try {
    server();
  } catch (error) {
    process.exit(1);
  }
})();
