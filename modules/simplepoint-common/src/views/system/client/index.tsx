import SimpleTable from "@simplepoint/libs-components/SimpleTable";

const App = () => {
  return (
    <div>
      <SimpleTable
        baseUrl={'/common/oidc/clients'}
        name={'oidc-clients'}
      />
    </div>
  );
};

export default App;