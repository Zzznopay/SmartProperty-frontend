import {
  ModalForm,
  ProFormDigit,
  ProFormRadio,
  ProFormSelect,
  ProFormText,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import {
  addMenu,
  type SysMenu,
  updateMenu,
} from '@/services/smart-property/system/menu';

type Props = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: SysMenu;
};

const MenuForm: React.FC<Props> = ({ trigger, reload, values }) => {
  const isEdit = !!values?.id;
  const [menuTree, setMenuTree] = useState<SysMenu[]>([]);

  useEffect(() => {
    let active = true;
    import('@/services/smart-property/system/menu').then(({ getMenuTree }) =>
      getMenuTree().then((res: unknown) => {
        if (!active) return;
        const tree =
          (res as { data?: SysMenu[] })?.data ?? (res as SysMenu[]) ?? [];
        // 排除自身及后代,避免回环
        const filtered = isEdit
          ? tree.filter((m) => !isDescendantOrSelf(m, values.id!))
          : tree;
        setMenuTree(filtered);
      }),
    );
    return () => {
      active = false;
    };
  }, [isEdit, values?.id]);

  return (
    <ModalForm<SysMenu>
      title={isEdit ? '编辑菜单' : '新建菜单'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={
        values ?? {
          parentId: 0,
          menuType: 'M',
          status: 1,
          sort: 0,
          visible: true,
        }
      }
      width={600}
      onFinish={async (vals) => {
        try {
          const payload: Partial<SysMenu> = { ...vals };
          if (!payload.parentId) payload.parentId = 0;
          if (isEdit && values?.id) {
            await updateMenu(values.id, payload);
          } else {
            await addMenu(payload);
          }
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormTreeSelect
        name="parentId"
        label="上级菜单"
        allowClear
        fieldProps={{
          treeData: [
            {
              title: '主类目',
              value: 0,
              key: 0,
              children: menuTree.map(toTreeNode),
            },
          ],
          treeDefaultExpandAll: true,
        }}
      />
      <ProFormSelect
        name="menuType"
        label="菜单类型"
        options={[
          { label: '目录', value: 'M' },
          { label: '菜单', value: 'C' },
          { label: '按钮', value: 'F' },
        ]}
        rules={[{ required: true }]}
      />
      <ProFormText
        name="menuName"
        label="菜单名称"
        rules={[{ required: true }]}
      />
      <ProFormText
        name="icon"
        label="图标"
        tooltip="antd 图标名,如 UserOutlined"
      />
      <ProFormText name="path" label="路由地址" />
      <ProFormText
        name="component"
        label="组件路径"
        tooltip="相对 src/pages 的路径"
      />
      <ProFormText name="perms" label="权限标识" />
      <ProFormDigit name="sort" label="排序" initialValue={0} min={0} />
      <ProFormRadio.Group
        name="visible"
        label="显示状态"
        options={[
          { label: '显示', value: true },
          { label: '隐藏', value: false },
        ]}
        initialValue={true}
      />
      <ProFormRadio.Group
        name="status"
        label="状态"
        options={[
          { label: '禁用', value: 0 },
          { label: '启用', value: 1 },
        ]}
        initialValue={1}
      />
    </ModalForm>
  );
};

type TreeNode = {
  title: string;
  value: number;
  key: number;
  children?: TreeNode[];
};

function toTreeNode(menu: SysMenu): TreeNode {
  return {
    title: menu.menuName,
    value: menu.id!,
    key: menu.id!,
    children: menu.children?.map(toTreeNode),
  };
}

function isDescendantOrSelf(menu: SysMenu, targetId: number): boolean {
  if (menu.id === targetId) return true;
  if (!menu.children) return false;
  return menu.children.some((c) => isDescendantOrSelf(c, targetId));
}

export default MenuForm;
