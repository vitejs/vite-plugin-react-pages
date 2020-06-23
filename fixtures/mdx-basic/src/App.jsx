import React, { useState } from "react";
import Doc from "./Doc.mdx";

const App = () => {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>
        count: {count}
        <button
          onClick={() => {
            setCount(count + 1);
          }}
        >
          add count
        </button>
      </p>
      <Doc />
    </div>
  );
};

export default App;
