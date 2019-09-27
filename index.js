const Koa = require('koa')
const Router = require('koa-router')
const path = require('path')
const staticFiles = require('koa-static')
const fs = require('fs')
const app = new Koa();
const server = require('http').createServer(app.callback())
const io = require('socket.io')(server)
const history = require('koa2-history-api-fallback')
const cors = require('koa2-cors');
const bodyParser = require('koa-bodyparser')

const router = new Router()

app.use(bodyParser());
app.use(cors());

const airticleList = []

router.get('/', (ctx, next) => {
  ctx.type = 'text/html'
  ctx.body = fs.createReadStream('./fe/teamwork-note/dist/index.html')
})

router.post('/api/airticle', (ctx, next) => {
  const obj = ctx.request.body;

  airticleList.splice(ctx.request.body.id, 1, obj);
  ctx.body = {
    code: 1,
    data: {
      id: obj.id,
    }
  }
})
router.post('/api/create_airticle', (ctx, next) => {
  const obj = {
    id: airticleList.length,
  }
  airticleList.push(obj);
  ctx.body = {
    code: 1,
    data: {
      id: obj.id,
    }
  }
})
router.get('/api/airticle', (ctx, next) => {
  console.log('ctx.query.id :', ctx.query.id);
  ctx.body = {
    code: 1,
    data: airticleList[ctx.query.id],
  }
})
router.get('/api/airticleList', (ctx, next) => {
  ctx.body = {
    code: 1,
    data: {
      airticle_list: airticleList,
    }
  }
})
router.post('/api/delete_airticle', (ctx, next) => {
  const deleteItem = airticleList.splice(ctx.request.body.id, 1);
  ctx.body = {
    code: 1,
    data: {
      delete_list: deleteItem,
    }
  }
})
app.use(staticFiles(path.resolve(__dirname, './static')))
app.use(router.routes())
// 前端(vue)路由
// 所有 navigate 请求重定向到 '/'
app.use(history({
  htmlAcceptHeaders: ['text/html'],
  index: '/',
  verbose: true
}));
// let message = "";
io.on('connection', (socket) => {
  console.log('用户连接');
  // if (message) {
  //   io.emit('changeMessage', message);
  // }
  socket.on('changeMessage', msg => {
    console.log('msg :', msg);
    message = msg;
    io.emit('changeMessage', msg);
  })
  socket.on('disconnect', () => {
    console.log('用户离开');
  })
})
server.listen(3000, () => {
  console.log('listening on 3000');
});