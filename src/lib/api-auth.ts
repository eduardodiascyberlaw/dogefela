import { NextRequest, NextResponse } from "next/server";
import { auth } from "./auth";

type Role = "SUPER_ADMIN" | "ADMIN" | "PARTNER";

interface AuthResult {
  userId: string;
  role: Role;
  error?: never;
}

interface AuthError {
  userId?: never;
  role?: never;
  error: NextResponse;
}

/**
 * Verify authentication and optionally check role.
 * Uses both middleware headers (fast) and session fallback (reliable).
 */
export const requireAuth = async (
  req: NextRequest,
  allowedRoles?: Role[]
): Promise<AuthResult | AuthError> => {
  // Try middleware headers first (fastest)
  let userId = req.headers.get("x-user-id");
  let role = req.headers.get("x-user-role") as Role | null;

  // Fallback to session check
  if (!userId || !role) {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        error: NextResponse.json(
          { error: "Não autenticado" },
          { status: 401 }
        ),
      };
    }
    userId = session.user.id;
    role = (session.user as { role: Role }).role;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(role)) {
    return {
      error: NextResponse.json(
        { error: "Sem permissão" },
        { status: 403 }
      ),
    };
  }

  return { userId, role };
};

/**
 * Require ADMIN or SUPER_ADMIN role
 */
export const requireAdmin = (req: NextRequest) =>
  requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);

/**
 * Require SUPER_ADMIN role only
 */
export const requireSuperAdmin = (req: NextRequest) =>
  requireAuth(req, ["SUPER_ADMIN"]);

/**
 * Max pagination limit to prevent full DB dumps
 */
export const sanitizePagination = (
  page?: string | null,
  limit?: string | null
): { page: number; limit: number; skip: number } => {
  const p = Math.max(1, parseInt(page || "1"));
  const l = Math.min(100, Math.max(1, parseInt(limit || "20")));
  return { page: p, limit: l, skip: (p - 1) * l };
};
