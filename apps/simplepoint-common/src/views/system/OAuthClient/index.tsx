import api from '@/api/index';
import SimpleTable from "@simplepoint/components/SimpleTable";

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