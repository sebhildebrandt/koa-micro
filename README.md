# koa-micro
Microservice framework based on koa

```
    ____  _                  __         _
   / __ \| | _____   __ _   / / __ ___ (_) ___ _ __ ___
  / / _` | |/ / _ \ / _` | / / '_ ` _ \| |/ __| '__/ _ \
 | | (_| |   < (_) | (_| |/ /| | | | | | | (__| | | (_) |
  \ \__,_|_|\_\___/ \__,_/_/ |_| |_| |_|_|\___|_|  \___/
   \____/

     TypeScript Microservice Framework - based on koa

```

## Quick Start

This package provides a simple to use [koa][koa-url] based minimalistic micro service template. A few common used middleware packages are already included. To keep it small as possible, we added some own tiny libraries like CORS, JWT and auto routes. Included middleware/libs:

- basic router
- auto router
- body parser
- CORS
- JWT
- static files serving
- health API endpoint
- graceful shutdown

Configuration is super simple and lets you create your micro service within minutes.

## Installation

```bash
$ npm install @koa/micro
```

## Usage

Here some examples how you can use @koa/micro. Depending on your use case most of the things here are optional and only required if you want to use them:

```ts
import { app } from '@koa/micro';
import Application from 'koa';

// enable helmet (optional)
app.health('/health');

// enable cors (optional)
app.cors();

// set up static server (optional)
app.static(path.join(__dirname, '/static'));

// using router
const router: any = app.newRouter();

router.get('/route', (ctx: Application.Context, next: Application.Next) => {
  ctx.body = 'OK from static route';
});

app.useRouter(router);

// gracefull shutdown (optional)
app.gracefulShutdown();

app.start(3000);
```

### Examples

The example in the path `examples` shows how to use `@koa/micro` and

- enable helmet
- enable cors
- serving static pages
- using standard router
- using auto routes

#### Building Example App

```
git clone https://github.com/sebhildebrandt/koa-micro.git
cd koa-micro
npm install
npm run build-example
npm run example
```

Now try the following routes in your browser:

Static Page:
- `http://localhost:3000/`

Standard Routes
- `http://localhost:3000/route`
- `http://localhost:3000/route2``

Routes from autoRouter
- `http://localhost:3000/api/v1/`
- `http://localhost:3000/api/v1/hello/`
- `http://localhost:3000/api/v1/resource/?param=value`

## Advanced usage

As `@koa/micro` uses some external apps, you can alo refer to those packages to see the options:

- [koa-router][koa-router-url]
- [koa-static][koa-static-url]
- [http-graceful-shutdown][gracefulShutdown-url]
- [koa-helmet][koa-helmet-url]

## License [![MIT license][license-img]][license-url]

>The [`MIT`][license-url] License (MIT)
>
>Copyright &copy; 2021 Sebastian Hildebrandt, [+innovations](http://www.plus-innovations.com).
>
>Permission is hereby granted, free of charge, to any person obtaining a copy
>of this software and associated documentation files (the "Software"), to deal
>in the Software without restriction, including without limitation the rights
>to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
>copies of the Software, and to permit persons to whom the Software is
>furnished to do so, subject to the following conditions:
>
>The above copyright notice and this permission notice shall be included in
>all copies or substantial portions of the Software.
>
>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
>IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
>FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
>AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
>LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
>OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
>THE SOFTWARE.
>
>Further details see [LICENSE](LICENSE) file.

[license-url]: https://github.com/sebhildebrandt/systeminformation/blob/master/LICENSE
[license-img]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square
[koa-url]: https://github.com/koajs/koa

[koa-static-url]: https://github.com/koajs/static
[gracefulShutdown-url]: https://github.com/sebhildebrandt/http-graceful-shutdown
[koa-router-url]: https://github.com/koajs/router
[koa-helmet-url]: https://github.com/venables/koa-helmet
