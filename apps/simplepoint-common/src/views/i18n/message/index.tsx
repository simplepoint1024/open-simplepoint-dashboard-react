import SimpleTable from "@simplepoint/libs-components/SimpleTable";
import {apis} from "@/api";

const App = () => {
  return (
    <div>
      <SimpleTable
        {...apis['i18n-messages']}
      />
    </div>
  );
};

export default App;