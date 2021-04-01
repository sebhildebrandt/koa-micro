import { app, Application, KoaMicro, logLevel } from '../../dist/index';
import * as path from 'path';

// setting variables only for demo purposes.
// You can set this as environment variables
process.env.APP_NAME = 'example-service';
process.env.VERSION = '1.0.0';

// enable helpth endpoint (defaults to /health)
app.health();

// enable helmet (optional)
app.helmet();

// enable cors (optional)
app.cors();

// catch uncatched errors - must be 'used' before adding routes
app.catchErrors();

// set up static server (optional)
app.static(path.join(__dirname, '/public'));

// using router
const router: any = app.newRouter();

router.get('/route', (ctx: Application.Context, next: Application.Next) => {
  ctx.body = 'OK from static route';
});

router.get('/route2', (ctx: Application.Context, next: Application.Next) => {
  ctx.body = 'This is static route 2';
});

app.useRouter(router);

// using autoRoute: use all routes in path /routes and mount it to /api/v1
app.autoRoute(path.join(__dirname, '/routes'), '/api/v1');

// initialize logger
app.logger({
  level: logLevel.all  // highest level, log all
});

// get command line arguments with alias (example) - see docs
app.parseArgs({
  v: 'verbose'             // alias - alternative arg
});

// gracefull shutdown (optional)
app.gracefulShutdown({
  finally: () => {
    console.log();
    app.log.info('Server gracefully terminated');
  }
});

app.start(3000);
app.log.trace('Server started');
app.log.trace('Mode: ' + (app.development ? 'Development' : 'Production'));
