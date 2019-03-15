

const Koa = require('koa');
const Router = require('koa-router');
const koaStatic = require('koa-static');
const koaWebpack = require('koa-webpack');
const webpackConfig = require('./webpack.config.js')

const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 5001
registerApp();
async function registerApp (){
    app.use(async (ctx, next) => {
        ctx.path = ctx.path.replace("//", "/")
        await next();
    });  
    try{
        app.use(router.routes());
        app.use(router.allowedMethods());
        app.use(koaStatic('public'));
        await registerWebpack();
        app.listen(PORT);
        console.log('开发环境服务器启动于端口号', PORT, '等待 webpack 编译中，请稍候。\n\n')
    }catch(e){
        console.log(e)
        console.log('开发环境服务器启动失败\n\n')
    }

}
async function registerWebpack() {
    return new Promise(resolve => {
        koaWebpack({
            config: webpackConfig,
            devMiddleware: {
                //stats: 'minimal'
            },
			hotClient: {
				allEntries: true
			}
        }).then(middleware => {
            app.use(middleware)
            resolve()
        })
    })
}

// import Co from 'co'
// import Path from 'path'
// import Render from 'koa-ejs'
// import Router from 'koa-router'
// import Static from 'koa-static'
// import Less from 'less'
// import Fs from 'fs'
// import ETag from 'etag'
// import Fetch from './fetch'
// import Config from './config/index'
// import QueryString from 'querystring'
// import { getCtnType, varify, collectTime, setcookie } from './tools'
// import { sendError, apiResError } from './mail/mail.tool'
// import Watch from './watcher'
// //配置webpack
// import webpack from 'webpack'
// import koaWebpack from 'koa-webpack'
// import webpackMiddleware from 'webpack-koa2-middleware'
// import hotMiddleware from 'koa2-hmr-middleware'


/*
const app = new Koa()
app.use(async (ctx, next) => {
    ctx.path = ctx.path.replace("//", "/")
    await next();
});
app.use(Static(__dirname+'/public'));

if (Config.env == "dev") {
    const devConfig = require('./webpack.config.js');
    const compiler = webpack(devConfig)
    app.use(webpackMiddleware(compiler, {
        // publicPath is required, whereas all other options are optional
        noInfo: false,
        // display no info to console (only warnings and errors)
        quiet: false,
        // display nothing to the console
        lazy: true,
        // switch into lazy mode
        // that means no watching, but recompilation on every request
        watchOptions: {
            aggregateTimeout: 300,
            poll: true
        },
        // watch options (only lazy: false)
        filename:devConfig.output.filename,
        publicPath: devConfig.output.publicPath,
        // public path to bind the middleware to
        // use the same as in webpack
        // the index path for web server
        headers: { "X-Custom-Header": "yes" },
        // custom headers
        stats: {
            colors: true
        },
        // options for formating the statistics
        reporter: null,
        // Provide a custom reporter to change the way how logs are shown.
        serverSideRender: false,
        // Turn off the server-side rendering mode. See Server-Side Rendering part for more info.
    }));
    app.use(hotMiddleware(compiler, {
        log: console.log,
        path: '/__webpack_hmr',
        heartbeat: 2000
    }))
}

if (Config.env === 'production') {
    collectTime(app);
}
const PORT = process.env.PORT || 5001
let [modifiedCache, eTagCache, moduleCache, manifest, webpackMainfest] = [{}, {}, {}, {}, {}]

// manifest
if (Config.env == 'production') {
    try {
        manifest = require(`${Config.STATIC_ROOT}/release/rev-manifest.json`);
        webpackMainfest = require(`${Config.STATIC_ROOT}/dist/rev-manifest.json`);
    } catch (e) {
        console.log(`Require rev-manifest.json error:${Config.STATIC_ROOT}/release/rev-manifest.json`)
    }
}

if (Config.env === "test"){
    try {
        webpackMainfest = require(`${Config.STATIC_ROOT}/dist/rev-manifest.json`);
    } catch (e) {
        console.log(`Require rev-manifest.json error:${Config.STATIC_ROOT}/release/rev-manifest.json`)
    }
}

if (!Config.debug) {
    // require all controllers module
    let files = Fs.readdirSync(Config.CONTROLLERS_ROOT)
    for (const file of files) {
        let filePath = Config.CONTROLLERS_ROOT + '/' + file
        try {
            moduleCache[file] = require(filePath)
        } catch (e) {
            console.log(`Require controllers error:${e}`)
        }
    }
}

// set router
const router = new Router()

router.all('/:biz/proxy/*', async ctx => {
    console.log(ctx.path, 2)
    const cbk = async () => {
        let path = ctx.path
        let paths = path.slice(1).split('/')
        let id = paths.pop()
        let fn = paths.pop()
        let filePath = `${Config.CONTROLLERS_ROOT}/${paths.join('/')}.js`
        let stats = Fs.statSync(filePath)
        if (stats.isFile()) {
            const nodeModule = require(filePath)
            ctx.fetch = Fetch(ctx)
            ctx.config = Config
            ctx.uinfo = {}
            // 业务相关的逻辑
            addClient(ctx.params.biz,ctx);
            ctx.addPrivateClient = addPrivateClient(ctx);
            ctx.varify = varify(ctx)
            try {
                await nodeModule[fn].call(ctx, id)
            } catch (error) {     
                if(error.code === 'ECONNRESET'){
                    sendError(error, ctx, Config, 'PROXY PATH ERROR', null);
                    return;
                }  
                try {
                    if(error.error || error.type){
                        apiResError(error, ctx, Config, 'PROXY PATH ERROR', null);
                    }else{
                        sendError(error, ctx, Config, 'PROXY PATH ERROR', null);
                    }
                } catch (error) {
                    console.log("apiServer error:"+error);
                }
                return ctx.body = {
                    code: -1,
                    message: '系统存在问题 请截图反馈'
                }
            }
        }
    }

    if (ctx.method === 'POST') {
        await (new Promise((resolve, reject) => {
            let chunks = ''
            ctx.req.addListener('data', chunk => {
                chunks += chunk;
                chunks.length > 1e6 && ctx.req.connection.destroy()
            })
                .addListener('end', () => {
                    resolve(QueryString.parse(chunks))
                })
                .addListener('error', msg => {
                    reject(msg)
                })
        }))
            .then(async res => {
                ctx.query = Object.assign({}, ctx.query, res)
                await cbk()
            })
    } else {
        await cbk()
    }
})
app.use(async (ctx, next) => {
    ctx.sendbody = sendbody(ctx);
    await next();
});
app.use(router.routes())
router.get('/*', async ctx => {
    console.log(ctx.path, 1)
    ctx.response.redirect('/html/404.html')
})

const aa = app.listen(PORT,()=>{
    console.log(aa.address())
})
console.log(`launch on port ${PORT}`)


const addPrivateClient = (ctx) => { //异步接口proxy，主动添加client
    return (client) => {
        ctx.uinfo.client = client;
    }
}
function addClient(path,ctx){
    switch (path) {
        case 'b-loan':
            ctx.uinfo.client = 'carloan_h5'
            break
        case 'new-car':
            ctx.uinfo.client = 'newcar_h5'
            break
        case 'loan-post':
            ctx.uinfo.client = 'loan-post'
            break
        case 'cbl':
            ctx.uinfo.client = 'newcar_h5'
            break
        case 's-store':
            let _entry_s = ctx.cookies.get("submit_entry");
            if(_entry_s === 'GAP'){
                ctx.uinfo.client = 'gap_h5'
            }else if(_entry_s === "XCB"){
                ctx.uinfo.client = 'newcar_h5'
            }else{
                // 超级宝进件 "XSB"
                ctx.uinfo.client = 'superpal_h5'
            }
            break
        case 'terminal':
            ctx.uinfo.client = 'newcar_h5'
            break
        case 'uman':
            ctx.uinfo.client = 'ustar_h5'
            break
        case 'uxin':
            ctx.uinfo.client = 'uxin_h5'
            break
        case 'finance':
            ctx.uinfo.client = 'carresume_h5'
            break
        case 'valetpay':
            ctx.uinfo.client = 'valetpay_h5'
            break
        case 'cash':
            ctx.uinfo.client = 'cash_h5'
            break
        case 'b-car':
            let submit_entry = ctx.cookies.get("submit_entry");
            if(submit_entry === "XSB"){
                ctx.uinfo.client = 'superpal_h5'
            }else if(submit_entry === "B"){
                ctx.uinfo.client = 'b_h5'
            }else{
                ctx.uinfo.client = 'b_h5'
                // throw "登陆态有误";
            }
            break
        case 'service':
            let _entry = ctx.cookies.get("submit_entry");
            if (_entry === "XSB") {
                ctx.uinfo.client = 'superpal_h5'
            } else if (_entry === "XCB") {
                ctx.uinfo.client = 'newcar_h5'
            } else if (_entry === 'FWB'){
                ctx.uinfo.client = 'newcar_h5'
            }else {
                ctx.uinfo.client = 'newcar_h5'
                // throw "登陆态有误";
            }
            break
        default:
            ctx.uinfo.client = 'carloan_h5'
    }
}
function sendbody(ctx) {
    //处理异步报错；
    return (data) => {
        if (ctx.query.showmedata == 1) {
            //异步接口报错
            if(Config.env === 'test' || Config.env === 'dev'){
                if (!data.hasOwnProperty("url")) data.url = ctx.proxyUrl;
            }
            return ctx.body = data;
        } else {
            if (data.error == true) {
                try {
                    apiResError(data.status, ctx, Config, 'PROXY SERVER ERROR', data.response);
                } catch (error) {
                    console.log("apiFetch error:"+error);
                }
                return ctx.body = {
                    code: -1,
                    message: '系统存在问题 请截图反馈'
                }
                //服务器出错；
            } else {
                return ctx.body = data;
            }
        }
    }
}
if (!('toJSON' in Error.prototype)) {
    Object.defineProperty(Error.prototype, 'toJSON', {
        value: function () {
            var alt = {};

            Object.getOwnPropertyNames(this).forEach(function (key) {
                alt[key] = this[key];
            }, this);

            return alt;
        },
        configurable: true,
        writable: true
    });
}

app.on("error", function (error, ctx) {
    if (ctx.path == '/favicon.ico') return;
    sendError(error, ctx, Config, 'APP CATCH ERROR', null);
});
*/