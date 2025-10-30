import SimpleTable from "@simplepoint/libs-components/SimpleTable";

const App = () => {
  return (
    <div>
      <SimpleTable
        baseUrl={'/common/menus'}
        name={'menus'}
      />
    </div>
  );
};

export default App;