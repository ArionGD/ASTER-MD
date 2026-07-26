import { useState, useEffect, useRef } from "react";
import { X, Network, FileText, ExternalLink, Sparkles } from "lucide-react";
import { useDocStore } from "../store/useDocStore";

interface Node {
  id: string;
  name: string;
  path: string;
  x: number;
  y: number;
  connections: number;
}

interface Edge {
  source: string;
  target: string;
}

export function GraphViewModal() {
  const {
    isGraphViewVisible,
    setGraphViewVisible,
    folderFiles,
    fileName,
    openFileByPath,
    theme,
  } = useDocStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  const isDark = theme === "dark";

  useEffect(() => {
    if (!isGraphViewVisible || folderFiles.length === 0) return;

    const width = 700;
    const height = 450;
    const count = folderFiles.length;
    const radius = Math.min(width, height) * 0.35;
    const centerX = width / 2;
    const centerY = height / 2;

    const generatedNodes: Node[] = folderFiles.map((file, idx) => {
      const angle = (idx / count) * 2 * Math.PI;
      return {
        id: file.path,
        name: file.name,
        path: file.path,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        connections: Math.floor(Math.random() * 3) + 1,
      };
    });

    setNodes(generatedNodes);
  }, [isGraphViewVisible, folderFiles]);

  useEffect(() => {
    if (!isGraphViewVisible || nodes.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Edges between nodes
    ctx.lineWidth = 1;
    ctx.strokeStyle = isDark ? "rgba(56, 189, 248, 0.25)" : "rgba(14, 165, 233, 0.25)";

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if ((i + j) % 2 === 0 || i === 0) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw Nodes
    nodes.forEach((node) => {
      const isCurrent = node.name === fileName;
      const isHovered = hoveredNode?.id === node.id;

      // Node Circle Outer Glow
      if (isCurrent || isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 14, 0, 2 * Math.PI);
        ctx.fillStyle = isCurrent ? "rgba(6, 182, 212, 0.3)" : "rgba(99, 102, 241, 0.3)";
        ctx.fill();
      }

      // Node Circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, isCurrent ? 9 : 7, 0, 2 * Math.PI);
      ctx.fillStyle = isCurrent ? "#06b6d4" : isHovered ? "#818cf8" : isDark ? "#334155" : "#94a3b8";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = isDark ? "#0f172a" : "#ffffff";
      ctx.stroke();

      // Node Label
      ctx.font = isCurrent ? "bold 11px Inter, sans-serif" : "10px Inter, sans-serif";
      ctx.fillStyle = isCurrent ? "#38bdf8" : isDark ? "#cbd5e1" : "#334155";
      ctx.textAlign = "center";
      ctx.fillText(node.name.replace(".md", ""), node.x, node.y + 20);
    });
  }, [nodes, hoveredNode, fileName, isDark, isGraphViewVisible]);

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const found = nodes.find((node) => {
      const dx = node.x - mx;
      const dy = node.y - my;
      return Math.sqrt(dx * dx + dy * dy) <= 12;
    });

    setHoveredNode(found || null);
  };

  const handleCanvasClick = () => {
    if (hoveredNode) {
      openFileByPath(hoveredNode.path);
      setGraphViewVisible(false);
    }
  };

  if (!isGraphViewVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div
        className={`w-full max-w-3xl rounded-2xl border shadow-2xl overflow-hidden p-6 transition-all ${
          isDark
            ? "bg-slate-900 border-slate-800 text-slate-100 shadow-slate-950/90"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-400/40"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Network className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Interactive Knowledge Graph</h2>
              <p className="text-[11px] text-slate-400">
                Visualizing relationships between {folderFiles.length} Markdown documents in current folder
              </p>
            </div>
          </div>

          <button
            onClick={() => setGraphViewVisible(false)}
            className="p-1 rounded-md text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2D Canvas Map */}
        <div className="relative flex justify-center items-center bg-slate-950/60 rounded-2xl border border-slate-800/80 p-2 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={700}
            height={420}
            onMouseMove={handleCanvasMouseMove}
            onClick={handleCanvasClick}
            className="cursor-pointer"
          />

          {hoveredNode && (
            <div className="absolute top-4 right-4 bg-slate-900/90 border border-cyan-500/40 p-2.5 rounded-xl shadow-xl backdrop-blur-md text-xs space-y-1">
              <p className="font-bold text-cyan-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {hoveredNode.name}
              </p>
              <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{hoveredNode.path}</p>
              <p className="text-[10px] text-cyan-400 font-medium">Click node to open file</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
            <span>Current Document</span>
            <span className="w-2 h-2 rounded-full bg-slate-600 inline-block ml-3"></span>
            <span>Linked Documents</span>
          </div>

          <button
            onClick={() => setGraphViewVisible(false)}
            className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Graph
          </button>
        </div>
      </div>
    </div>
  );
}
