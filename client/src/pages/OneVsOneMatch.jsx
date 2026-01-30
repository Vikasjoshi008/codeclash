import React from "react";
import { useParams } from "react-router-dom";

const OneVsOneMatch = () => {
  const { matchId } = useParams();

  return (
    <div className="text-white" style={{ padding: "40px" }}>
      <h2>🔥 1v1 Match Started</h2>
      <p>Match ID: {matchId}</p>
    </div>
  );
};

export default OneVsOneMatch;
