import {
  ModalForm,
  ProFormDigit,
  ProFormRadio,
  ProFormText,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import {
  getMenuTree,
  type SysMenu,
} from '@/services/smart-property/system/menu';
import {
  addRole,
  assignRoleMenus,
  type SysRole,
  updateRole,
} from '@/services/smart-property/system/role';

type Props = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: SysRole;
};

const RoleForm: React.FC<Props> = ({ trigger, reload, values }) => {
  const isEdit = !!values?.id;
  const [menuTree, setMenuTree] = useState<SysMenu[]>([]);

  useEffect(() => {
    let active = true;
    getMenuTree()
      .then((res: unknown) => {
        if (!active) return;
        const tree =
          (res as { data?: SysMenu[] })?.data ?? (res as SysMenu[]) ?? [];
        setMenuTree(tree);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  return (
    <ModalForm<SysRole>
      title={isEdit ? '编辑角色' : '新建角色'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values}
      width={600}
      onFinish={async (vals) => {
        try {
          const menuIds = (vals.menuIds as number[] | undefined) ?? [];
          // 剔除非 number 元素（TreeSelect 在 treeCheckable 时会原样回传）
          const cleanIds = menuIds.filter((v) => typeof v === 'number');
          const roleId = values?.id;
          if (isEdit && roleId) {
            await updateRole(roleId, vals);
          } else {
            await addRole(vals);
            // 新增时后端不会返回 id，跳过菜单分配：可下一次编辑时再分配
          }
          if (isEdit && roleId) {
            await assignRoleMenus(roleId, cleanIds);
          }
          reload?.();
          return true;
        } catch {
          return false;
        }
      }}
    >
      <ProFormText
        name="roleName"
        label="角色名称"
        rules={[{ required: true }]}
      />
      <ProFormText
        name="roleKey"
        label="权限字符"
        rules={[{ required: true }]}
      />
      <ProFormDigit name="sort" label="排序" initialValue={0} min={0} />
      <ProFormRadio.Group
        name="status"
        label="状态"
        options={[
          { label: '禁用', value: 0 },
          { label: '启用', value: 1 },
        ]}
        initialValue={1}
      />
      {isEdit && (
        <ProFormTreeSelect
          name="menuIds"
          label="分配菜单"
          allowClear
          fieldProps={{
            treeData: menuTree.map(toTreeNode),
            treeCheckable: true,
            showCheckedStrategy: 'SHOW_CHILD',
            treeDefaultExpandAll: true,
          }}
        />
      )}
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

export default RoleForm;
