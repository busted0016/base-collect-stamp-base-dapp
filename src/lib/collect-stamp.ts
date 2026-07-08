import {
  BadgeCheck,
  Compass,
  Flame,
  Gem,
  Mountain,
  Waves,
} from "lucide-react";
import type { Address } from "viem";

export const collectStampAbi = [
  {
    type: "function",
    name: "claimStamp",
    stateMutability: "nonpayable",
    inputs: [{ name: "themeId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "hasStamp",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "themeId", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "getStampProgress",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "getThemeClaimCount",
    stateMutability: "view",
    inputs: [{ name: "themeId", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const collectStampContractAddress = process.env
  .NEXT_PUBLIC_COLLECT_STAMP_CONTRACT_ADDRESS as Address | undefined;

export const STAMP_THEMES = [
  {
    id: 1,
    name: "Harbor",
    summary: "Base launch dock",
    description:
      "Start the set with a clean harbor stamp for first arrivals and new launches.",
    color: "#ffd25c",
    icon: Compass,
  },
  {
    id: 2,
    name: "Signal",
    summary: "Social pulse",
    description:
      "Mark the wallets that keep showing up, sharing links, and pushing momentum forward.",
    color: "#8ce7ee",
    icon: Waves,
  },
  {
    id: 3,
    name: "Peak",
    summary: "Builder milestone",
    description:
      "A mountain badge for progress moments, public launches, and harder-won checkpoints.",
    color: "#bfdcf6",
    icon: Mountain,
  },
  {
    id: 4,
    name: "Spark",
    summary: "Culture moment",
    description:
      "Use this one for creative drops, posters, memes, and the brighter side of Base activity.",
    color: "#f6c8db",
    icon: Flame,
  },
  {
    id: 5,
    name: "Core",
    summary: "Network loyalty",
    description:
      "A gem-like stamp that signals a wallet is collecting the full set with intent.",
    color: "#cde8c9",
    icon: Gem,
  },
  {
    id: 6,
    name: "Final",
    summary: "Complete the board",
    description:
      "The completion badge that closes the loop and turns the board into a finished collection.",
    color: "#f3d4b5",
    icon: BadgeCheck,
  },
] as const;

export type StampTheme = (typeof STAMP_THEMES)[number];
