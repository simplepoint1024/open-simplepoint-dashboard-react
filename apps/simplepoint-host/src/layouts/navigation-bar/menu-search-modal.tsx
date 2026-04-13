import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {Input, List, Modal, Typography} from 'antd';
import {SearchOutlined} from '@ant-design/icons';
import {createIcon} from '@simplepoint/shared/types/icon.ts';
import type {MenuInfo} from '@/store/routes';
import {flattenMenus} from '@/store/routes';

interface MenuSearchModalProps {
  open: boolean;
  onClose: () => void;
  menus: MenuInfo[];
  onNavigate: (path: string) => void;
  t: (key: string, fallback: string) => string;
}

const MenuSearchModal: React.FC<MenuSearchModalProps> = ({open, onClose, menus, onNavigate, t}) => {
  const [keyword, setKeyword] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<ReturnType<typeof Input.Search> | null>(null);

  const leafMenus = useMemo(() => flattenMenus(menus), [menus]);

  const filtered = useMemo(() => {
    if (!keyword.trim()) return leafMenus;
    const lower = keyword.toLowerCase();
    return leafMenus.filter(m => {
      const label = (m.label || m.title || '').toLowerCase();
      const path = (m.path || '').toLowerCase();
      return label.includes(lower) || path.includes(lower);
    });
  }, [keyword, leafMenus]);

  useEffect(() => {
    setActiveIndex(0);
  }, [filtered]);

  useEffect(() => {
    if (!open) {
      setKeyword('');
      setActiveIndex(0);
    }
  }, [open]);

  const handleSelect = useCallback((menu: MenuInfo) => {
    if (menu.path) {
      onNavigate(menu.path);
      onClose();
    }
  }, [onNavigate, onClose]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      handleSelect(filtered[activeIndex]);
    }
  }, [filtered, activeIndex, handleSelect]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      closable={false}
      width={480}
      styles={{body: {padding: '12px 0 0'}}}
    >
      <Input
        ref={inputRef as React.RefObject<any>}
        autoFocus
        prefix={<SearchOutlined/>}
        placeholder={t('menu.search.placeholder', '搜索菜单…')}
        value={keyword}
        onChange={e => setKeyword(e.target.value)}
        onKeyDown={handleKeyDown}
        allowClear
        style={{marginBottom: 8, padding: '0 12px'}}
      />
      <List
        size="small"
        style={{maxHeight: 320, overflow: 'auto'}}
        dataSource={filtered.slice(0, 50)}
        locale={{emptyText: t('menu.search.empty', '没有匹配的菜单')}}
        renderItem={(item, index) => (
          <List.Item
            key={item.path || String(item.id)}
            onClick={() => handleSelect(item)}
            style={{
              cursor: 'pointer',
              padding: '8px 16px',
              background: index === activeIndex ? 'var(--ant-primary-1, #e6f4ff)' : undefined,
            }}
            onMouseEnter={() => setActiveIndex(index)}
          >
            <List.Item.Meta
              avatar={item.icon ? createIcon(item.icon) : undefined}
              title={t(item.title || '', item.label || item.title || '')}
              description={
                <Typography.Text type="secondary" style={{fontSize: 12}}>
                  {item.path}
                </Typography.Text>
              }
            />
          </List.Item>
        )}
      />
      <div style={{padding: '6px 16px', borderTop: '1px solid var(--ant-color-border, #f0f0f0)', fontSize: 12, color: '#999'}}>
        ↑↓ {t('menu.search.hint.navigate', '导航')} &nbsp; ↵ {t('menu.search.hint.open', '打开')} &nbsp; Esc {t('menu.search.hint.close', '关闭')}
      </div>
    </Modal>
  );
};

export default MenuSearchModal;
