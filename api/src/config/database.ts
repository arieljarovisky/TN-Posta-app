import path from "path";

export const getDatabasePath = (): string => {
  if (process.env.DATABASE_PATH) {
    return path.resolve(process.env.DATABASE_PATH);
  }

  return path.resolve("db.json");
};
