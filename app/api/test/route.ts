export async function GET() {
  return Response.json({ message: 'API funcionando!', timestamp: new Date().toISOString() })
}