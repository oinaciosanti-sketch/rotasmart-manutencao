export type AppRole = "admin" | "analista" | "tecnico" | "visualizador";

export type PermissionAction =
  | "users.manage"
  | "tickets.create"
  | "tickets.update"
  | "tickets.delete"
  | "routes.create"
  | "routes.confirm"
  | "routes.execute"
  | "tickets.technicianUpdate"
  | "portal.view"
  | "branches.update"
  | "branches.delete"
  | "technicians.update"
  | "technicians.delete"
  | "analysts.update"
  | "analysts.delete"
  | "imports.run"
  | "backup.import"
  | "migration.run"
  | "local.clear";

const analystActions = new Set<PermissionAction>([
  "tickets.create", "tickets.update",
  "routes.create", "routes.confirm", "imports.run",
]);

export function can(role: AppRole | null | undefined, action: PermissionAction) {
  if (role === "admin") return true;
  if (role === "analista") return analystActions.has(action);
  if (role === "tecnico") return ["portal.view","routes.execute","tickets.technicianUpdate"].includes(action);
  return false;
}
