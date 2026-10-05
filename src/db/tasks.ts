import type { SQLiteDatabase } from 'expo-sqlite';

export type Priority = 'High' | 'Medium' | 'Low';

export type Task = {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  completed: 0 | 1;
};

let databasePromise: Promise<SQLiteDatabase> | undefined;

export function getTaskDatabase(): Promise<SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = (async () => {
      const { openDatabaseAsync } = await import('expo-sqlite');
      const db = await openDatabaseAsync('productivity.db');
      try {
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY NOT NULL,
            title TEXT NOT NULL CHECK (length(trim(title)) > 0),
            description TEXT NOT NULL DEFAULT '',
            priority TEXT NOT NULL CHECK (priority IN ('High', 'Medium', 'Low'))
          );
        `);
        const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(tasks)');
        if (!columns.some((column) => column.name === 'completed')) {
          await db.execAsync(
            'ALTER TABLE tasks ADD COLUMN completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1))'
          );
        }
        return db;
      } catch (error) {
        await db.closeAsync();
        throw error;
      }
    })().catch((error) => {
      databasePromise = undefined;
      throw error;
    });
  }
  return databasePromise;
}
