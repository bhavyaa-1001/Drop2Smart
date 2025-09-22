import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAssessmentByMongoId } from "../utils/apiUtils";

export default function AssessmentResult() {
  const { mongoId } = useParams();        // <-- grabs value from /results/:mongoId
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAssessmentByMongoId(mongoId)
      .then(setData)
      .catch((e) => setError(e.message));
  }, [mongoId]);

  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!data) return <p>Loading assessment...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Assessment Result</h1>
      <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
