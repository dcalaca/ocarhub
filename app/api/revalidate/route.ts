import { type NextRequest, NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get("path")

    if (!path) {
      return NextResponse.json({ error: "Path parameter is required" }, { status: 400 })
    }

    revalidatePath(path)

    return NextResponse.json({
      success: true,
      message: `Path ${path} revalidated successfully`,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Revalidation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to revalidate",
      },
      { status: 500 },
    )
  }
}
