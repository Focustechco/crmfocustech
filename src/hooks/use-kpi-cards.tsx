import { useState, useEffect, useCallback } from "react";

const KPI_PREF_KEY = "focus_crm_kpi_cards_collapsed";

/**
 * Hook que gerencia a preferência do usuário de minimizar os 4 cards KPI
 * no topo dos módulos na versão mobile.
 * - O estado é persistido no localStorage para sobreviver a reloads.
 * - `collapsed` é o estado atual (true = minimizado).
 * - `toggle` alterna o estado.
 * - `setCollapsed` define diretamente o estado.
 */
export function useKpiCards() {
  const [collapsed, setCollapsedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem(KPI_PREF_KEY) === "true";
    } catch {
      return false;
    }
  });

  const setCollapsed = useCallback((value: boolean) => {
    try {
      localStorage.setItem(KPI_PREF_KEY, String(value));
    } catch {}
    setCollapsedState(value);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed, setCollapsed]);

  return { collapsed, toggle, setCollapsed };
}
