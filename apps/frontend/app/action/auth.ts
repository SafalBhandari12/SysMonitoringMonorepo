export async function loginAction(prevState: any, fomrData: FormData) {
  const email = fomrData.get("email")
  const password = fomrData.get("password")
  const res = await fetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    credentials: "include",
  })
  if (!res.ok) {
    throw new Error("Login failed")
  }
  return { success: true }
}
