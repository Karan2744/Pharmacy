import { NextResponse } from 'next/server';

/**
 * POST /api/admin/logout
 * Clears any server-side session state.
 * Currently stateless (JWT / localStorage only), but the endpoint
 * is here so switching to cookies / server sessions needs no client changes.
 */
export async function POST() {
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  );

  // If you ever switch to cookie-based auth, clear it here:
  // response.cookies.delete('admin_token');

  return response;
}
