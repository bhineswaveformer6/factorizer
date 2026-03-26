import { useState, useCallback, useMemo } from "react";

type Tier = "spark" | "surge" | "sovereign";

const TIER_LIMITS: Record<Tier, number> = {
  spark: 3,
  surge: 20,
  sovereign: 100,
};

interface VoltBalanceState {
  balance: number;
  tier: Tier;
  totalAllocated: number;
  isGated: boolean;
  isLow: boolean;
  isWarning: boolean;
  deduct: () => boolean;
  setTier: (tier: Tier) => void;
  reset: () => void;
}

export function useVoltBalance(initialTier: Tier = "spark"): VoltBalanceState {
  const [tier, setTierState] = useState<Tier>(initialTier);
  const [balance, setBalance] = useState<number>(TIER_LIMITS[initialTier]);
  const totalAllocated = TIER_LIMITS[tier];

  const isGated = balance <= 0;
  const isLow = balance <= 3;
  const isWarning = totalAllocated > 0 && balance / totalAllocated <= 0.2;

  const deduct = useCallback((): boolean => {
    if (balance <= 0) return false;
    setBalance((prev) => prev - 1);
    return true;
  }, [balance]);

  const setTier = useCallback((newTier: Tier) => {
    setTierState(newTier);
    setBalance(TIER_LIMITS[newTier]);
  }, []);

  const reset = useCallback(() => {
    setBalance(TIER_LIMITS[tier]);
  }, [tier]);

  return useMemo(
    () => ({
      balance,
      tier,
      totalAllocated,
      isGated,
      isLow,
      isWarning,
      deduct,
      setTier,
      reset,
    }),
    [balance, tier, totalAllocated, isGated, isLow, isWarning, deduct, setTier, reset]
  );
}
