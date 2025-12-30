import { NextResponse } from "next/server";
import { connection } from "@/lib/solana";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { createPayGateIntent } from "@/lib/x402-intent";
import type { PaymentProof } from "@/lib/x402-types";
import {
  saveIntent,
  getIntent,
  markIntentFulfilled,
} from "@/lib/intent-store";

export async function GET(req: Request) {
  const rawProof = req.headers.get("x-payment-proof");

  let proof: PaymentProof | null = null;

  // STEP 2.3 — Parse & validate structured proof
  if (rawProof) {
    try {
      proof = JSON.parse(rawProof) as PaymentProof;
    } catch {
      return NextResponse.json(
        { error: "Malformed payment proof" },
        { status: 400 }
      );
    }

    if (!proof.intentId || !proof.txSignature) {
      return NextResponse.json(
        { error: "Invalid payment proof format" },
        { status: 400 }
      );
    }
  }

  // STEP 3.2 — Issue & store intent if unpaid
  if (!proof) {
    const intent = createPayGateIntent();

    saveIntent({
      id: intent.id,
      amount: intent.amount,
      recipient: intent.recipient,
      status: "created",
    });

    return NextResponse.json(
      {
        error: "Payment required",
        intent,
      },
      { status: 402 }
    );
  }

  // STEP 3.3 — Load & validate intent lifecycle
  const intent = getIntent(proof.intentId);

  if (!intent) {
    return NextResponse.json(
      { error: "Unknown or expired payment intent" },
      { status: 402 }
    );
  }

  if (intent.status === "fulfilled") {
    return NextResponse.json(
      { error: "Payment intent already used" },
      { status: 409 }
    );
  }

  // STEP 2.4 + STEP 3.4 — Verify tx fulfills intent
  const isValid = await verifySolanaPayment(proof, intent);

  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid or insufficient payment" },
      { status: 402 }
    );
  }

  // STEP 3.4 — Mark intent fulfilled
  markIntentFulfilled(intent.id);

  return NextResponse.json({
    secret: "🔥 You paid. This is protected data.",
  });
}

async function verifySolanaPayment(
  proof: PaymentProof,
  intent: { amount: number; recipient: string }
): Promise<boolean> {
  const tx = await connection.getParsedTransaction(proof.txSignature, {
    commitment: "confirmed",
  });

  if (!tx || !tx.meta) return false;

  const expectedLamports = intent.amount * LAMPORTS_PER_SOL;
  let paidLamports = 0;

  for (const instruction of tx.transaction.message.instructions) {
    if (
      "parsed" in instruction &&
      instruction.program === "system" &&
      instruction.parsed?.type === "transfer"
    ) {
      const info = instruction.parsed.info;
      if (info.destination === intent.recipient) {
        paidLamports += info.lamports;
      }
    }
  }

  return paidLamports >= expectedLamports;
}
