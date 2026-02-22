import { Navigate } from "react-router";
import { defaultExample } from "@/lib/examples";
export default function ExamplesPage() {
  return <Navigate to={`/examples/${defaultExample.slug}`} replace />;
}
