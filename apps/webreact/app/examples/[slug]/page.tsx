import { useParams, Navigate } from "react-router";
import { getExampleBySlug } from "@/lib/examples";
import { ExampleViewer } from "@/components/example-viewer";

/**
 * Example Page - renders example by slug from URL params.
 */
export default function ExamplePage() {
  const { slug } = useParams<{ slug: string }>();
  const example = slug ? getExampleBySlug(slug) : undefined;

  if (!example) {
    return <Navigate to="/examples" replace />;
  }

  return <ExampleViewer example={example} code={null} />;
}
