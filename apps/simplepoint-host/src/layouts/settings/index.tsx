import React, {useMemo, useState, useEffect} from "react";
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
  Space,
  Tag
} from "antd";
import {FontSizeOutlined, GlobalOutlined, ReloadOutlined, SkinOutlined, UserOutlined, DesktopOutlined, MoonOutlined, SunOutlined} from "@ant-design/icons";
import {useI18n} from "@/layouts/i18n/useI18n.ts";
import './index.css'

export const Settings: React.FC = () => {
  const {t, languages = [], locale, setLocale, ensure} = useI18n();
  // 增量加载 settings 命名空间
  useEffect(() => { ensure(['settings']).catch(() => {}); }, [ensure]);

  const {message} = AntApp.useApp();

  const readTheme = () => (localStorage.getItem('sp.theme') as 'light'|'dark'|'system') || 'light';
  const readSize = () => (localStorage.getItem('sp.globalSize') as 'small'|'middle'|'large') || 'middle';
  const [themeMode, setThemeMode] = useState<'light'|'dark'|'system'>(readTheme);
  const [sizeMode, setSizeMode] = useState<'small'|'middle'|'large'>(readSize);
  const getSystemTheme = (): 'light'|'dark' => {
    try { return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch { return 'light'; }
  };
  const [resolvedTheme, setResolvedTheme] = useState<'light'|'dark'>(() => themeMode === 'system' ? getSystemTheme() : (themeMode as 'light'|'dark'));
  useEffect(() => {
    if (themeMode !== 'system') { setResolvedTheme(themeMode as 'light'|'dark'); return; }
    const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : (null as any);
    const apply = () => setResolvedTheme(getSystemTheme());
    apply();
    if (mq && mq.addEventListener) mq.addEventListener('change', apply);
    else if (mq && (mq as any).addListener) (mq as any).addListener(apply);
    return () => {
      if (mq && mq.removeEventListener) mq.removeEventListener('change', apply);
      else if (mq && (mq as any).removeListener) (mq as any).removeListener(apply);
    };
  }, [themeMode]);

  useEffect(() => {
    const handler = (e: any) => setThemeMode((e?.detail as any) || 'light');
    window.addEventListener('sp-set-theme', handler as EventListener);
    return () => window.removeEventListener('sp-set-theme', handler as EventListener);
  }, []);

  const languageOptions = useMemo(() => (languages || []).map(l => ({ label: l.name, value: l.code })), [languages]);

  const onThemeChange = (val: 'light'|'dark'|'system') => {
    try { localStorage.setItem('sp.theme', val); } catch {}
    setThemeMode(val);
    try { window.dispatchEvent(new CustomEvent('sp-set-theme', { detail: val })); } catch {}
    message.success(t('settings.themeUpdated','主题已更新'));
  };

  const onSizeChange = (val: 'small'|'middle'|'large') => {
    try { localStorage.setItem('sp.globalSize', val); } catch {}
    setSizeMode(val);
    try { window.dispatchEvent(new CustomEvent('sp-set-size', { detail: val })); } catch {}
    message.success(t('settings.sizeUpdated','尺寸已更新'));
  };

  const onLanguageChange = (val: string) => {
    setLocale(val);
    message.success(t('settings.langUpdated','语言已更新'));
  };

  const onReset = () => {
    try {
      localStorage.removeItem('sp.theme');
      localStorage.removeItem('sp.globalSize');
    } catch {}
    const nextTheme: 'light'|'dark'|'system' = 'light';
    const nextSize: 'small'|'middle'|'large' = 'middle';
    setThemeMode(nextTheme);
    setSizeMode(nextSize);
    try {
      window.dispatchEvent(new CustomEvent('sp-set-theme', { detail: nextTheme }));
      window.dispatchEvent(new CustomEvent('sp-set-size', { detail: nextSize }));
    } catch {}
    message.success(t('settings.resetApplied','已恢复默认外观设置'));
  };

  const onResetLang = () => {
    setLocale('zh-CN');
    message.success(t('settings.resetLangApplied','已恢复默认语言：简体中文'));
  };

  const sampleData = [
    { title: t('settings.sampleItem','示例条目 A'), desc: t('settings.sampleDesc','这是一个示例描述') },
    { title: t('settings.sampleItem','示例条目 B'), desc: t('settings.sampleDesc','这是一个示例描述') },
  ];

  const modeLabel = themeMode === 'system' ? t('settings.system','跟随系统') : (themeMode === 'dark' ? t('settings.dark','深色') : t('settings.light','浅色'));
  const resolvedLabel = resolvedTheme === 'dark' ? t('settings.dark','深色') : t('settings.light','浅色');

  return (
    <div className="settings-page">
      <Row gutter={[16,16]}>
        <Col xs={24} lg={12}>
          <Card className="settings-card" title={<Space><SkinOutlined/>{t('settings.appearance','外观设置')}</Space>}>
            <Form layout="vertical" className="settings-form">
              <Form.Item label={t('settings.theme','主题模式')}>
                <Segmented
                  className="seg-control"
                  value={themeMode}
                  onChange={v => onThemeChange(v as any)}
                  options={[
                    { label: t('settings.light','浅色'), value: 'light', icon: <SunOutlined/> },
                    { label: t('settings.dark','深色'), value: 'dark', icon: <MoonOutlined/> },
                    { label: t('settings.system','跟随系统'), value: 'system', icon: <DesktopOutlined/> },
                  ]}
                />
                <div style={{marginTop:8}}>
                  <Space size={8} wrap>
                    <Tag color="blue">{t('settings.theme','主题模式')}: {modeLabel}</Tag>
                    <Tag>{t('settings.preview','预览效果')}: {resolvedLabel}</Tag>
                  </Space>
                </div>
              </Form.Item>
              <Form.Item label={t('settings.size','全局尺寸')}>
                <Radio.Group value={sizeMode} onChange={e => onSizeChange(e.target.value)}>
                  <Radio.Button value="small">{t('size.small','小')}</Radio.Button>
                  <Radio.Button value="middle">{t('size.middle','中')}</Radio.Button>
                  <Radio.Button value="large">{t('size.large','大')}</Radio.Button>
                </Radio.Group>
              </Form.Item>
              <Divider className="form-divider"/>
              <Space wrap>
                <Button onClick={onReset} icon={<ReloadOutlined/>}>{t('action.reset','恢复默认')}</Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="settings-card" title={<Space><GlobalOutlined/>{t('settings.i18n','国际化')}</Space>}>
            <Form layout="vertical" className="settings-form">
              <Form.Item label={t('settings.language','界面语言')}>
                <Select
                  className="lang-select"
                  value={locale}
                  options={languageOptions}
                  onChange={onLanguageChange}
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
              <Form.Item label={t('settings.preview','预览效果')}>
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
                <Button onClick={onResetLang}>{t('action.resetLang','恢复默认语言')}</Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col span={24}>
          <Card className="settings-card" title={<Space><FontSizeOutlined/>{t('settings.about','关于本应用')}</Space>}>
            <Descriptions size="small" column={2} className="about-desc">
              <Descriptions.Item label={t('about.version','版本')}>v1.0.0</Descriptions.Item>
              <Descriptions.Item label={t('about.license','许可')}>{t('about.licenseValue','Apache-2.0 license')}</Descriptions.Item>
              <Descriptions.Item label={t('about.repo','仓库')}>
                <a href="https://github.com/simplepoint1024/open-simplepoint-dashboard-react" target="_blank" rel="noopener noreferrer">
                  github.com/simplepoint1024/open-simplepoint-dashboard-react
                </a>
              </Descriptions.Item>
              <Descriptions.Item label={t('about.ui','UI')}>Ant Design v5</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </div>
  );
}