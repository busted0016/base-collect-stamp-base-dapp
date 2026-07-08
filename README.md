# Base Collect Stamp

**Field report:** this repo documents a deployed Base dApp used for collectible stamps. The observed user path is short: arrive, connect wallet, pressing a small proof stamp, inspect the stamp.

## Evidence collected

| Field | Value |
| --- | --- |
| Base Developer Dashboard | Registered |
| Build ID / Base App ID | `6a03c29a2be96789d34cef95` |
| Builder Wallet | `0x339789971bC2afcf25aa8D6cDB7f836F7AB3e21a` |
| Builder Code | `bc_wq408wzg` |
| Live Demo | https://base-collect-stamp.vercel.app |
| GitHub Repository | https://github.com/busted0016/base-collect-stamp-base-dapp |
| Network | Base |
| Deployment | Vercel |

## Notes from the field

The app avoids account-email identity assumptions. Public project identity is established by matching the Base App ID, builder wallet, Builder Code, Vercel deployment, and repository.

## Equipment

Next.js, React, TypeScript, Tailwind CSS, wagmi, viem, Base, Vercel

## Local reproduction

```bash
npm install
npm run dev
```

## Red lines

Do not commit `.env`, private keys, seed phrases, RPC keys, GitHub tokens, or Vercel tokens. Use `.env.example` only for placeholders.

License: MIT
