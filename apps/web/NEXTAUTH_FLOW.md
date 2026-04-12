# NextAuth.js: Complete Authentication Flow

## What is NextAuth.js?

NextAuth.js is an authentication library for Next.js that:

- Handles OAuth/social login (Google, GitHub, etc.)
- Manages user sessions automatically
- Provides middleware integration for protecting routes
- Stores user data in a database

Think of it as **the plumbing that connects your app to OAuth providers and manages "who is logged in?"**

---

## The Complete Flow: Step-by-Step

### Step 1: User Clicks "Sign in with Google"

```
Your App                    Google OAuth Server
  User clicks button
        ↓
  Browser redirected to Google
      signin page
        ↓
  Google OAuth page shown
  (user enters email/password)
```

Your app has a button that triggers NextAuth's built-in signin:

```tsx
import { signIn } from "next-auth/react";

<button onClick={() => signIn("google")}>Sign in with Google</button>;
```

---

### Step 2: Google Authenticates User & Returns Auth Code

```
Google OAuth Server
  ↓
User enters credentials + approves
  ↓
Google generates authorization code
  ↓
Google redirects back to your app:
  http://localhost:3000/api/auth/callback/google?code=ABC123&state=XYZ
```

This is an automatic redirect initiated by Google.

---

### Step 3: NextAuth Exchanges Authorization Code for User Profile

NextAuth intercepts the callback URL at `/api/auth/callback/google`:

```
NextAuth Middleware
  ↓
Receives authorization code from Google
  ↓
Calls Google API: "Exchange this code for user data"
  ↓
Google returns user profile:
{
  id: 'google_user_id_123',
  email: 'safalbhandari069@gmail.com',
  name: 'Safal Bhandari',
  image: 'https://lh3.googleusercontent.com/...'
}
  ↓
NextAuth now has user profile data
```

---

### Step 4: Database Adapter Checks: User Exists?

NextAuth uses your Prisma adapter to check the database:

```
Prisma Adapter
  ↓
Query DB: SELECT * FROM User WHERE email = 'safalbhandari069@gmail.com'
  ↓
  ├─ YES (returning user) → Fetch existing user record from DB
  │                      →  Skip to Step 5
  │
  └─ NO (new user) → Run the createUser event → Insert new record:
                      {
                        id: 'unique_id',
                        email: 'safalbhandari069@gmail.com',
                        name: 'Safal Bhandari',
                        image: 'https://...',
                        onboarded: false,  ← New users default to false
                        createdAt: 2026-04-12,
                        ...
                      }
```

The `createUser` event fires **after** the user is inserted:

```ts
// auth.ts
events: {
  async createUser({ user }) {
    console.log(`New user created: ${user.email}`);
    // You could do post-signup actions here
  }
}
```

---

### Step 5: `signIn` Callback Runs (Custom Logic Gate)

Before proceeding, NextAuth runs your custom `signIn` callback:

```ts
// auth.ts
callbacks: {
  async signIn({ user, account, profile }) {
    // Example: Allow or deny based on email domain
    if (!user.email?.endsWith("@company.com")) {
      return false;  // Sign-in denied
    }
    return true;  // Sign-in allowed
  }
}
```

If you return `false`, NextAuth redirects to `/api/auth/error?error=AccessDenied` (user not allowed). If `true`, continue to Step 6.

---

### Step 6: `jwt()` Callback Encodes User Data into Token

NextAuth takes the user data and encodes it into a JWT token:

```ts
// auth.ts
callbacks: {
  async jwt({ token, user, account }) {
    // On initial signin, 'user' is populated
    if (user) {
      token.id = user.id;
      token.email = user.email;
      token.onboarded = (user as any).onboarded ?? false;
    }
    return token;
  }
}
```

Result: JWT token containing:

```ts
{
  id: 'unique_id',
  email: 'safalbhandari069@gmail.com',
  onboarded: false,
  iat: 1712973754,      // issued at
  exp: 1713060154,      // expires at (24 hours later)
  jti: 'unique_token_id'
}
```

**Why encode into a token?** So that the user data travels **with each request** without needing a database query.

---

### Step 7: JWT Token Encrypted & Stored in Cookie

NextAuth automatically encrypts the JWT and stores it in an **HTTP-only cookie**:

```
Browser Cookie Storage
  ├─ Cookie Name: __Secure-next-auth.session-token
  ├─ Cookie Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (encrypted)
  ├─ HTTP-Only: YES ✅ (JavaScript can't access it)
  ├─ Secure: YES ✅ (Only sent over HTTPS)
  ├─ Same-Site: Strict ✅ (Protection against CSRF)
  └─ Expires: 2026-04-13T01:02:34Z
```

**Why HTTP-Only?** Protects against XSS attacks (JavaScript can't steal the token).

---

### Step 8: Browser Redirects to App; Cookie Sent with Request

Google redirects back to your app:

```
Google → Browser
Browser redirects to: http://localhost:3000/dashboard
Request includes cookie:
  Cookie: __Secure-next-auth.session-token=eyJhbGciOiJIUzI1NiI...
```

---

### Step 9: Middleware Decodes JWT from Cookie into `req.auth`

Every request flows through your middleware (defined in `proxy.ts`):

```ts
// proxy.ts (your middleware)
export const proxy = auth((req) => {
  // NextAuth automatically:
  // 1. Extracts JWT from cookie
  // 2. Verifies the signature (hasn't been tampered with)
  // 3. Decrypts the token
  // 4. Puts decoded data into req.auth

  console.log(req.auth?.user?.onboarded); // Now available!

  // Check if user is onboarded
  const isOnboarded = (req.auth?.user as any)?.onboarded;

  // Redirect new users to signup
  if (req.auth && !isOnboarded && req.nextUrl.pathname !== "/signup") {
    return NextResponse.redirect(new URL("/signup", req.nextUrl.origin));
  }

  return NextResponse.next();
});
```

`req.auth` now contains:

```ts
req.auth = {
  user: {
    id: "unique_id",
    email: "safalbhandari069@gmail.com",
    onboarded: false,
  },
  expires: "2026-04-13T01:02:34Z",
};
```

**No database query needed!** The data was already in the token.

---

### Step 10: Client Components Access Session via `useSession()`

When a React component calls `useSession()`:

```tsx
"use client";
import { useSession } from "next-auth/react";

export default function MyComponent() {
  const { data: session } = useSession();

  console.log(session?.user?.onboarded); // Available here too!
}
```

This triggers the `session()` callback:

```ts
// auth.ts
callbacks: {
  async session({ session, token }) {
    // Return data that should be available in components
    if (session?.user) {
      (session.user as any).id = token.id;
      (session.user as any).onboarded = token.onboarded;
    }
    return session;
  }
}
```

Result in component:

```ts
session = {
  user: {
    id: "unique_id",
    email: "safalbhandari069@gmail.com",
    onboarded: false,
  },
  expires: "2026-04-13T01:02:34Z",
};
```

---

### Step 11: Token Refresh (Happens Automatically)

When the token is about to expire (or on each request in some configurations), NextAuth runs the `jwt()` callback again:

```ts
callbacks: {
  async jwt({ token, user, account, trigger }) {
    // trigger = 'update', 'signIn', 'signUp', or undefined

    if (trigger === 'update') {
      // Token being refreshed; re-encode fresh data
      token.onboarded = /* fetch latest from somewhere */;
    }
    return token;
  }
}
```

New cookie sent with updated data. This is transparent to the user.

---

## Visual Overview: The Complete Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    1. User Clicks "Sign In"                 │
│              (redirected to Google OAuth page)               │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│            2. User Authenticates w/ Google                  │
│           (enters email/password, approves access)          │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│        3. Google Returns Authorization Code                 │
│        (redirects to /api/auth/callback/google)             │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│   4. NextAuth Exchanges Code for User Profile               │
│      (calls Google API, receives user data)                 │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│    5. Prisma Adapter Checks Database                        │
│    ├─ New User? → Create record                             │
│    └─ Returning User? → Fetch record                        │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│    6. signIn Callback Runs (Custom Auth Gate)               │
│       Return true = allow, false = deny                     │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│    7. jwt Callback Encodes User Data                        │
│       {id, email, onboarded, iat, exp, ...}                 │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│    8. JWT Encrypted & Stored in HTTP-Only Cookie           │
│       __Secure-next-auth.session-token = encrypted_jwt      │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│    9. Browser Redirects Back to App                         │
│       (Cookie sent with every subsequent request)           │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│    10. Middleware Decodes JWT into req.auth                 │
│        Can access: req.auth?.user?.onboarded                │
│        Can redirect non-onboarded users to /signup          │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│    11. Client Components Use useSession()                   │
│        session.user?.onboarded available in React           │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Concepts Explained

### **Callbacks** (Custom Logic Hooks)

Callbacks let you customize how NextAuth behaves:

| Callback   | When It Runs                       | What You Can Do                          |
| ---------- | ---------------------------------- | ---------------------------------------- |
| `signIn`   | Before user is allowed to sign in  | Allow/deny based on email, role, etc.    |
| `jwt`      | When creating/updating JWT token   | Decide what data to encode in the token  |
| `session`  | When client requests session data  | Customize what appears in `useSession()` |
| `redirect` | When redirecting after auth action | Control where user goes after signin     |

---

### **Adapters** (Database Integration)

Adapters connect NextAuth to your database. Your app uses `PrismaAdapter`:

```ts
// auth.ts
import { PrismaAdapter } from "@auth/prisma-adapter";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma), // ← This manages DB operations
  providers: [Google],
});
```

The adapter automatically creates/updates:

- **User** — User account data (id, email, name, image, onboarded, etc.)
- **Account** — Links OAuth account to User (google_id, provider, etc.)
- **Session** — Optional session storage (only if using DB session strategy)
- **VerificationToken** — For email verification flows

---

### **Session Strategies**

#### JWT Strategy (Default, Recommended)

```
User data encoded in JWT
    ↓
Token stored in cookie
    ↓
Sent with every request
    ↓
Decoded in middleware (no DB query needed)
```

**Pros:**

- ✅ Stateless (no server session storage needed)
- ✅ Scalable (decoding is fast)
- ✅ Distributed (works across multiple servers)

**Cons:**

- ❌ Token size impacts cookie size
- ❌ Real-time DB changes don't auto-update (user sees stale data until token refreshes)

#### Database Strategy

```
Session stored in database
    ↓
Cookie contains only session ID
    ↓
Sent with every request
    ↓
Use session ID to look up session in DB
```

**Pros:**

- ✅ Real-time data (always reads fresh from DB)
- ✅ Small token size

**Cons:**

- ❌ Slower (DB query per request)
- ❌ Not scalable (high DB load)
- ❌ Server costs increase

Your app uses **JWT strategy by default**.

---

### **`req.auth` vs `useSession()`**

```
Middleware (Server)           Client Component (Browser)
     ↓                                 ↓
req.auth available        useSession() available
     ↓                                 ↓
Never use useSession()    Never use req.auth
```

| Context        | Use                                | Available In           |
| -------------- | ---------------------------------- | ---------------------- |
| `req.auth`     | Server-side auth checks, redirects | Middleware only        |
| `useSession()` | Client-side UI rendering           | Client components only |
| `req.session`  | ❌ Does not exist                  | ❌ Nowhere             |

---

## Your Onboarding Flow: The Complete Picture

### User Signs Up for First Time

```
1. User clicks "Sign in with Google"
        ↓
2. Google returns user data
        ↓
3. NextAuth creates new User record with onboarded: false
        ↓
4. JWT encoded with onboarded: false
        ↓
5. Cookie set in browser
        ↓
6. Browser redirected to /dashboard (or wherever)
        ↓
7. Middleware intercepts request
        ↓
8. req.auth?.user?.onboarded = false
        ↓
9. Middleware redirects to /signup (before page loads)
        ↓
10. User sees signup form
        ↓
11. User completes onboarding
        ↓
12. Button calls: await prisma.user.update({ onboarded: true })
        ↓
13. User signs out and back in (OR trigger token refresh)
        ↓
14. New JWT encoded with onboarded: true
        ↓
15. req.auth?.user?.onboarded = true
        ↓
16. Middleware allows access
```

---

### Implementation: Redirect Non-Onboarded Users

**In Middleware (proxy.ts):**

```ts
export const proxy = auth((req) => {
  const isOnboarded = (req.auth?.user as any)?.onboarded;

  // If user is logged in AND not onboarded AND not already on signup
  if (req.auth && !isOnboarded && req.nextUrl.pathname !== "/signup") {
    return NextResponse.redirect(new URL("/signup", req.nextUrl.origin));
  }

  return NextResponse.next();
});
```

**In Signup Component:**

```tsx
"use client";
import { useMutation } from "@tanstack/react-query";

export default function SignupForm() {
  const updateOnboarding = async () => {
    await fetch("/api/onboarding", { method: "POST" });

    // Option 1: Refresh session to get new JWT
    await signOut({ redirect: false });
    await signIn("google");

    // Option 2: Refresh token without signin
    // (requires explicit refresh implementation)
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        updateOnboarding();
      }}
    >
      {/* Signup form fields */}
      <button type="submit">Complete Onboarding</button>
    </form>
  );
}
```

**Backend Endpoint (/api/onboarding):**

```ts
import { auth } from "@/auth";
import { prisma } from "@/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mark user as onboarded
  const user = await prisma.user.update({
    where: { id: session.user.id as string },
    data: { onboarded: true },
  });

  return Response.json(user);
}
```

---

## Summary: How It All Works

1. **Google OAuth** → User identifies themselves with Google
2. **Adapter** → NextAuth creates/fetches user from Prisma DB
3. **signIn Callback** → You decide if user is allowed
4. **jwt Callback** → User data encoded into JWT token (including `onboarded` flag)
5. **Cookie** → JWT stored in HTTP-only cookie
6. **Middleware** → Every request decodes JWT into `req.auth`
7. **Your Logic** → Check `req.auth?.user?.onboarded` and redirect if needed
8. **Client** → Components use `useSession()` to access same data
9. **Refresh** → Token auto-updates; new data picked up on login/redirect

**The key insight:** User data lives in three places simultaneously:

- **Database** (source of truth, persistent)
- **JWT Token** (encoded, travels with requests)
- **req.auth / session** (decoded, available to your code)

All three are synchronized, but the JWT allows you to check auth status **without a database query**.
