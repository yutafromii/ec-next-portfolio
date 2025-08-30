// /app/lib/hooks/useAddresses.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { AddressesAPI, type Address, type AddressUpsertRequest } from "@/app/lib/api/addresses";

export function useAddresses(enabled = true) {
  const [list, setList] = useState<Address[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const data = await AddressesAPI.list();
      setList(data ?? []);
      setError(null);
    } catch (e) {
      setError("お届け先の取得に失敗しました。");
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(async (payload: AddressUpsertRequest) => {
    const created = await AddressesAPI.create(payload);
    setList((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: number, payload: AddressUpsertRequest) => {
    const updated = await AddressesAPI.update(id, payload);
    setList((prev) => prev.map((a) => (a.id === id ? updated : a)));
    return updated;
  }, []);

  const remove = useCallback(async (id: number) => {
    await AddressesAPI.delete(id);
    setList((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return { list, loading, error, reload, create, update, remove };
}
