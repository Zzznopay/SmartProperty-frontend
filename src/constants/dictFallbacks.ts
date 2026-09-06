// 字典本地回退映射：dictType → valueEnum。
// 语义与后端 deploy/sql/seed/smart_property_system-seed.sql 保持一致（来源：doc/design 建表注释）。
// useDict 拉取到字典数据时优先用后端数据，拉取失败/字典未配置时用这里的映射兜底，
// 避免表格/表单直接显示裸数值。
import type { DictMap } from '@/hooks/useDict';

const build = (entries: [number, string][]): DictMap =>
  Object.fromEntries(entries.map(([value, text]) => [value, { text }]));

export const DICT_FALLBACKS: Record<string, DictMap> = {
  // 通用
  sys_normal_disable: build([
    [0, '停用'],
    [1, '正常'],
  ]),
  sys_user_sex: build([
    [0, '未知'],
    [1, '男'],
    [2, '女'],
  ]),
  sys_common_status: build([
    [0, '失败'],
    [1, '成功'],
  ]),
  oper_type: build([
    [0, '其它'],
    [1, '新增'],
    [2, '修改'],
    [3, '删除'],
    [4, '查询'],
    [5, '导出'],
  ]),

  // 房产
  room_status: build([
    [1, '空置'],
    [2, '已售'],
    [3, '已租'],
    [4, '装修中'],
  ]),
  room_type: build([
    [1, '住宅'],
    [2, '商业'],
    [3, '办公'],
    [4, '仓库'],
    [5, '车库'],
  ]),
  room_decoration: build([
    [1, '毛坯'],
    [2, '简装'],
    [3, '精装'],
  ]),
  building_type: build([
    [1, '住宅'],
    [2, '商业'],
    [3, '办公'],
    [4, '仓库'],
    [5, '车库'],
  ]),
  owner_type: build([
    [1, '个人'],
    [2, '企业'],
  ]),
  decoration_status: build([
    [1, '申请中'],
    [2, '施工中'],
    [3, '已完工'],
    [4, '已验收'],
  ]),
  deposit_status: build([
    [1, '未缴'],
    [2, '已缴'],
    [3, '已退'],
  ]),
  check_status: build([
    [1, '待处理'],
    [2, '已整改'],
  ]),
  check_type: build([
    [1, '物业验房'],
    [2, '业主验房'],
  ]),
  check_result: build([
    [1, '合格'],
    [2, '不合格'],
  ]),
  lease_status: build([
    [1, '草稿'],
    [2, '生效'],
    [3, '已终止'],
    [4, '已到期'],
  ]),
  lease_type: build([
    [1, '整租'],
    [2, '分租'],
  ]),
  pay_cycle: build([
    [1, '月付'],
    [2, '季付'],
    [3, '半年付'],
    [4, '年付'],
  ]),

  // 财务
  fee_type: build([
    [1, '常规'],
    [2, '公摊'],
    [3, '临时'],
    [4, '临客'],
  ]),
  charge_mode: build([
    [1, '按面积'],
    [2, '按户'],
    [3, '按用量'],
  ]),
  billing_cycle: build([
    [1, '月'],
    [2, '季'],
    [3, '半年'],
    [4, '年'],
  ]),
  ledger_status: build([
    [1, '未收'],
    [2, '部分收'],
    [3, '已收'],
  ]),
  pay_type: build([
    [1, '现金'],
    [2, '转账'],
    [3, '微信'],
    [4, '支付宝'],
    [5, '预收款'],
  ]),
  payment_status: build([
    [1, '正常'],
    [2, '已退款'],
    [3, '已作废'],
  ]),
  prepayment_status: build([
    [1, '正常'],
    [2, '已退款'],
  ]),
  parking_type: build([
    [1, '地上'],
    [2, '地下'],
    [3, '机械'],
  ]),
  parking_status: build([
    [1, '空闲'],
    [2, '已售'],
    [3, '已租'],
  ]),
  invoice_type: build([
    [1, '收据'],
    [2, '发票'],
  ]),
  invoice_status: build([
    [1, '未使用'],
    [2, '已使用'],
    [3, '已作废'],
  ]),
  meter_type: build([
    [1, '水表'],
    [2, '电表'],
    [3, '气表'],
  ]),
};
