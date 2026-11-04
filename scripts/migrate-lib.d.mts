export declare const MIGRATION_NAME: RegExp;
export declare function checksum(sql: string): string;
export interface MigrationFile {
  name: string;
  sql: string;
}
export declare function planMigrations(
  files: MigrationFile[],
  applied: { name: string; checksum: string }[],
): MigrationFile[];
