import SimpleTable from "@simplepoint/libs-components/SimpleTable";

const App = () => {
  return (
    <div>
      <SimpleTable
        baseUrl={'/common/role'}
        name={'roles'}
      />
    </div>
  );
};

export default App;