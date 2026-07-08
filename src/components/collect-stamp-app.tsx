"use client";

import {
  CheckCircle2,
  Compass,
  Loader2,
  MapPinned,
  Sparkles,
  Stamp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  collectStampAbi,
  collectStampContractAddress,
  STAMP_THEMES,
  type StampTheme,
} from "@/lib/collect-stamp";

function shortAddress(address?: Address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function percentText(value: bigint | undefined, total: number) {
  if (!value) return "0%";
  return `${Math.round((Number(value) / total) * 100)}%`;
}

export function CollectStampApp() {
  const [selectedTheme, setSelectedTheme] = useState<StampTheme>(STAMP_THEMES[0]);
  const [status, setStatus] = useState(
    "Pick a theme and collect a stamp on Base. Each wallet can claim each stamp once.",
  );
  const [walletStatus, setWalletStatus] = useState("");

  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync, isPending: disconnecting } = useDisconnect();
  const { switchChain, isPending: switching } = useSwitchChain();
  const {
    data: hash,
    writeContract,
    isPending: claiming,
    error: claimError,
  } = useWriteContract();

  const { isLoading: confirming, isSuccess: confirmed } =
    useWaitForTransactionReceipt({ hash });

  const availableConnectors = useMemo(
    () =>
      connectors
        .filter((item) => item.type !== "mock")
        .sort((a, b) => {
          const score = (item: (typeof connectors)[number]) => {
            if (item.id === "baseAccount" || item.name === "Base Account") {
              return 0;
            }
            if (item.type === "injected") return 1;
            return 2;
          };

          return score(a) - score(b);
        }),
    [connectors],
  );

  const progressQuery = useReadContract({
    abi: collectStampAbi,
    address: collectStampContractAddress,
    functionName: "getStampProgress",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(collectStampContractAddress && address),
      refetchInterval: 12000,
    },
  });

  const stampedQuery = useReadContract({
    abi: collectStampAbi,
    address: collectStampContractAddress,
    functionName: "hasStamp",
    args: address ? [address, BigInt(selectedTheme.id)] : undefined,
    query: {
      enabled: Boolean(collectStampContractAddress && address),
      refetchInterval: 12000,
    },
  });

  const totalClaimsQuery = useReadContract({
    abi: collectStampAbi,
    address: collectStampContractAddress,
    functionName: "getThemeClaimCount",
    args: [BigInt(selectedTheme.id)],
    query: {
      enabled: Boolean(collectStampContractAddress),
      refetchInterval: 15000,
    },
  });

  const totalCollected = (progressQuery.data as bigint | undefined) ?? BigInt(0);
  const alreadyStamped = Boolean(stampedQuery.data);
  const themeClaims = (totalClaimsQuery.data as bigint | undefined) ?? BigInt(0);

  const canClaim =
    Boolean(collectStampContractAddress) &&
    isConnected &&
    chainId === base.id &&
    !alreadyStamped;

  const statusText = confirmed
    ? `${selectedTheme.name} stamp confirmed on Base.`
    : claimError
      ? claimError.message
      : status;

  const unlockedThemes = useMemo(() => {
    const count = Number(totalCollected);
    return STAMP_THEMES.filter((_, index) => index < count);
  }, [totalCollected]);

  function claimStamp() {
    if (!collectStampContractAddress) return;

    setStatus(`Confirm the ${selectedTheme.name} stamp in your wallet.`);
    writeContract({
      address: collectStampContractAddress,
      abi: collectStampAbi,
      functionName: "claimStamp",
      args: [BigInt(selectedTheme.id)],
      chainId: base.id,
    });
  }

  async function connectWallet() {
    const errors: string[] = [];
    setWalletStatus("Opening wallet...");

    for (const item of availableConnectors) {
      try {
        await connectAsync({ connector: item, chainId: base.id });
        setWalletStatus("");
        return;
      } catch (error) {
        errors.push(
          error instanceof Error
            ? `${item.name}: ${error.message}`
            : `${item.name}: connection failed`,
        );
      }
    }

    setWalletStatus(
      errors[0] ??
        "No wallet connector is available. Open this app inside Base App or install a wallet.",
    );
  }

  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
      setWalletStatus("Wallet disconnected. Tap Connect to reconnect.");
    } catch (error) {
      setWalletStatus(
        error instanceof Error ? error.message : "Could not disconnect wallet.",
      );
    }
  }

  return (
    <main className="min-h-screen bg-[#eef6f7] text-[#0f2a32]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between border-b border-[#0f2a32] pb-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#0f2a32] bg-[#ffd25c]">
              <Stamp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#0f7080]">
                Base Collect Stamp
              </p>
              <h1 className="text-xl font-black sm:text-2xl">
                Collect your onchain stamp set.
              </h1>
            </div>
          </div>

          {isConnected ? (
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#0f2a32] bg-white px-3 py-2 text-sm font-semibold">
                {shortAddress(address)}
              </span>
              <button
                className="rounded-full border border-[#0f2a32] bg-[#0f2a32] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                disabled={disconnecting}
                onClick={disconnectWallet}
              >
                {disconnecting ? "Disconnecting" : "Disconnect"}
              </button>
            </div>
          ) : (
            <button
              className="inline-flex items-center gap-2 rounded-full border border-[#0f2a32] bg-[#0f2a32] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              disabled={availableConnectors.length === 0 || connecting}
              onClick={connectWallet}
            >
              {connecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4" />
              )}
              Connect
            </button>
          )}
          {walletStatus ? (
            <p className="w-full text-right text-xs font-semibold text-[#3f6871]">
              {walletStatus}
            </p>
          ) : null}
        </header>

        <div className="grid flex-1 gap-4 py-4 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.72fr)]">
          <section className="rounded-[32px] border border-[#0f2a32] bg-[linear-gradient(180deg,#f4fbfb_0%,#dff1f3_100%)] p-4 shadow-[0_18px_48px_rgba(15,42,50,0.08)] sm:p-6">
            <div className="max-w-2xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#0f2a32] bg-white px-3 py-1 text-xs font-black uppercase tracking-[0.18em]">
                <Compass className="h-3.5 w-3.5" />
                Six-theme collection
              </p>
              <h2 className="max-w-xl text-4xl font-black leading-tight sm:text-6xl">
                Tap a route, claim a stamp, fill the board.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-[#35555c] sm:text-lg">
                Each stamp is a clean Base transaction. Your wallet unlocks one
                mark per theme, turning a simple chain action into a visible set
                you can complete over time.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(260px,0.5fr)]">
              <div className="rounded-[28px] border border-[#0f2a32] bg-white p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-black">Stamp board</h3>
                  <span className="rounded-full border border-[#0f2a32] bg-[#dff1f3] px-3 py-1 text-sm font-bold">
                    {totalCollected.toString()}/{STAMP_THEMES.length}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {STAMP_THEMES.map((theme) => {
                    const active = theme.id === selectedTheme.id;
                    const unlocked =
                      Number(totalCollected) > 0 &&
                      Number(totalCollected) >= theme.id;
                    return (
                      <button
                        className={`rounded-[24px] border border-[#0f2a32] p-4 text-left transition ${
                          active ? "translate-y-[-2px] shadow-[0_10px_0_#0f2a32]" : ""
                        }`}
                        key={theme.id}
                        onClick={() => setSelectedTheme(theme)}
                        style={{ background: active ? theme.color : "#f8fcfc" }}
                        type="button"
                      >
                        <div className="flex items-center justify-between">
                          <div className="grid h-10 w-10 place-items-center rounded-full border border-[#0f2a32] bg-white">
                            <theme.icon className="h-4 w-4" />
                          </div>
                          {unlocked ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <Sparkles className="h-5 w-5 opacity-60" />
                          )}
                        </div>
                        <p className="mt-4 text-lg font-black">{theme.name}</p>
                        <p className="mt-1 text-sm text-[#35555c]">
                          {theme.summary}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[28px] border border-[#0f2a32] bg-[#0f2a32] p-4 text-white">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7fe7ef]">
                  Your progress
                </p>
                <div className="mt-4 grid h-44 place-items-center rounded-[26px] border border-white/20 bg-white/10">
                  <div className="text-center">
                    <p className="text-5xl font-black">
                      {percentText(totalCollected, STAMP_THEMES.length)}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-[#cbeef1]">
                      collection complete
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-[26px] border border-white/20 bg-white/10 p-4">
                  <p className="text-sm font-semibold text-[#cbeef1]">
                    Unlocked themes
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {unlockedThemes.length ? (
                      unlockedThemes.map((theme) => (
                        <span
                          className="rounded-full border border-white/20 px-3 py-1 text-sm font-semibold"
                          key={theme.id}
                        >
                          {theme.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-[#cbeef1]">
                        Your first stamp will appear here.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-4">
            <section
              className="rounded-[32px] border border-[#0f2a32] p-5 shadow-[0_18px_48px_rgba(15,42,50,0.08)]"
              style={{ background: selectedTheme.color }}
            >
              <div className="flex items-center justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-full border border-[#0f2a32] bg-white">
                  <selectedTheme.icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-[#0f2a32] bg-white px-3 py-1 text-sm font-bold">
                  Theme {selectedTheme.id}
                </span>
              </div>

              <h3 className="mt-5 text-3xl font-black">{selectedTheme.name}</h3>
              <p className="mt-3 text-base leading-7 text-[#284248]">
                {selectedTheme.description}
              </p>

              <div className="mt-5 rounded-[24px] border border-[#0f2a32] bg-white/70 p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0f7080]">
                  Total claims
                </p>
                <p className="mt-2 text-4xl font-black">{themeClaims.toString()}</p>
                <p className="mt-2 text-sm text-[#35555c]">
                  Number of wallets that have claimed this stamp so far.
                </p>
              </div>
            </section>

            <section className="rounded-[32px] border border-[#0f2a32] bg-white p-5 shadow-[0_18px_48px_rgba(15,42,50,0.08)]">
              <div className="mb-4 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#dff1f3]">
                  <MapPinned className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-2xl font-black">Claim this stamp</h3>
                  <p className="text-sm text-[#35555c]">
                    One claim per wallet for each theme.
                  </p>
                </div>
              </div>

              <div className="grid gap-2 text-sm font-semibold text-[#35555c]">
                <p className="flex items-center gap-2">
                  {collectStampContractAddress ? (
                    <CheckCircle2 className="h-4 w-4 text-[#0f7080]" />
                  ) : (
                    <Sparkles className="h-4 w-4 opacity-60" />
                  )}
                  Contract configured
                </p>
                <p className="flex items-center gap-2">
                  {alreadyStamped ? (
                    <CheckCircle2 className="h-4 w-4 text-[#0f7080]" />
                  ) : (
                    <Sparkles className="h-4 w-4 opacity-60" />
                  )}
                  Not claimed yet
                </p>
              </div>

              {chainId !== base.id && isConnected ? (
                <button
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0f2a32] px-4 py-3 font-semibold text-white disabled:opacity-60"
                  disabled={switching}
                  onClick={() => switchChain({ chainId: base.id })}
                >
                  {switching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Wallet className="h-4 w-4" />
                  )}
                  Switch to Base
                </button>
              ) : (
                <button
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0f2a32] px-4 py-3 font-semibold text-white disabled:opacity-60"
                  disabled={!canClaim || claiming || confirming}
                  onClick={claimStamp}
                >
                  {claiming || confirming ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Stamp className="h-4 w-4" />
                  )}
                  {alreadyStamped ? "Already collected" : "Claim stamp"}
                </button>
              )}

              <p className="mt-4 min-h-14 text-sm leading-6 text-[#35555c]">
                {statusText}
              </p>

              {!collectStampContractAddress ? (
                <p className="rounded-[18px] border border-[#0f2a32] bg-[#eef6f7] p-3 text-xs leading-6 text-[#35555c]">
                  Add `NEXT_PUBLIC_COLLECT_STAMP_CONTRACT_ADDRESS` after
                  deploying the stamp contract, then redeploy Vercel.
                </p>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
