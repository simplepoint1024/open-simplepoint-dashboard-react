import api from '@/api/index';
import SimpleTable from "@simplepoint/libs-components/SimpleTable";

const App = () => {
  return (
    <div>
      <SimpleTable
        {...api['oidc-clients']}
      />
    </div>
  );
};

export default App;