import { createAuthClient } from "better-auth/react"

const client = createAuthClient({
  baseURL: "http://localhost:3000",
  // Node fetch tidak mengirim Origin otomatis seperti browser
  fetchOptions: { headers: { Origin: "http://localhost:3000" } },
})

async function main() {
  // Bentuk yang DIPAKAI halaman login sekarang
  const login = await client.signIn.email({
    email: "admin@test.com",
    password: "password123",
  })
  console.log(
    "signIn.email(...) ->",
    "error=", login.error?.message ?? "null",
    "| role=", login.data?.user?.role,
    "| name=", login.data?.user?.name
  )

  // Bentuk yang DIPAKAI halaman register (email unik baru)
  const signup = await client.signUp.email({
    name: "Register Check",
    email: `regcheck-${Date.now()}@test.com`,
    password: "password123",
  })
  console.log(
    "signUp.email(...) ->",
    "error=", signup.error?.message ?? "null",
    "| role=", signup.data?.user?.role
  )

  // Salah password harus error object (untuk pesan di UI), bukan throw
  const wrong = await client.signIn.email({
    email: "admin@test.com",
    password: "salah-banget",
  })
  console.log("wrong password ->", "error=", wrong.error?.message ?? "null", "| data=", wrong.data)
}

main().catch((e) => console.error("ERR", e))
