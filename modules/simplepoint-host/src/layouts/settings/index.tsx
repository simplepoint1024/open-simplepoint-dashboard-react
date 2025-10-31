import React, {useMemo, useState} from "react";
import {
  App as AntApp,
  Avatar as AntAvatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  List,
  Radio,
  Row,
  Segmented,
  Select,
  Space
} from "antd";
import {FontSizeOutlined, GlobalOutlined, ReloadOutlined, SkinOutlined, UserOutlined} from "@ant-design/icons";
import {useI18n} from '@/i18n';
import './index.css'

export const Settings: React.FC = () => {
  const {t, languages = [], locale, setLocale} = useI18n();
  const {message} = AntApp.useApp();

  // 主题与尺寸读写
  const readTheme = () => (localStorage.getItem('sp.theme') as 'light' | 'dark') || 'light';
  const readSize = () => (localStorage.getItem('sp.globalSize') as 'small' | 'middle' | 'large') || 'middle';
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(readTheme);
  const [sizeMode, setSizeMode] = useState<'small' | 'middle' | 'large'>(readSize);

  const languageOptions = useMemo(() => (languages || []).map(l => ({label: l.name, value: l.code})), [languages]);

  const onThemeChange = (val: 'light' | 'dark') => {
    try {
      localStorage.setItem('sp.theme', val);
    } catch {
    }
    setThemeMode(val);
    try {
      window.dispatchEvent(new CustomEvent('sp-set-theme', {detail: val}));
    } catch {
    }
    message.success(t('settings.themeUpdated', '主题已更新'));
  };

  const onSizeChange = (val: 'small' | 'middle' | 'large') => {
    try {
      localStorage.setItem('sp.globalSize', val);
    } catch {
    }
    setSizeMode(val);
    try {
      window.dispatchEvent(new CustomEvent('sp-set-size', {detail: val}));
    } catch {
    }
    message.success(t('settings.sizeUpdated', '尺寸已更新'));
  };

  const onLanguageChange = (val: string) => {
    setLocale(val);
    message.success(t('settings.langUpdated', '语言已更新'));
  };

  const onReset = () => {
    try {
      localStorage.removeItem('sp.theme');
      localStorage.removeItem('sp.globalSize');
      // 不直接清除 sp.locale，保留用户语言选择；如需恢复默认，可使用下方“恢复默认语言”
    } catch {
    }
    const nextTheme: 'light' | 'dark' = 'light';
    const nextSize: 'small' | 'middle' | 'large' = 'middle';
    setThemeMode(nextTheme);
    setSizeMode(nextSize);
    try {
      window.dispatchEvent(new CustomEvent('sp-set-theme', {detail: nextTheme}));
      window.dispatchEvent(new CustomEvent('sp-set-size', {detail: nextSize}));
    } catch {
    }
    message.success(t('settings.resetApplied', '已恢复默认外观设置'));
  };

  const onResetLang = () => {
    setLocale('zh-CN');
    message.success(t('settings.resetLangApplied', '已恢复默认语言：简体中文'));
  };

  const sampleData = [
    {title: t('settings.sampleItem', '示例条目 A'), desc: t('settings.sampleDesc', '这是一个示例描述')},
    {title: t('settings.sampleItem', '示例条目 B'), desc: t('settings.sampleDesc', '这是一个示例描述')},
  ];

  return (
    <div className="settings-page">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card className="settings-card" title={<Space><SkinOutlined/>{t('settings.appearance', '外观设置')}</Space>}>
            <Form layout="vertical" className="settings-form">
              <Form.Item label={t('settings.theme', '主题模式')}>
                <Segmented
                  className="seg-control"
                  value={themeMode}
                  onChange={v => onThemeChange(v as any)}
                  options={[
                    {label: t('settings.light', '浅色'), value: 'light'},
                    {label: t('settings.dark', '深色'), value: 'dark'},
                  ]}
                />
              </Form.Item>
              <Form.Item label={t('settings.size', '全局尺寸')}>
                <Radio.Group value={sizeMode} onChange={e => onSizeChange(e.target.value)}>
                  <Radio.Button value="small">{t('size.small', '小')}</Radio.Button>
                  <Radio.Button value="middle">{t('size.middle', '中')}</Radio.Button>
                  <Radio.Button value="large">{t('size.large', '大')}</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Divider className="form-divider"/>
              <Space wrap>
                <Button onClick={onReset} icon={<ReloadOutlined/>}>{t('action.reset', '恢复默认')}</Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="settings-card" title={<Space><GlobalOutlined/>{t('settings.i18n', '国际化')}</Space>}>
            <Form layout="vertical" className="settings-form">
              <Form.Item label={t('settings.language', '界面语言')}>
                <Select
                  className="lang-select"
                  value={locale}
                  options={languageOptions}
                  onChange={onLanguageChange}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
              <Form.Item label={t('settings.preview', '预览效果')}>
                <List
                  className="preview-list"
                  size="small"
                  dataSource={sampleData}
                  renderItem={(it, idx) => (
                    <List.Item key={idx}>
                      <List.Item.Meta
                        avatar={<AntAvatar size={24} icon={<UserOutlined/>}/>}
                        title={<span>{it.title}</span>}
                        description={it.desc}
                      />
                    </List.Item>
                  )}
                />
              </Form.Item>
              <Divider className="form-divider"/>
              <Space wrap>
                <Button onClick={onResetLang}>{t('action.resetLang', '恢复默认语言')}</Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col span={24}>
          <Card className="settings-card" title={<Space><FontSizeOutlined/>{t('settings.about', '关于本应用')}</Space>}>
            <Descriptions size="small" column={2} className="about-desc">
              <Descriptions.Item label={t('about.version', '版本')}>v1.0.0</Descriptions.Item>
              <Descriptions.Item label={t('about.license', '许可')}>MIT</Descriptions.Item>
              <Descriptions.Item label={t('about.repo', '仓库')}>simplepoint-react</Descriptions.Item>
              <Descriptions.Item label={t('about.ui', 'UI')}>Ant Design v5</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}