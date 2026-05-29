import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { isAlbamedAuthenticated } from "@/app/api/albamed/auth/route"
import { getServices, createService, updateService, deleteService } from "@/lib/db"

const CLIENT_ID = 1

const CreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  category: z.string().trim().max(100).optional(),
  price: z.string().trim().max(100).optional(),
})

const PatchSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1).max(200).optional(),
  category: z.string().trim().max(100).optional(),
  price: z.string().trim().max(100).optional(),
  active: z.union([z.literal(0), z.literal(1)]).optional(),
})

export async function GET(req: NextRequest): Promise<Response> {
  if (!(await isAlbamedAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const search = req.nextUrl.searchParams.get("search") ?? ""
    const services = getServices(CLIENT_ID, search)
    return NextResponse.json({ services })
  } catch (err) {
    console.error("[albamed/services GET]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  if (!(await isAlbamedAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const parsed = CreateSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.issues }, { status: 400 })
    }
    const service = createService(CLIENT_ID, parsed.data)
    return NextResponse.json({ service })
  } catch (err) {
    console.error("[albamed/services POST]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest): Promise<Response> {
  if (!(await isAlbamedAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const parsed = PatchSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.issues }, { status: 400 })
    }
    const { id, ...rest } = parsed.data
    updateService(id, rest)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[albamed/services PATCH]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest): Promise<Response> {
  if (!(await isAlbamedAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const id = parseInt(req.nextUrl.searchParams.get("id") ?? "", 10)
    if (!id || id < 1) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    }
    deleteService(id, CLIENT_ID)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[albamed/services DELETE]", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
