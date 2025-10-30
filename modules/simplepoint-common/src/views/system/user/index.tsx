import SimpleTable from "@simplepoint/libs-components/SimpleTable";

const App = () => {
  return (
    <div>
      <SimpleTable
        baseUrl={'/common/user'}
        name={'users'}
      />
    </div>
  );
};

export default App;