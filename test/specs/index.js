import now from 'performance-now'
import { series, parallel } from '../../src/index.js'

const middleware = (id) => async (ctx, next) => {
    ctx.push(id)
    await next()
    ctx.push(id)
}

const timeBomb = () => (ctx, next) => {
    return new Promise(resolve => {
        setTimeout(() => {
            ctx.push(1)
            next()
            resolve()
        }, 100)
    })
}

describe('compose()', () => {

    it('should call composable middleware serially', async (done) => {
        const resolve = series(
            middleware(1),
            middleware(2),
            middleware(3),
            middleware(4)
        )
        const ctx = []
        await resolve(ctx)
        const order = [ 1, 2, 3, 4, 4, 3, 2, 1 ]
        expect(ctx).toEqual(order)
        done()
    })

    it('should call composable middleware groups serially', async (done) => {
        const groupOne = series(
            middleware(1),
            middleware(2),
            middleware(3),
            middleware(4)
        )
        const groupTwo = series(
            middleware(1),
            middleware(2),
            middleware(3),
            middleware(4)
        )
        const resolve = series(groupOne, groupTwo)
        const ctx = []
        await resolve(ctx)
        const order = [ 1, 2, 3, 4, 4, 3, 2, 1, 1, 2, 3, 4, 4, 3, 2, 1 ]
        expect(ctx).toEqual(order)
        done()
    })

    it('should call composable middleware in parallel', async (done) => {
        const resolve = parallel(
            timeBomb(),
            timeBomb(),
            timeBomb(),
            timeBomb()
        )
        const ctx = []
        const start = now()
        await resolve(ctx)
        const end = now()
        expect(ctx.length).toBe(4)
        expect((end-start).toFixed()).not.toBeGreaterThan(150)
        done()
    })

    it('should call composable middleware parallel groups serially', async (done) => {
        const groupOne = parallel(
            timeBomb(),
            timeBomb(),
            timeBomb(),
            timeBomb()
        )
        const groupTwo = parallel(
            timeBomb(),
            timeBomb(),
            timeBomb(),
            timeBomb()
        )
        const resolve = series(groupOne, groupTwo)
        const ctx = []
        const start = now()
        await resolve(ctx)
        const end = now()
        expect(ctx.length).toBe(8)
        expect((end-start).toFixed()).not.toBeGreaterThan(300)
        done()
    })

    it('should call composable middleware serial groups parallelly', async (done) => {
        const groupOne = series(
            middleware(1),
            middleware(2),
            middleware(3),
            middleware(4)
        )
        const groupTwo = series(
            middleware(1),
            middleware(2),
            middleware(3),
            middleware(4)
        )
        const resolve = parallel(groupOne, groupTwo)
        const ctx = []
        const start = now()
        await resolve(ctx)
        const end = now()
        expect(ctx.length).toBe(16)
        expect((end-start).toFixed()).not.toBeGreaterThan(4)
        done()
    })
})
