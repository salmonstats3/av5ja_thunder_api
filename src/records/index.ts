import { HTTPMethod } from '@/enums/method'
import { CoopRecordModel } from '@/models/coop_record.dto'
import type { Bindings } from '@/utils/bindings'
import { OpenAPIHono as Hono, createRoute, z } from '@hono/zod-openapi'
import { HTTPException } from 'hono/http-exception'

export const app = new Hono<{ Bindings: Bindings }>()

app.openapi(
  createRoute({
    method: HTTPMethod.POST,
    security: [{ AuthorizationApiKey: [] }],
    path: '/',
    tags: ['記録'],
    summary: '作成',
    description: 'サーモンランのレコードを追加します',
    request: {
      body: {
        content: {
          'application/json': {
            schema: CoopRecordModel
          }
        }
      }
    },
    responses: {
      200: {
        type: 'application/json',
        description: 'アセットURL一覧'
      }
    }
  }),
  async (c) => {
    const body = c.req.valid('json')
    console.log(body)
    // return c.status(201)
    return c.json(body, 201)
  }
)
