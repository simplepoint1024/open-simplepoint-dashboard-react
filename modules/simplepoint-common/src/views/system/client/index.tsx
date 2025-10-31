import {apis} from "@/api";
import SimpleTable from "@simplepoint/libs-components/SimpleTable";

const App = () => {
  return (
    <div>
      <SimpleTable
        {...apis['oidc-clients']}
      />
    </div>
  );
};

export default App;