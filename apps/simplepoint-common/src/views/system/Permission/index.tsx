import SimpleTable from "@simplepoint/components/SimpleTable";
import api from '@/api/index';

const App = () => {
  return (
    <div>
      <SimpleTable
        {...api['rbac-permissions']}
      />
    </div>
  );
};

export default App;