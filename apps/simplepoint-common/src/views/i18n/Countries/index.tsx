import SimpleTable from "@simplepoint/components/SimpleTable";
import api from '@/api/index';

const App = () => {
  return (
    <div>
      <SimpleTable
        {...api['i18n-countries']}
      />
    </div>
  );
};

export default App;