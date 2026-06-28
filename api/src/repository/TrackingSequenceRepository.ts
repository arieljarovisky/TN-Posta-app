import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";

import { getDatabasePath } from "../config/database";

interface IDatabase {
  tracking_sequence: { next_value: number };
}

const adapter = new FileSync<IDatabase>(getDatabasePath());
const database = low(adapter);

database.defaults({ tracking_sequence: { next_value: 100001 } }).write();

class TrackingSequenceRepository {
  next(): number {
    const current = database.get("tracking_sequence.next_value").value() ?? 100001;
    const nextValue = current + 1;

    database.set("tracking_sequence.next_value", nextValue).write();

    return current;
  }
}

export default new TrackingSequenceRepository();
