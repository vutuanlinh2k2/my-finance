import { createFileRoute } from '@tanstack/react-router'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'
const ALLOWED_TARGET_PREFIXES = ['/coins/', '/simple/price?', '/search?']

function isAllowedTarget(target: string): boolean {
  return ALLOWED_TARGET_PREFIXES.some((prefix) => target.startsWith(prefix))
}

export const Route = createFileRoute('/api/coingecko')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url)
        const target = url.searchParams.get('target')

        if (!target || !isAllowedTarget(target)) {
          return Response.json(
            { error: 'Invalid CoinGecko target' },
            { status: 400 },
          )
        }

        const upstreamResponse = await fetch(`${COINGECKO_API_URL}${target}`, {
          headers: {
            accept: 'application/json',
          },
        })

        const headers = new Headers()
        headers.set(
          'content-type',
          upstreamResponse.headers.get('content-type') ?? 'application/json',
        )

        const cacheControl = upstreamResponse.headers.get('cache-control')
        headers.set(
          'cache-control',
          cacheControl ?? 'public, max-age=60, s-maxage=60',
        )

        return new Response(await upstreamResponse.text(), {
          status: upstreamResponse.status,
          headers,
        })
      },
    },
  },
})
