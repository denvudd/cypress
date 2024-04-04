export enum Permissions {
  private = "Private",
  shared = "Shared",
}

export type PermissionsKey = keyof typeof Permissions;

export type DirectionType = "workspace" | "folder" | "file";
