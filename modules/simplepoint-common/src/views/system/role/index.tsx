import SimpleTable from "@simplepoint/libs-components/SimpleTable";
import {apis} from "@/api";

const App = () => {
  return (
    <div>
      <SimpleTable
        {...apis['rbac-roles']}
      />
    </div>
  );
};

export default App;