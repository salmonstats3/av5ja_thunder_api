import { HTTPMethod } from '@/enums/method'
import { resource } from '@/middleware/resource.middleware'
import { CoopResultQuery } from '@/models/coop_result.dto'
import { BadRequestResponse } from '@/utils/bad_request.response'
import type { Bindings } from '@/utils/bindings'
import { KV } from '@/utils/kv'
import { Prisma } from '@/utils/prisma'
import { OpenAPIHono as Hono, createRoute, z } from '@hono/zod-openapi'

export const app = new Hono<{ Bindings: Bindings }>()

app.openapi(
  createRoute({
    method: HTTPMethod.POST,
    middleware: [resource],
    path: '/',
    tags: ['リザルト'],
    summary: '一覧詳細',
    description: 'リザルト一覧詳細を返します',
    request: {
      body: {
        content: {
          'application/json': {
            schema: CoopResultQuery.CoopHistory.openapi({
              description: 'CoopHistoryQuery+CoopHistoryDetailQuery'
            })
          }
        }
      }
    },
    responses: {
      201: {
        content: {
          'application/json': {
            schema: CoopResultQuery.CoopResult.openapi({})
          }
        },
        description: 'リザルト一覧詳細'
      },
      ...BadRequestResponse
    }
  }),
  async (c) => {
    const body: CoopResultQuery.CoopHistory = c.req.valid('json')
    const results: CoopResultQuery.CoopResult[] = body.histories.flatMap((history) =>
      history.results.map((result) => CoopResultQuery.CoopResult.parse(result))
    )
    c.executionCtx.waitUntil(Promise.all(results.map((result) => KV.RESULT.set(c.env, result))))
    c.executionCtx.waitUntil(Promise.all(results.map((result) => Prisma.create(c, result))))
    return c.json(body)
  }
)

app.openapi(
  createRoute({
    method: HTTPMethod.GET,
    path: '/',
    tags: ['リザルト'],
    summary: '一覧詳細',
    description: 'リザルト一覧詳細を返します',
    request: {},
    responses: {
      200: {
        content: {
          'application/json': {
            schema: CoopResultQuery.CoopResult.openapi({})
          }
        },
        description: 'リザルト一覧詳細'
      },
      ...BadRequestResponse
    }
  }),
  async (c) => {
    // const prisma = Prisma(c.env.DATABASE_URL)
    // console.log(prisma)
    return c.json({})
  }
)
