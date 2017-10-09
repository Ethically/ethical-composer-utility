import compose from 'koa-compose'

export const series = (...args) => (
    async (ctx, next = () => {}) => {
        await compose(args)(ctx)
        await next()
    }
)

export const parallel = (...args) => (
    async (ctx, next = () => {}) => {
        const promises = args.map(async fn => await fn(ctx, () => {}))
        await Promise.all(promises)
        await next()
    }
)
