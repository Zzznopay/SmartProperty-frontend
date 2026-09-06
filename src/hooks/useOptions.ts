// 通用选项数据 hooks：给表单下拉和表格 id→名称 映射提供选项。
// 统一拉一页大结果（列表接口按 current/pageSize 识别为分页请求），
// 响应拦截器已解包为 { data: records[], total, success }。
import { useEffect, useState } from 'react';
import { listBuildings } from '@/services/smart-property/property/building';
import { listCommunitys } from '@/services/smart-property/property/community';
import { listOwners } from '@/services/smart-property/property/owner';
import { listParkings } from '@/services/smart-property/property/parking';
import { listRooms } from '@/services/smart-property/property/room';
import { listUsers } from '@/services/smart-property/system/user';

export type IdOption = { label: string; value: number };

type ListResp<T> = { data?: T[]; total?: number };

const PAGE_ALL = { current: 1, pageSize: 500 };

/** 通用加载器：只拉一次，失败静默（保持空选项，显示层自行兜底为 '-'） */
function useAsyncOptions<T>(
  load: () => Promise<ListResp<T>>,
  toOption: (item: T) => IdOption | null,
): IdOption[] {
  const [options, setOptions] = useState<IdOption[]>([]);
  useEffect(() => {
    let alive = true;
    load()
      .then((resp) => {
        if (!alive) return;
        const items = resp?.data ?? [];
        setOptions(
          items
            .map(toOption)
            .filter((o): o is IdOption => o !== null && o.value !== undefined),
        );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
    // 选项只在挂载时拉取一次，loader/toOption 由调用方保证稳定
    // biome-ignore lint/correctness/useExhaustiveDependencies: 仅首次加载
  }, []);
  return options;
}

/** 小区选项 */
export function useCommunityOptions(): IdOption[] {
  return useAsyncOptions(
    () => listCommunitys(PAGE_ALL) as Promise<ListResp<never>>,
    (c) => {
      const item = c as unknown as { id?: number; communityName?: string };
      return item.id && item.communityName
        ? { label: item.communityName, value: item.id }
        : null;
    },
  );
}

/** 楼宇选项 */
export function useBuildingOptions(): IdOption[] {
  return useAsyncOptions(
    () => listBuildings(PAGE_ALL) as Promise<ListResp<never>>,
    (b) => {
      const item = b as unknown as { id?: number; buildingName?: string };
      if (!item.id) return null;
      return { label: item.buildingName ?? String(item.id), value: item.id };
    },
  );
}

/** 房间选项：label = 小区/楼宇/单元/房号 */
export function useRoomOptions(): IdOption[] {
  return useAsyncOptions(
    () => listRooms(PAGE_ALL) as Promise<ListResp<never>>,
    (r) => {
      const item = r as unknown as {
        id?: number;
        communityName?: string;
        buildingName?: string;
        unitName?: string;
        roomNo?: string;
      };
      if (!item.id) return null;
      const label = [
        item.communityName,
        item.buildingName,
        item.unitName,
        item.roomNo,
      ]
        .filter(Boolean)
        .join(' / ');
      return { label: label || String(item.id), value: item.id };
    },
  );
}

/** 房号选项（label = 房号，供表格 id→房号 映射用） */
function useRoomNoOptions(): IdOption[] {
  return useAsyncOptions(
    () => listRooms(PAGE_ALL) as Promise<ListResp<never>>,
    (r) => {
      const item = r as unknown as { id?: number; roomNo?: string };
      if (!item.id) return null;
      return { label: item.roomNo ?? String(item.id), value: item.id };
    },
  );
}

/** 车位选项 */
export function useParkingOptions(): IdOption[] {
  return useAsyncOptions(
    () => listParkings(PAGE_ALL) as Promise<ListResp<never>>,
    (p) => {
      const item = p as unknown as {
        id?: number;
        parkingNo?: string;
        communityName?: string;
      };
      if (!item.id) return null;
      const label = item.communityName
        ? `${item.parkingNo ?? item.id}（${item.communityName}）`
        : (item.parkingNo ?? String(item.id));
      return { label, value: item.id };
    },
  );
}

/** 业主选项 */
export function useOwnerOptions(): IdOption[] {
  return useAsyncOptions(
    () => listOwners(PAGE_ALL) as Promise<ListResp<never>>,
    (o) => {
      const item = o as unknown as {
        id?: number;
        ownerName?: string;
        ownerCode?: string;
      };
      if (!item.id) return null;
      const label = item.ownerName
        ? `${item.ownerName}${item.ownerCode ? `（${item.ownerCode}）` : ''}`
        : String(item.id);
      return { label, value: item.id };
    },
  );
}

/** 系统用户选项 */
export function useUserOptions(): IdOption[] {
  return useAsyncOptions(
    () => listUsers(PAGE_ALL) as Promise<ListResp<never>>,
    (u) => {
      const item = u as unknown as {
        id?: number;
        username?: string;
        realName?: string;
      };
      if (!item.id) return null;
      const label = item.realName
        ? `${item.realName}（${item.username}）`
        : (item.username ?? String(item.id));
      return { label, value: item.id };
    },
  );
}

/** 选项数组 → id→label 映射（表格列渲染用） */
export function optionsToMap(options: IdOption[]): Record<number, string> {
  return Object.fromEntries(options.map((o) => [o.value, o.label]));
}

/** 小区 id→名称 映射（表格列解析用） */
export function useCommunityMap(): Record<number, string> {
  return optionsToMap(useCommunityOptions());
}

/** 楼宇 id→名称 映射 */
export function useBuildingMap(): Record<number, string> {
  return optionsToMap(useBuildingOptions());
}

/** 房间 id→房号 映射 */
export function useRoomNoMap(): Record<number, string> {
  return optionsToMap(useRoomNoOptions());
}
