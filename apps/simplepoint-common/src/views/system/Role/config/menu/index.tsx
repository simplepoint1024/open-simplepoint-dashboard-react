import {Form, TreeSelect} from "antd";

export interface MenuConfigProps {
  selectRow: any;
}

const MenuConfig = (props: MenuConfigProps) => {
  console.log(props);
  return (
    <div>
      <Form>
        <TreeSelect/>
      </Form>
    </div>
  );
};

export default MenuConfig;