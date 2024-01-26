const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const koaBody = require('koa-body');
const webPush = require('web-push');

const app = new Koa();
const router = new Router();
const vapidKeys = webPush.generateVAPIDKeys();

webPush.setVapidDetails(
    'mailto:hoge@fuga.piyo', // 第一引数は'mailto:～'というフォーマットでないとだめらしい
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

router
    .get('/key', ctx => {
        ctx.body = vapidKeys.publicKey;
    })
    .post('/webpushtest', koaBody(), async ctx => {
        try {
            setTimeout(_ => { // ちょっと遅延させて通知
                await webPush.sendNotification(ctx.request.body, JSON.stringify({
                    title: 'Web Push通知テスト',
                }));
            }, 5000);
        } catch (err) {
            console.log(err);
        }
    });

app
    .use(serve(__dirname + '/public'))
    .use(router.routes())
    .use(router.allowedMethods());

app.listen(3000);
