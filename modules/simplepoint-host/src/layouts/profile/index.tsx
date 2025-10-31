import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Button, Card, Col, Descriptions, Empty, Form, Input, message, Row, Skeleton, Space, Tag, Typography } from "antd";
import { UserOutlined, EditOutlined, SaveOutlined, ReloadOutlined } from "@ant-design/icons";
import { useI18n } from '@/i18n';
import { get } from "@simplepoint/libs-shared/types/request.ts";
import './index.css'

export const Profile: React.FC = () => {
  const { t, ensure } = useI18n();
  // 增量加载 profile 命名空间
  useEffect(() => { ensure(['profile']).catch(() => {}); }, [ensure]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();

  const load = async () => {
    setLoading(true);
    try {
      const res = await get<any>('/userinfo');
      setData(res || null);
      form.setFieldsValue({
        nickname: res?.nickname || res?.name || '',
        email: res?.email || '',
        phone: res?.phone || '',
      });
    } catch (_) {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const roles: string[] = useMemo(() => {
    const r = data?.roles;
    if (Array.isArray(r)) return r as string[];
    if (typeof r === 'string') return r.split(',').map((s: string) => s.trim()).filter(Boolean);
    return [];
  }, [data]);

  const onSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      // 此处可对接真实更新接口，例如：await post('/profile/update', values)
      await new Promise(r => setTimeout(r, 600));
      setData((prev: any) => ({ ...prev, ...values }));
      message.success(t('profile.saveSuccess','保存成功'));
      setEditMode(false);
    } catch (_) {
      // 校验失败或用户取消
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Card className="profile-card">
            {loading ? (
              <Skeleton avatar active paragraph={{ rows: 2 }} />
            ) : data ? (
              <div className="avatar-card">
                <Avatar size={72} icon={!data?.picture ? <UserOutlined /> : undefined} src={data?.picture} />
                <Typography.Title className="profile-name" level={5}>
                  {data?.nickname || data?.name || t('user.defaultName','用户')}
                </Typography.Title>
                <Typography.Paragraph className="profile-sub">
                  {data?.email || t('profile.noEmail','未绑定邮箱')}
                </Typography.Paragraph>
                <Space>
                  <Button icon={<ReloadOutlined />} onClick={load} size="small">
                    {t('action.refresh','刷新')}
                  </Button>
                  {!editMode ? (
                    <Button type="primary" icon={<EditOutlined />} onClick={() => setEditMode(true)} size="small">
                      {t('action.edit','编辑')}
                    </Button>
                  ) : (
                    <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={onSave} size="small">
                      {t('action.save','保存')}
                    </Button>
                  )}
                </Space>
              </div>
            ) : (
              <Empty />
            )}
          </Card>
        </Col>
        <Col xs={24} md={16}>
          <Card className="profile-card" title={t('profile.basic','基本信息')} extra={!loading && data ? (
            !editMode ? <Button type="link" icon={<EditOutlined />} onClick={() => setEditMode(true)}>{t('action.edit','编辑')}</Button> :
            <Space>
              <Button onClick={() => { form.resetFields(); setEditMode(false); }}>
                {t('action.cancel','取消')}
              </Button>
              <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={onSave}>
                {t('action.save','保存')}
              </Button>
            </Space>
          ) : undefined}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : !data ? (
              <Empty />
            ) : !editMode ? (
              <Descriptions column={1} size="middle" labelStyle={{ width: 120 }}>
                <Descriptions.Item label={t('field.username','用户名')}>
                  {data?.username || data?.name || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('field.nickname','昵称')}>
                  {data?.nickname || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('field.email','邮箱')}>
                  {data?.email || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('field.phone','手机号')}>
                  {data?.phone || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('field.roles','角色')}>
                  {roles.length > 0 ? roles.map(r => (<Tag key={r} color="blue">{r}</Tag>)) : '-'}
                </Descriptions.Item>
                <Descriptions.Item label={t('field.joinedAt','加入时间')}>
                  {data?.joinedAt || data?.createTime || '-'}
                </Descriptions.Item>
              </Descriptions>
            ) : (
              <Form layout="vertical" form={form} className="profile-form">
                <Form.Item name="nickname" label={t('field.nickname','昵称')} rules={[{ required: true, message: t('rule.nickname','请输入昵称') }]}>
                  <Input maxLength={32} placeholder={t('ph.nickname','请输入昵称')} />
                </Form.Item>
                <Form.Item name="email" label={t('field.email','邮箱')} rules={[{ type: 'email', message: t('rule.email','邮箱格式不正确') }]}>
                  <Input maxLength={64} placeholder={t('ph.email','请输入邮箱')} />
                </Form.Item>
                <Form.Item name="phone" label={t('field.phone','手机号')}>
                  <Input maxLength={20} placeholder={t('ph.phone','请输入手机号')} />
                </Form.Item>
              </Form>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}