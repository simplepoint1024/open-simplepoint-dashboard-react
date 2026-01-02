import SimpleTable from "@simplepoint/components/SimpleTable";
import api from '@/api/index';
import {useI18n} from '@simplepoint/shared/hooks/useI18n';
import React, {useEffect, useState, useCallback} from "react";
import {Drawer} from "antd";
import RoleConfig from "./config/role";
const baseConfig = api['rbac-users'];


const App = () => {
  const {t, ensure, locale} = useI18n();
  const [userId, setUserId] = useState(null as string | null);
  const [open, setOpen] = useState(false);
  // 新增：可拖拽高度状态（仅 bottom / top 方向有效）
  const [drawerHeight, setDrawerHeight] = useState<number>(480);

  // 关闭时重置高度，避免下次打开过高或过低
  useEffect(() => {
    if (!open) {
      setDrawerHeight(480);
    }
  }, [open]);

  // 拖拽开始函数
  const startResize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = drawerHeight;
    const minHeight = 240;
    const maxHeight = Math.max(320, window.innerHeight - 80); // 预留头部与安全边距

    const onMove = (me: MouseEvent) => {
      const delta = startY - me.clientY; // 向上拖动增高（bottom 抽屉）
      let next = startHeight + delta;
      if (next < minHeight) next = minHeight;
      if (next > maxHeight) next = maxHeight;
      setDrawerHeight(next);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [drawerHeight]);

  // 确保本页所需命名空间加载（users/roles），语言切换后也会自动增量加载
  useEffect(() => {
    void ensure(baseConfig.i18nNamespaces);
  }, [ensure, locale]);

  const customButtonEvents = {
    'config.role': (_keys: React.Key[], rows: any[]) => {
      setOpen(true);
      setUserId(rows[0].id)
    },
  } as const;


  return (
    <div>
      <SimpleTable
        {...baseConfig}
        customButtonEvents={customButtonEvents}
      />
      <Drawer
        title={t("users.button.config.role")}
        open={open}
        onClose={() => { setOpen(false); setUserId(null); }}
        placement={"bottom"}
        // 传递动态高度
        height={drawerHeight}
        destroyOnHidden
        styles={{
          body: { position: 'relative', paddingTop: 12 },
        }}
      >
        {/* 拖拽句柄：放在内容顶部，absolute 定位覆盖全宽 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            cursor: 'ns-resize',
            zIndex: 10,
            // 视觉提示：一条浅色横线（可自定义主题）
          }}
          onMouseDown={startResize}
        />
        <RoleConfig key={userId || 'none'} userId={userId}/>
      </Drawer>
    </div>
  );
};

export default App;
