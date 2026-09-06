// 通用字典 hook：从 /api/v1/system/dict-data/{dictType} 拉数据，转 ProTable valueEnum。
// 后端字典缺失或请求失败时回退到本地 DICT_FALLBACKS（或调用方传入的 fallback），
// 保证枚举列始终显示文案而不是裸数值。
import { useEffect, useState } from 'react';
import {
  listDictData,
  type SysDictData,
} from '@/services/smart-property/system/dict';

export type DictMap = Record<
  string | number,
  { text: string; status?: string }
>;

const cache = new Map<string, DictMap>();

export function useDict(dictType: string, fallback?: DictMap): DictMap {
  const [map, setMap] = useState<DictMap>(
    () => cache.get(dictType) ?? fallback ?? {},
  );

  useEffect(() => {
    let alive = true;
    const cached = cache.get(dictType);
    if (cached) {
      setMap(cached);
      return;
    }
    listDictData(dictType)
      .then((resp) => {
        const raw = resp as unknown as { data: SysDictData[] | SysDictData };
        const data = Array.isArray(raw.data)
          ? raw.data
          : raw.data
            ? [raw.data]
            : [];
        const m: DictMap = {};
        data.forEach((d) => {
          if (d.dictValue !== undefined) {
            m[d.dictValue] = { text: d.dictLabel };
          }
        });
        if (alive) setMap(m);
        // 只缓存非空结果：字典尚未配置时保留回退空间，下次挂载仍会重试
        if (data.length > 0) {
          cache.set(dictType, m);
        }
      })
      .catch(() => {
        if (alive) setMap(fallback ?? {});
      });
    return () => {
      alive = false;
    };
  }, [dictType]);

  return Object.keys(map).length > 0 ? map : (fallback ?? {});
}
