import { Sidebar } from "../../components/sidebar";
import { Canvas } from "../../components/canvas";
import { BuilderDndProvider } from "../../components/provider";

export default function Page() {
  return (
    <BuilderDndProvider>
      <div className="flex h-screen gap-5 p-5">
        <Sidebar />
        <Canvas />
      </div>
    </BuilderDndProvider>
  );
}
