"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { useState, useEffect } from "react";
import WalletButton from "@/components/WalletButton";

export default function Home() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [status, setStatus] = useState<
    "idle" | "paying" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("Waiting for action…");

  useEffect(() => {
    document.title = "PayGate - Pay-Per-Call API Platform | x402 Protocol";
  }, []);

  async function accessSecret() {
    try {
      setStatus("paying");
      setMessage("Requesting access…");

      const res = await fetch("/api/secret");

      if (res.status === 402) {
        const data = await res.json();

        if (!publicKey) {
          setStatus("error");
          setMessage("Connect wallet first.");
          return;
        }

        const recipient = new PublicKey(data.x402.recipient);
        const lamports = data.x402.amount * LAMPORTS_PER_SOL;

        setMessage("Payment required. Confirm in wallet…");

        const tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipient,
            lamports,
          })
        );

        const signature = await sendTransaction(tx, connection);
        await connection.confirmTransaction(signature, "confirmed");

        setMessage("Payment confirmed. Verifying…");

        const paidRes = await fetch("/api/secret", {
          headers: {
            "x-payment-proof": signature,
          },
        });

        const result = await paidRes.json();

        setStatus("success");
        setMessage(result.secret);
        return;
      }

      const result = await res.json();
      setStatus("success");
      setMessage(result.secret);
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Something went wrong.");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f12_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f12_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-purple-900/30 bg-slate-950/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                PayGate
              </span>
            </div>
            <div className="flex items-center">
              <WalletButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              PayGate
            </span>
            <br />
            <span className="text-white">Pay-Per-Call API Platform</span>
          </h1>
          <p className="text-xl text-slate-300 mb-4 max-w-2xl mx-auto leading-relaxed">
            A revolutionary pay-per-API call platform powered by the{" "}
            <span className="font-semibold text-purple-400">x402 protocol</span>{" "}
            on Solana blockchain. Monetize your APIs with instant, secure
            micro-payments.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            Built on Solana Devnet • Powered by x402 v1 • Seamless Integration
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-900/30 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              Instant Payments
            </h3>
            <p className="text-slate-400 text-sm">
              Lightning-fast Solana transactions ensure your API calls are
              processed immediately.
            </p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-900/30 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              Secure & Trustless
            </h3>
            <p className="text-slate-400 text-sm">
              Built on x402 protocol for secure, verifiable payments without
              intermediaries.
            </p>
          </div>

          <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-900/30 rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300">
            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              Micro-Payments
            </h3>
            <p className="text-slate-400 text-sm">
              Pay only for what you use with ultra-low transaction fees on
              Solana network.
            </p>
          </div>
        </div>

        {/* Main API Access Card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 backdrop-blur-xl border border-purple-900/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Protected API Resource
                </h2>
                <p className="text-slate-400">
                  Connect your wallet and pay 0.01 SOL to access this protected
                  API endpoint
                </p>
              </div>
              <div className="hidden md:block">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <WalletButton />
            </div>

            <div className="bg-slate-950/50 rounded-xl p-6 border border-purple-900/20 mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-300">
                  Pricing
                </span>
                <span className="text-lg font-bold text-purple-400">
                  0.01 SOL
                </span>
              </div>
              <div className="h-px bg-gradient-to-r from-transparent via-purple-900/50 to-transparent mb-4"></div>
              <p className="text-xs text-slate-400 mb-4">
                Payment will be processed automatically via x402 protocol when
                you request access
              </p>
            </div>

            <button
              onClick={accessSecret}
              disabled={status === "paying" || !publicKey}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 flex items-center justify-center space-x-2"
            >
              {status === "paying" ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Access Protected API</span>
              )}
            </button>

            <div
              className={`mt-6 rounded-xl p-4 border transition-all duration-300 ${
                status === "success"
                  ? "bg-green-950/30 border-green-500/30"
                  : status === "error"
                  ? "bg-red-950/30 border-red-500/30"
                  : "bg-slate-900/50 border-purple-900/30"
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`flex-shrink-0 mt-0.5 ${
                    status === "success"
                      ? "text-green-400"
                      : status === "error"
                      ? "text-red-400"
                      : "text-purple-400"
                  }`}
                >
                  {status === "success" ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : status === "error" ? (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <span
                    className={`text-sm font-medium ${
                      status === "success"
                        ? "text-green-300"
                        : status === "error"
                        ? "text-red-300"
                        : "text-slate-300"
                    }`}
                  >
                    Status:
                  </span>{" "}
                  <span
                    className={`text-sm ${
                      status === "success"
                        ? "text-green-200"
                        : status === "error"
                        ? "text-red-200"
                        : "text-slate-400"
                    }`}
                  >
                    {message}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-20 text-center text-slate-500 text-sm">
          <p className="mb-2">
            Built with Next.js • Powered by Solana Devnet • x402 Protocol v1
          </p>
          <p className="text-slate-600">
            Secure, fast, and decentralized API monetization
          </p>
        </footer>
      </div>
    </main>
  );
}
