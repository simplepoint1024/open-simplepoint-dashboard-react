import SimpleTable from "@simplepoint/libs-components/SimpleTable";
import {apis} from "@/api";

const App = () => {
  return (
    <div>
      <SimpleTable
        {...apis['i18n-languages']}
      />
    </div>
  );
};

export default App;