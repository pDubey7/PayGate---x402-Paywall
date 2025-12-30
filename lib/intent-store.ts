type IntentStatus = "created" | "fulfilled";

export type StoredIntent = {
  id: string;
  amount: number;
  recipient: string;
  status: IntentStatus;
};

const intentStore = new Map<string, StoredIntent>();

export function saveIntent(intent: StoredIntent) {
  intentStore.set(intent.id, intent);
}

export function getIntent(id: string): StoredIntent | undefined {
  return intentStore.get(id);
}

export function markIntentFulfilled(id: string) {
  const intent = intentStore.get(id);
  if (intent) {
    intent.status = "fulfilled";
    intentStore.set(id, intent);
  }
}
