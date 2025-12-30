import { randomUUID } from "crypto";
import { PAYGATE_CONFIG } from "./paygate-config";


export function createPayGateIntent() {
    return {
      id: randomUUID(),
      protocol: "x402",
      version: "2",
      chain: PAYGATE_CONFIG.chain,
      network: PAYGATE_CONFIG.network,
      currency: "SOL",
      amount: PAYGATE_CONFIG.amountSol,
      recipient: PAYGATE_CONFIG.receiverWallet,
      metadata: {
        product: "PayGate API Access",
        endpoint: "/api/secret",
      },
    };
  }
