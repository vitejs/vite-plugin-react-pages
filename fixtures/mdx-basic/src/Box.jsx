import React from "react";
import "./Box.css";

import styled from "styled-components";

const ScBox = styled.div`
  border: 1px solid red;
`;

function Box() {
  return <ScBox className="box">This is a box.</ScBox>;
}

export default Box;
