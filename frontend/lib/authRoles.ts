export function hasAdminRole(roles: string[] | undefined | null): boolean {
  return (roles ?? []).includes("ROLE_ADMIN");
}
