import { NextResponse } from "next/server";
import { PAYMENT_AMOUNT_SOL, RECEIVER_WALLET } from "@/lib/x402";
import { connection } from "@/lib/solana";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function GET(req: Request) {
  const paymentProof = req.headers.get("x-payment-proof");

  // 1️⃣ No payment proof → ask for payment
  if (!paymentProof) {
    return NextResponse.json(
      {
        error: "Payment required",
        x402: {
          chain: "solana",
          network: "devnet",
          amount: PAYMENT_AMOUNT_SOL,
          currency: "SOL",
          recipient: RECEIVER_WALLET.toBase58(),
        },
      },
      { status: 402 }
    );
  }

  // 2️⃣ Verify payment
  const isValid = await verifySolanaPayment(paymentProof);

  if (!isValid) {
    return NextResponse.json(
      { error: "Invalid or insufficient payment" },
      { status: 402 }
    );
  }

  // 3️⃣ Success
  return NextResponse.json({
    secret: "🔥 You paid. This is protected data.",
  });
}


async function verifySolanaPayment(signature: string): Promise<boolean> {
    try {
      const tx = await connection.getParsedTransaction(signature, {
        commitment: "confirmed",
      });
  
      if (!tx || !tx.meta) return false;
  
      const receiver = RECEIVER_WALLET.toBase58();
      const expectedLamports = PAYMENT_AMOUNT_SOL * LAMPORTS_PER_SOL;
  
      let paidLamports = 0;
  
      for (const instruction of tx.transaction.message.instructions) {
        if (
          "parsed" in instruction &&
          instruction.program === "system" &&
          instruction.parsed?.type === "transfer"
        ) {
          const info = instruction.parsed.info;
          if (info.destination === receiver) {
            paidLamports += info.lamports;
          }
        }
      }
  
      return paidLamports >= expectedLamports;
    } catch (err) {
      console.error("Payment verification failed", err);
      return false;
    }
  }
  