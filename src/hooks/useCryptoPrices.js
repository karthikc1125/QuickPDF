import { useQuery } from "@tanstack/react-query";
import { parseEther, parseUnits } from "viem";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network,binancecoin,avalanche-2&vs_currencies=usd";

// Rough fallback so the UI is never blank while the fetch is in-flight.
// Update these occasionally to keep estimates sensible.
const FALLBACK_PRICES = {
  ethUsd:   3200,
  maticUsd: 0.90,
  bnbUsd:   600,
  avaxUsd:  35,
};

async function fetchPrices() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch(COINGECKO_URL, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json();
    return {
      ethUsd:   data["ethereum"]["usd"],
      maticUsd: data["matic-network"]["usd"],
      bnbUsd:   data["binancecoin"]["usd"],
      avaxUsd:  data["avalanche-2"]["usd"],
    };
  } catch (err) {
    clearTimeout(timer);
    throw err.name === "AbortError" ? new Error("Price fetch timed out") : err;
  }
}

function toWei(usdTarget, tokenPriceUsd) {
  if (!tokenPriceUsd || tokenPriceUsd <= 0) return undefined;
  const raw = usdTarget / tokenPriceUsd;
  if (!isFinite(raw) || isNaN(raw)) return undefined;
  try { return parseEther(raw.toFixed(8)); } catch { return undefined; }
}

function toHuman(usdTarget, tokenPriceUsd, decimals = 5) {
  if (!tokenPriceUsd || tokenPriceUsd <= 0) return undefined;
  const raw = usdTarget / tokenPriceUsd;
  if (!isFinite(raw) || isNaN(raw)) return undefined;
  return raw.toFixed(decimals);
}

export function useCryptoPrices(targetUsd = 5) {
  const { data, isError, error } = useQuery({
    queryKey:        ["cryptoPrices"],
    queryFn:         fetchPrices,
    initialData:     FALLBACK_PRICES,
    refetchInterval: 60_000,
    staleTime:       30_000,
    retry:           1,
    retryDelay:      1_000,
  });

  const eth   = data ? { amount: toHuman(targetUsd, data.ethUsd,   6), wei: toWei(targetUsd, data.ethUsd)   } : undefined;
  const matic = data ? { amount: toHuman(targetUsd, data.maticUsd, 4), wei: toWei(targetUsd, data.maticUsd) } : undefined;
  const bnb   = data ? { amount: toHuman(targetUsd, data.bnbUsd,   5), wei: toWei(targetUsd, data.bnbUsd)   } : undefined;
  const avax  = data ? { amount: toHuman(targetUsd, data.avaxUsd,  4), wei: toWei(targetUsd, data.avaxUsd)  } : undefined;

  // Stablecoins are always exactly $targetUsd — no conversion needed
  const stableRaw = parseUnits(targetUsd.toFixed(2), 6);
  const usdc = { amount: targetUsd.toFixed(2), raw: stableRaw };
  const usdt = { amount: targetUsd.toFixed(2), raw: stableRaw };

  return { prices: data, eth, matic, bnb, avax, usdc, usdt, isError, error };
}
