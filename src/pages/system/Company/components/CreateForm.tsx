import {
  ModalForm,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
} from '@ant-design/pro-components';
import React, { useEffect, useState } from 'react';
import {
  addCompany,
  type Company,
  updateCompany,
} from '@/services/smart-property/system/company';

type Props = {
  trigger: React.ReactNode;
  reload?: () => void;
  values?: Company;
};

const CompanyForm: React.FC<Props> = ({ trigger, reload, values }) => {
  const isEdit = !!values?.id;
  const [tree, setTree] = useState<Company[]>([]);

  useEffect(() => {
    let active = true;
    import('@/services/smart-property/system/company').then(
      ({ listCompanys }) =>
        listCompanys().then((res: unknown) => {
          if (!active) return;
          const treeRaw =
            (res as { data?: Company[] })?.data ?? (res as Company[]) ?? [];
          const arr = Array.isArray(treeRaw) ? treeRaw : [];
          const filtered = isEdit
            ? arr.filter((c) => !isDescendantOrSelf(c, values.id!))
            : arr;
          setTree(filtered);
        }),
    );
    return () => {
      active = false;
    };
  }, [isEdit, values?.id]);

  return (
    <ModalForm<Company>
      title={isEdit ? '编辑公司' : '新建公司'}
      trigger={trigger as React.ReactElement<unknown>}
      initialValues={values ?? { parentId: 0, status: 1 }}
      width={640}
      onFinish={async (vals) => {
        try {
          const payload: Partial<Company> = { ...vals };
          if (payload.parentId === undefined) payload.parentId = 0;
          if (!isEdit) payload.parentId = payload.parentId ?? 0;
          if (isEdit && values?.id) {
            await updateCompany(values.id, payload);
          } else {
            await addCompany(payload);
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
        label="上级公司"
        allowClear
        fieldProps={{
          treeData: [
            {
              title: '主公司',
              value: 0,
              key: 0,
              children: tree.map(toTreeNode),
            },
          ],
          treeDefaultExpandAll: true,
        }}
      />
      <ProFormText
        name="companyName"
        label="公司名称"
        rules={[{ required: true }]}
      />
      <ProFormText
        name="companyCode"
        label="公司编码"
        rules={[{ required: true }]}
      />
      <ProFormText name="contactName" label="联系人" />
      <ProFormText name="contactPhone" label="联系电话" />
      <ProFormText name="address" label="地址" />
      <ProFormText name="logo" label="Logo URL" />
      <ProFormRadio.Group
        name="status"
        label="状态"
        options={[
          { label: '禁用', value: 0 },
          { label: '启用', value: 1 },
        ]}
        initialValue={1}
      />
      <ProFormTextArea name="remark" label="备注" fieldProps={{ rows: 3 }} />
    </ModalForm>
  );
};

type TreeNode = {
  title: string;
  value: number;
  key: number;
  children?: TreeNode[];
};

function toTreeNode(c: Company): TreeNode {
  return {
    title: c.companyName,
    value: c.id!,
    key: c.id!,
    children: c.children?.map(toTreeNode),
  };
}

function isDescendantOrSelf(c: Company, targetId: number): boolean {
  if (c.id === targetId) return true;
  if (!c.children) return false;
  return c.children.some((child) => isDescendantOrSelf(child, targetId));
}

export default CompanyForm;
