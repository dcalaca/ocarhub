export async function GET() {
  return Response.json({ message: 'API na raiz funcionando!', timestamp: new Date().toISOString() })
}
