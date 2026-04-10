import React, { useCallback, useState } from "react";
import ReactFlow, {
  addEdge,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  Node,
  MarkerType,
  Handle,
  Position,
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
  ReactFlowProvider,
  useViewport,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  ChevronLeft,
  Edit3,
  RotateCcw,
  RotateCw,
  Cloud,
  Play,
  ChevronDown,
  MessageSquare,
  CheckCircle2,
  Clock,
  FileText,
  Zap,
  Search,
  History,
  Sparkles,
  MousePointer2,
  Plus,
  Minus,
  Maximize,
  Mic,
  ArrowUpCircle,
  Settings,
  ListFilter,
  User,
  Check,
  X,
  Mail,
  UserPlus,
  Webhook,
  Bot,
  ShieldCheck,
  Keyboard,
  BarChart3,
  StickyNote,
  Shuffle,
  EyeOff,
  Trash2,
  Copy,
  Pencil,
  Palette,
  MoreVertical,
  Filter,
  ArrowLeft,
  Info,
  Lightbulb,
  Layers,
  Grid,
  Gift,
  UserCircle,
  Ban,
  ChevronRight,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import ActionsLibrary from "../components/ActionsLibrary";
import WorkflowSettings from "../components/WorkflowSettings";
import EnrollmentHistory from "../components/EnrollmentHistory";
import ExecutionLogs from "../components/ExecutionLogs";

// --- Custom Components ---

// 0. AI Hub Node (The "Infinite Header")
const AIHubNode = ({ data }: any) => {
  const [prompt, setPrompt] = useState("");

  const suggestions = [
    { icon: User, label: "Lead Nurturing" },
    { icon: ListFilter, label: "Form Automation" },
    { icon: MessageSquare, label: "Email Campaigns" },
  ];

  return (
    <div className="w-[650px] flex flex-col items-center">
      <div className="w-full bg-white rounded-2xl shadow-[0_20px_50px_rgba(147,51,234,0.08)] border border-purple-100/50 p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">
                What do you want to automate?
              </h2>
              <span className="text-[9px] font-black bg-gray-900 text-white px-1.5 py-0.5 rounded tracking-widest">
                BETA
              </span>
            </div>
            <p className="text-sm text-gray-400 font-medium">
              Build workflows for free by chatting with AI
            </p>
          </div>
        </div>

        {/* Search Input Box */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl blur-xl group-focus-within:opacity-100 opacity-0 transition-opacity" />
          <div className="relative flex items-center gap-4 bg-gray-50/50 border border-gray-100 rounded-xl p-4 focus-within:bg-white transition-all shadow-inner">
            <div className="flex-1 nodrag nopan nowheel">
              <textarea
                className="w-full bg-transparent border-none outline-none focus:outline-none resize-none text-gray-800 placeholder:text-gray-300 focus:ring-0 text-sm leading-relaxed font-semibold cursor-text nodrag nowheel min-h-[60px] pr-24"
                placeholder="If appointment status changes to no-show, wait 15 minutes"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex gap-3 items-center nodrag nopan">
              <Mic className="w-5 h-5 text-gray-300 hover:text-purple-500 cursor-pointer transition-colors" />
              <button
                onClick={() => data.onGenerate && data.onGenerate(prompt)}
                className="w-8 h-8 rounded-full bg-purple-500 hover:bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 transition-all active:scale-95 group cursor-pointer"
              >
                <ArrowUpCircle className="w-5 h-5 group-hover:translate-y-[-1px] transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Suggestions */}
        <div className="flex items-center gap-2 nodrag nopan nowheel">
          {suggestions.map((tag) => (
            <button
              key={tag.label}
              onClick={() => setPrompt(tag.label)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-full text-[11px] font-bold text-gray-600 hover:bg-gray-50 hover:border-purple-200 hover:text-purple-600 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <tag.icon className="w-3.5 h-3.5 text-blue-500" />
              {tag.label}
            </button>
          ))}
          <button className="text-[11px] font-bold text-gray-400 hover:text-purple-600 px-3 py-2 cursor-pointer transition-colors">
            more
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center mt-16 mb-8 gap-5 w-full opacity-60">
        <div className="h-[1px] flex-1 bg-gray-900" />
        <span className="text-[10px] font-black text-gray-900 uppercase tracking-[0.4em] whitespace-nowrap px-6">
          Or
        </span>
        <div className="h-[1px] flex-1 bg-gray-900" />
      </div>
    </div>
  );
};

// 1. Custom Trigger Node
const TriggerNode = ({ data, id }: any) => {
  const Icon = data.icon || Zap;
  return (
    <div
      className="group relative nodrag nopan"
      onClick={(e) => {
        e.stopPropagation();
        data.onNodeClick && data.onNodeClick(id);
      }}
    >
      <div className="min-w-[220px] bg-white border border-dashed border-primary-400/60 rounded-2xl px-6 py-4 flex items-center gap-4 hover:border-primary-500 hover:bg-primary-50/10 transition-all shadow-sm hover:shadow-lg cursor-pointer group">
        <div
          className={`w-10 h-10 rounded-xl ${data.color || "bg-primary-50 text-primary-600"} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}
        >
          {typeof Icon === "function" ? (
            <Icon className="w-5 h-5 stroke-[2.5px]" />
          ) : (
            <Zap className="w-5 h-5 stroke-[2.5px]" />
          )}
        </div>
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-0.5">
            {data.type || "Trigger"}
          </p>
          <span className="text-gray-900 font-bold text-sm">{data.label}</span>
        </div>
        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
          <Edit3 className="w-3.5 h-3.5 text-gray-300" />
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-primary-500 !w-3 !h-3 !border-2 !border-white !shadow-sm"
      />
    </div>
  );
};

// 2. Custom Action Node
const ActionNode = ({ data, id }: any) => {
  const Icon = data.icon || MessageSquare;
  return (
    <div
      className={`w-[280px] group bg-white border ${data.selected ? "border-primary-500 ring-2 ring-primary-500/10" : "border-gray-200"} rounded-2xl px-5 py-4 shadow-sm hover:shadow-xl transition-all border-l-4 ${data.borderColor || "border-l-primary-500"} nodrag nopan relative cursor-pointer`}
      onClick={(e) => {
        e.stopPropagation();
        data.onNodeClick && data.onNodeClick(id);
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-300 !w-2 !h-2"
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          data.onDelete && data.onDelete(id);
        }}
        className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-xl opacity-0 group-hover:opacity-100 transition-all z-10 hover:scale-110 active:scale-90"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-4">
        <div
          className={`w-11 h-11 rounded-xl ${data.color || "bg-primary-50 text-primary-600"} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
        >
          {typeof Icon === "function" ? (
            <Icon className="w-5.5 h-5.5" />
          ) : (
            <MessageSquare className="w-5.5 h-5.5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.15em] mb-0.5 truncate">
            {data.type || "Action"}
          </p>
          <p className="text-sm font-bold text-gray-800 truncate">
            {data.label}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-300 !w-2 !h-2"
      />
    </div>
  );
};

// 2.5 Custom Condition Node (Branching)
const ConditionNode = ({ data, id }: any) => (
  <div
    className="w-[300px] group bg-white border border-purple-200 rounded-2xl px-5 py-5 shadow-sm hover:shadow-xl transition-all border-t-4 border-t-purple-500 nodrag nopan relative cursor-pointer"
    onClick={(e) => {
      e.stopPropagation();
      data.onNodeClick && data.onNodeClick(id);
    }}
  >
    <Handle
      type="target"
      position={Position.Top}
      className="!bg-gray-300 !w-2 !h-2"
    />

    <button
      onClick={(e) => {
        e.stopPropagation();
        data.onDelete && data.onDelete(id);
      }}
      className="absolute -top-2 -right-2 w-7 h-7 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-xl opacity-0 group-hover:opacity-100 transition-all z-10"
    >
      <X className="w-4 h-4" />
    </button>

    <div className="text-center mb-4">
      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3 shadow-sm group-hover:rotate-12 transition-transform">
        <ShieldCheck className="w-6 h-6" />
      </div>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-1">
        Condition
      </p>
      <p className="text-sm font-bold text-gray-900 px-2">
        {data.label || "If/Else"}
      </p>
    </div>

    <div className="flex justify-between items-center pt-4 border-t border-gray-50 mt-2">
      <div className="flex flex-col items-center gap-2 flex-1">
        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">
          Yes
        </span>
        <Handle
          type="source"
          position={Position.Bottom}
          id="yes"
          className="!bg-green-500 !w-3 !h-3 !relative !left-0 !transform-none !mt-1"
        />
      </div>
      <div className="w-[1px] h-8 bg-gray-100" />
      <div className="flex flex-col items-center gap-2 flex-1">
        <span className="text-[10px] font-bold text-red-600 bg-red-50 px-3 py-1 rounded-full uppercase tracking-widest">
          No
        </span>
        <Handle
          type="source"
          position={Position.Bottom}
          id="no"
          className="!bg-red-500 !w-3 !h-3 !relative !left-0 !transform-none !mt-1"
        />
      </div>
    </div>
  </div>
);

// 3. Custom End Node
const EndNode = ({ data }: any) => (
  <div className="px-8 py-2 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center shadow-sm">
    <Handle
      type="target"
      position={Position.Top}
      className="!bg-gray-400 !w-2 !h-2"
    />
    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">
      {data.label}
    </span>
  </div>
);

// 4. Custom Edge with circular "+" button
const ButtonEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, strokeWidth: 2, stroke: "#e2e8f0" }}
      />
      <foreignObject
        width={30}
        height={30}
        x={labelX - 15}
        y={labelY - 15}
        className="overflow-visible"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div className="flex justify-center items-center w-full h-full">
          <button
            onClick={() => data?.onAddNode && data.onAddNode(id)}
            className="w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:scale-110 hover:bg-primary-50 hover:border-primary-200 transition-all text-gray-400 hover:text-primary-500 nodrag nopan"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </foreignObject>
    </>
  );
};

const StickyNoteNode = ({ id, data, selected }: any) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [text, setText] = useState(data.label === "Double click to add note..." ? "" : (data.label || ""));

  const onBlur = () => {
    setIsEditing(false);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, label: text || "Double click to add note..." } };
        }
        return node;
      }),
    );
  };

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((n) => n.id !== id));
  };

  const onDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => {
      const node = nds.find((n) => n.id === id);
      if (!node) return nds;
      const newNode = {
        ...node,
        id: `sticky-${Date.now()}`,
        position: { x: node.position.x + 40, y: node.position.y + 40 },
        selected: false,
      };
      return [...nds, newNode];
    });
  };

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      className={`relative w-64 h-64 p-6 rounded-xl shadow-lg border-slate-800 border-[1.5px] transition-all flex flex-col ${data.color || "bg-yellow-50"} ${selected ? "ring-4 ring-primary-500/10" : ""}`}
    >
      {/* Centered Node Toolbar */}
      {selected && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-transparent px-2 py-1 duration-200">
          <button
            onClick={onDuplicate}
            className="text-slate-700 hover:text-black transition-all"
            title="Duplicate"
          >
            <Copy className="w-5 h-5 stroke-[2.5px]" />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="text-slate-700 hover:text-black transition-all"
            title="Edit Note"
          >
            <Pencil className="w-5 h-5 stroke-[2.5px]" />
          </button>
          <button
            onClick={onDelete}
            className="text-slate-700 hover:text-black transition-all"
            title="Delete"
          >
            <Trash2 className="w-5 h-5 stroke-[2.5px]" />
          </button>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowColors(!showColors);
              }}
              className="text-slate-700 hover:text-black transition-all"
              title="Change Color"
            >
              <Palette className="w-5 h-5 stroke-[2.5px]" />
            </button>
            
            {showColors && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 p-2 bg-white border border-gray-100 rounded-xl shadow-2xl flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 z-[100]">
                {[
                  { bg: "bg-yellow-50", border: "" },
                  { bg: "bg-blue-50", border: "" },
                  { bg: "bg-green-50", border: "" },
                  { bg: "bg-orange-50", border: "" },
                  { bg: "bg-purple-50", border: "" },
                  { bg: "bg-pink-50", border: "" },
                ].map((c, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation();
                      setNodes((nds) => nds.map((n) => n.id === id ? { ...n, data: { ...n.data, color: c.bg } } : n));
                      setShowColors(false);
                    }}
                    className={`w-6 h-6 rounded-full ${c.bg} border border-gray-100 hover:scale-110 transition-transform`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isEditing ? (
        <textarea
          autoFocus
          className="w-full h-full bg-transparent border-none outline-none resize-none text-sm font-medium text-gray-700 placeholder:text-gray-400 nodrag nopan"
          value={text}
          placeholder="Double click to add note..."
          onChange={(e) => setText(e.target.value)}
          onBlur={onBlur}
        />
      ) : (
        <p className="text-sm font-medium text-gray-700 whitespace-pre-wrap flex-1 overflow-hidden nodrag">
          {text || <span className="text-gray-400 italic opacity-50">Double click to add note...</span>}
        </p>
      )}
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
};

const nodeTypes = {
  aihub: AIHubNode,
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  stickyNote: StickyNoteNode,
  end: EndNode,
};

const edgeTypes = {
  button: ButtonEdge,
};

// --- Initial Data ---
const initialNodes: Node[] = [
  {
    id: "ai-header",
    type: "aihub",
    position: { x: 200, y: 50 },
    data: {},
    draggable: false,
    selectable: true,
  },
  {
    id: "start",
    type: "trigger",
    position: { x: 400, y: 500 },
    data: {
      label: "Add New Trigger",
      type: "CRM",
      icon: UserPlus,
      color: "bg-green-50 text-green-600",
    },
  },
  {
    id: "end",
    type: "end",
    position: { x: 435, y: 700 },
    data: { label: "END" },
  },
];

const initialEdges: Edge[] = [
  {
    id: "e-start-end",
    source: "start",
    target: "end",
    type: "button",
    markerEnd: { type: MarkerType.ArrowClosed, color: "#cbd5e1" },
  },
];

function WorkflowBuilderContent() {
  const navigate = useNavigate();
  const { orgId } = useParams();
  const {
    zoomIn,
    zoomOut,
    setViewport,
    fitView: reactFlowFitView,
  } = useReactFlow();
  const { zoom } = useViewport();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [libraryContext, setLibraryContext] = useState<{
    edgeId?: string;
    nodeId?: string;
  } | null>(null);

  // Helper to open library
  const openLibrary = (context: { edgeId?: string; nodeId?: string }) => {
    setLibraryContext(context);
    setIsLibraryOpen(true);
  };

  const handleNodeClick = (id: string) => {
    if (id === "start") {
      setTriggerStep("list");
      setIsTriggerModalOpen(true);
      setIsSettingsOpen(false);
      return;
    }
    setSelectedNodeId(id);
    setIsSettingsOpen(true);
  };

  const initialNodesWithActions: Node[] = initialNodes.map((node) => {
    if (node.id === "start") {
      return {
        ...node,
        data: {
          ...node.data,
          onAddTrigger: (id: string) => openLibrary({ nodeId: id }),
          onNodeClick: handleNodeClick,
        },
      };
    }
    if (node.id === "ai-header") {
      return {
        ...node,
        data: {
          ...node.data,
          onGenerate: (prompt: string) => handleGenerate(prompt),
        },
      };
    }
    return { ...node, data: { ...node.data, onNodeClick: handleNodeClick } };
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodesWithActions,
  );

  const initialEdgesWithActions: Edge[] = initialEdges.map((edge) => ({
    ...edge,
    data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) },
  }));

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdgesWithActions,
  );
  const [activeTab, setActiveTab] = useState("Builder");
  const [isPublished, setIsPublished] = useState(false);
  const [builderType, setBuilderType] = useState("Standard");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [activeShortcutTab, setActiveShortcutTab] = useState("Essential");
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isErrorsOpen, setIsErrorsOpen] = useState(false);
  const [isStickyPickerOpen, setIsStickyPickerOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isFindReplaceOpen, setIsFindReplaceOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [switcherSearchQuery, setSwitcherSearchQuery] = useState("");
  const [showStickyNotes, setShowStickyNotes] = useState(true);
  const [workflowNote, setWorkflowNote] = useState("");
  const [isWorkflowNoteExpanded, setIsWorkflowNoteExpanded] = useState(true);
  const [isActionNotesExpanded, setIsActionNotesExpanded] = useState(true);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [triggerStep, setTriggerStep] = useState<"list" | "config">("list");
  const [selectedTrigger, setSelectedTrigger] = useState<any>(null);
  const [triggerSearch, setTriggerSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<any[]>([]);

  // Name Edit State
  const [workflowName, setWorkflowName] = useState("New Workflow");
  const [isEditingName, setIsEditingName] = useState(false);
  const workflowId = "1775734314152";

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) => addEdge({ ...params, type: "button" }, eds)),
    [setEdges],
  );

  const updateNodeLabel = (id: string, newLabel: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, label: newLabel } };
        }
        return node;
      }),
    );
  };

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      if (selectedNodeId === nodeId) setIsSettingsOpen(false);
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      setEdges((eds) => {
        // Heal the connection: connect source of deleted node to target of deleted node
        const incoming = eds.find((e) => e.target === nodeId);
        const outgoing = eds.find((e) => e.source === nodeId);

        let newEds = eds.filter(
          (e) => e.source !== nodeId && e.target !== nodeId,
        );

        if (incoming && outgoing) {
          newEds.push({
            ...incoming,
            id: `e-${incoming.source}-${outgoing.target}`,
            target: outgoing.target,
            data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) },
          });
        }
        return newEds;
      });
    },
    [selectedNodeId, setNodes, setEdges],
  );

  const handleDuplicateNode = useCallback(
    (nodeId: string) => {
      const nodeToDuplicate = nodes.find((n) => n.id === nodeId);
      if (!nodeToDuplicate) return;

      const newNodeId = `node-${Date.now()}`;
      const newNode: Node = {
        ...nodeToDuplicate,
        id: newNodeId,
        position: {
          x: nodeToDuplicate.position.x + 100,
          y: nodeToDuplicate.position.y + 100,
        },
        selected: false,
      };

      setNodes((nds) => [...nds, newNode]);
      setIsSettingsOpen(false);
    },
    [nodes, setNodes],
  );

  const handleGenerate = (prompt: string) => {
    // Basic "Magic" Simulation
    const isMissedCall =
      prompt.toLowerCase().includes("missed") ||
      prompt.toLowerCase().includes("7-day");

    if (isMissedCall) {
      const templateNodes: Node[] = [
        {
          id: "ai-header",
          type: "aihub",
          position: { x: 200, y: 50 },
          data: { onGenerate: (p: string) => handleGenerate(p) },
          draggable: false,
          selectable: false,
        },
        {
          id: "start",
          type: "trigger",
          position: { x: 400, y: 500 },
          data: {
            label: "Inbound Call: Missed",
            type: "CRM",
            onAddTrigger: () => {
              // Enforce mutual exclusivity
              setIsNotesOpen(false);
              setIsErrorsOpen(false);
              setIsStickyPickerOpen(false);
              setIsSwitcherOpen(false);
              setIsFindReplaceOpen(false);
              setIsHistoryOpen(false);
              
              setTriggerStep("list");
              setIsTriggerModalOpen(true);
            },
            onNodeClick: handleNodeClick,
          },
        },
        {
          id: "node-1",
          type: "action",
          position: { x: 360, y: 650 },
          data: {
            label: "Wait 30 Seconds",
            type: "Logic",
            onDelete: handleDeleteNode,
          },
        },
        {
          id: "node-2",
          type: "action",
          position: { x: 360, y: 800 },
          data: {
            label: 'Send SMS: "Sorry I missed you..."',
            type: "Messaging",
            onDelete: handleDeleteNode,
          },
        },
        {
          id: "node-3",
          type: "action",
          position: { x: 360, y: 950 },
          data: {
            label: "Wait 1 Day",
            type: "Logic",
            onDelete: handleDeleteNode,
          },
        },
        {
          id: "node-4",
          type: "action",
          position: { x: 360, y: 1100 },
          data: {
            label: "Send Email: Follow up",
            type: "Messaging",
            onDelete: handleDeleteNode,
          },
        },
        {
          id: "end",
          type: "end",
          position: { x: 435, y: 1250 },
          data: { label: "END" },
        },
      ];

      const templateEdges: Edge[] = [
        {
          id: "e-1",
          source: "start",
          target: "node-1",
          type: "button",
          data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) },
        },
        {
          id: "e-2",
          source: "node-1",
          target: "node-2",
          type: "button",
          data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) },
        },
        {
          id: "e-3",
          source: "node-2",
          target: "node-3",
          type: "button",
          data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) },
        },
        {
          id: "e-4",
          source: "node-3",
          target: "node-4",
          type: "button",
          data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) },
        },
        {
          id: "e-5",
          source: "node-4",
          target: "end",
          type: "button",
          data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) },
        },
      ];

      setNodes(templateNodes);
      setEdges(templateEdges);
    }
  };

  const onSelectFromLibrary = (item: any) => {
    setIsLibraryOpen(false);

    if (libraryContext?.edgeId) {
      const edge = edges.find((e) => e.id === libraryContext.edgeId);
      if (!edge) return;

      const newNodeId = `node-${Date.now()}`;
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);

      if (!sourceNode || !targetNode) return;

      const newY = sourceNode.position.y + 200;
      const newNode: Node = {
        id: newNodeId,
        type: item.id === "if-else" ? "condition" : "action",
        position: {
          x: sourceNode.position.x - (item.id === "if-else" ? 10 : 0),
          y: newY,
        },
        data: {
          label: item.label,
          type: item.title || "Action",
          icon: item.icon,
          color:
            item.color.replace("text-", "bg-").replace("-500", "-50") +
            " " +
            item.color,
          borderColor: "border-l-" + item.color.split("-")[1] + "-500",
          onDelete: handleDeleteNode,
          onNodeClick: handleNodeClick,
        },
      };

      const shiftedNodes = nodes.map((node) => {
        if (
          node.position.y >= targetNode.position.y &&
          node.id !== "ai-header"
        ) {
          return {
            ...node,
            position: { ...node.position, y: node.position.y + 300 },
          };
        }
        return node;
      });

      const newEdge1: Edge = {
        id: `e-${edge.source}-${newNodeId}`,
        source: edge.source,
        target: newNodeId,
        type: "button",
        data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#cbd5e1" },
      };

      const newEdge2: Edge = {
        id: `e-${newNodeId}-${edge.target}`,
        source: newNodeId,
        sourceHandle: item.id === "if-else" ? "yes" : undefined,
        target: edge.target,
        type: "button",
        data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#cbd5e1" },
      };

      setNodes([...shiftedNodes, newNode]);
      setEdges([...edges.filter((e) => e.id !== edge.id), newEdge1, newEdge2]);
    } else if (libraryContext?.nodeId) {
      // Just update existing node if it's a trigger change
      setNodes(
        nodes.map((n) => {
          if (n.id === libraryContext.nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                label: item.label,
                type: item.title,
                icon: item.icon,
                color:
                  item.color.replace("text-", "bg-").replace("-500", "-50") +
                  " " +
                  item.color,
              },
            };
          }
          return n;
        }),
      );
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f8fafc] overflow-hidden font-sans">
      {/* 1. Primary Header */}
      <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate(`/org/${orgId}/automation`)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors font-semibold"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">Back to Workflows</span>
          </button>
        </div>

        <div className="flex items-center flex-1 justify-center px-4">
          <div className="flex items-center gap-2 group max-w-[600px]">
            {isEditingName ? (
              <div className="flex items-center gap-2 bg-gray-50 border border-primary-200 rounded-lg px-2 py-1">
                <input
                  autoFocus
                  className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-900 w-auto min-w-[100px]"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && setIsEditingName(false)
                  }
                />
                <button
                  onClick={() => setIsEditingName(false)}
                  className="text-primary-600"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-all"
              >
                <h1
                  className="text-[#101828] font-normal text-lg"
                  id="cmp-header__txt--edit-workflow-name"
                >
                  {workflowName} :{" "}
                  <span className="text-[#667085] font-normal">
                    {workflowId}
                  </span>
                </h1>
                <Edit3 className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#155EEF] transition-colors ml-1" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
              <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-[10px] font-bold ring-2 ring-white shadow-sm">
                VS
              </div>
              <div className="flex gap-2.5">
                <RotateCcw className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                <RotateCw className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
              </div>
            </div>
            <FileText className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
          </div>

          <div className="flex items-center gap-1.5 text-gray-400">
            <Cloud className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Saved
            </span>
          </div>

          <button className="px-4 py-1.5 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-all border border-primary-100">
            Test Workflow
          </button>

          <button className="h-9 px-4 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-all border border-primary-100 flex items-center gap-2">
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>

          <div className="flex items-center gap-3 ml-2">
            <span
              className={`text-[10px] font-bold uppercase ${!isPublished ? "text-gray-900" : "text-gray-400"}`}
            >
              Draft
            </span>
            <button
              onClick={() => setIsPublished(!isPublished)}
              className={`w-9 h-4.5 rounded-full relative transition-all ${isPublished ? "bg-primary-500" : "bg-gray-200"}`}
            >
              <div
                className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all ${isPublished ? "right-0.5" : "left-0.5"}`}
              />
            </button>
            <span
              className={`text-[10px] font-bold uppercase ${isPublished ? "text-gray-900" : "text-gray-400"}`}
            >
              Publish
            </span>
          </div>
        </div>
      </header>

      {/* 2. Sub-Header (Tabs & Settings) */}
      <div className="h-[48px] bg-white border-b border-gray-100 flex items-center justify-between px-6 z-20 shrink-0">
        <div className="relative">
          <div
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className="flex items-center border border-gray-200 rounded-lg px-2.5 py-1.5 gap-2 cursor-pointer hover:bg-gray-50 bg-white transition-all shadow-sm"
          >
            <span className="text-[11px] font-bold text-gray-700">
              {builderType} Builder
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showTypeDropdown ? "rotate-180" : ""}`}
            />
          </div>

          {showTypeDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
              <button
                onClick={() => {
                  setBuilderType("Standard");
                  setShowTypeDropdown(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors flex items-center justify-between"
              >
                Standard Builder
                {builderType === "Standard" && <Plus className="w-3 h-3" />}
              </button>
              <div className="h-[1px] bg-gray-50 mx-2" />
              <button
                onClick={() => {
                  setBuilderType("Advanced");
                  setShowTypeDropdown(false);
                }}
                className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-400 hover:bg-gray-50 flex items-center justify-between cursor-not-allowed"
              >
                <span>Advanced Builder</span>
                <span className="text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">
                  Later
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center h-full gap-8">
          {["Builder", "Settings", "Enrollment History", "Execution Logs"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`h-full px-2 text-[11px] font-bold transition-all border-b-2 flex items-center uppercase tracking-wider ${
                  activeTab === tab
                    ? "text-primary-600 border-primary-600"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        <div className="w-[140px]" />
      </div>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Vertical Tool Rail */}
        <aside className="w-[56px] bg-white border-r border-gray-100 flex flex-col items-center py-6 gap-6 z-50 shrink-0 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
          {[
            { icon: MessageSquare, label: "Notes", shortcut: "⇧C" },
            { icon: CheckCircle2, label: "No errors found", shortcut: "" },
            { icon: BarChart3, label: "Stats View", shortcut: "⌘⇧S" },
            { icon: StickyNote, label: "Sticky Notes", shortcut: "" },
            { icon: Shuffle, label: "Workflow Switcher", shortcut: "⇧W" },
            { icon: Search, label: "Find and Replace", shortcut: "⌥F" },
            { icon: History, label: "Version History", shortcut: "⇧V" },
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="group relative flex items-center justify-center"
              onClick={() => {
                const label = item.label;
                if (label === "Version History") {
                  setIsHistoryOpen(!isHistoryOpen);
                  setIsNotesOpen(false);
                  setIsErrorsOpen(false);
                  setIsStickyPickerOpen(false);
                  setIsSwitcherOpen(false);
                  setIsFindReplaceOpen(false);
                } else if (label === "Find and Replace") {
                  setIsFindReplaceOpen(!isFindReplaceOpen);
                  setIsNotesOpen(false);
                  setIsErrorsOpen(false);
                  setIsStickyPickerOpen(false);
                  setIsSwitcherOpen(false);
                  setIsHistoryOpen(false);
                } else if (label === "Sticky Notes") {
                  setIsStickyPickerOpen(!isStickyPickerOpen);
                  setIsNotesOpen(false);
                  setIsErrorsOpen(false);
                  setIsSwitcherOpen(false);
                  setIsFindReplaceOpen(false);
                  setIsHistoryOpen(false);
                } else if (label === "Workflow Switcher") {
                  setIsSwitcherOpen(!isSwitcherOpen);
                  setIsNotesOpen(false);
                  setIsErrorsOpen(false);
                  setIsStickyPickerOpen(false);
                  setIsFindReplaceOpen(false);
                  setIsHistoryOpen(false);
                } else if (label === "Notes") {
                  setIsNotesOpen(!isNotesOpen);
                  setIsErrorsOpen(false);
                  setIsStickyPickerOpen(false);
                  setIsSwitcherOpen(false);
                  setIsFindReplaceOpen(false);
                  setIsHistoryOpen(false);
                } else if (label === "No errors found") {
                  setIsErrorsOpen(!isErrorsOpen);
                  setIsNotesOpen(false);
                  setIsStickyPickerOpen(false);
                  setIsSwitcherOpen(false);
                  setIsFindReplaceOpen(false);
                  setIsHistoryOpen(false);
                } else {
                  // Other icons clicked, maybe close sidebars?
                  setIsStickyPickerOpen(false);
                  setIsFindReplaceOpen(false);
                  setIsHistoryOpen(false);
                }
              }}
            >
              <item.icon className={`w-4 h-4 cursor-pointer transition-colors ${((item.label === "Notes" && isNotesOpen) || (item.label === "No errors found" && isErrorsOpen) || (item.label === "Sticky Notes" && isStickyPickerOpen) || (item.label === "Workflow Switcher" && isSwitcherOpen) || (item.label === "Find and Replace" && isFindReplaceOpen) || (item.label === "Version History" && isHistoryOpen)) ? "text-primary-600" : "text-gray-400 hover:text-gray-600"}`} />
              <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[9999] shadow-2xl flex items-center gap-2">
                <span>{item.label}</span>
                {item.shortcut && (
                  <span className="text-[9px] text-gray-400 bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 font-medium">
                    {item.shortcut}
                  </span>
                )}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-gray-900" />
              </div>
            </div>
          ))}
          
          <div className="flex-1" />
          
          <div className="group relative flex items-center justify-center">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 cursor-pointer hover:bg-purple-100 transition-colors">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-purple-600 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-[9999] shadow-2xl flex items-center gap-2">
                <span>Workflow AI</span>
                <span className="text-[9px] text-purple-300 bg-purple-700/50 px-1.5 py-0.5 rounded border border-purple-500/50 font-medium whitespace-nowrap">⇧A</span>
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-y-4 border-y-transparent border-r-4 border-r-purple-600" />
            </div>
          </div>
        </aside>

        {/* Notes Sidebar (Left) */}
        {isNotesOpen && (
          <aside className="w-[320px] bg-white border-r border-gray-100 flex flex-col z-20 shadow-xl overflow-hidden transition-all animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-50">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-gray-900">Notes</h3>
                <button
                  onClick={() => setIsNotesOpen(false)}
                  className="p-1.5 hover:bg-gray-50 text-gray-400 hover:text-gray-600 rounded-lg transition-all"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                Add or review comments for workflow and actions.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {/* Workflow Note Section */}
              <div className="mb-2">
                <button
                  onClick={() =>
                    setIsWorkflowNoteExpanded(!isWorkflowNoteExpanded)
                  }
                  className="w-full flex items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-all text-gray-900 group"
                >
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isWorkflowNoteExpanded ? "rotate-0" : "-rotate-90"}`}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Workflow Note
                  </span>
                </button>

                {isWorkflowNoteExpanded && (
                  <div className="px-3 pt-2 pb-4">
                    <div className="relative">
                      <textarea
                        className="w-full h-40 bg-white border-2 border-gray-100 rounded-xl p-3 text-sm font-medium text-gray-700 focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none resize-none placeholder:text-gray-300"
                        placeholder="Please Input"
                        value={workflowNote}
                        onChange={(e) => setWorkflowNote(e.target.value)}
                        maxLength={5000}
                      />
                      <div className="absolute bottom-3 right-3 text-[10px] font-bold text-gray-300">
                        {workflowNote.length} / 5000
                      </div>
                    </div>
                    <p className="mt-3 text-[10px] text-gray-400 font-medium flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      Workflow note will be saved when workflow is saved
                    </p>
                  </div>
                )}
              </div>

              {/* Action Notes Section */}
              <div className="mb-2">
                <button
                  onClick={() =>
                    setIsActionNotesExpanded(!isActionNotesExpanded)
                  }
                  className="w-full flex items-center gap-2 p-3 hover:bg-gray-50 rounded-xl transition-all text-gray-900 group"
                >
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${isActionNotesExpanded ? "rotate-0" : "-rotate-90"}`}
                  />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Action Notes
                  </span>
                </button>

                {isActionNotesExpanded && (
                  <div className="py-8 text-center px-4">
                    <p className="text-xs text-gray-400 font-medium italic">
                      No action notes
                    </p>
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Sticky Notes Picker (Floating) */}
        {isStickyPickerOpen && (
          <div className="absolute left-16 top-1/4 z-50 bg-white border border-gray-100 rounded-2xl p-4 shadow-2xl flex flex-col gap-4 animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="grid grid-cols-2 gap-3">
              {[
                { bg: "bg-yellow-50", border: "border-yellow-200" },
                { bg: "bg-blue-50", border: "border-blue-200" },
                { bg: "bg-green-50", border: "border-green-200" },
                { bg: "bg-orange-50", border: "border-orange-200" },
                { bg: "bg-cyan-50", border: "border-cyan-200" },
                { bg: "bg-slate-50", border: "border-slate-200" },
                { bg: "bg-teal-50", border: "border-teal-200" },
                { bg: "bg-purple-50", border: "border-purple-200" },
                { bg: "bg-pink-50", border: "border-pink-200" },
                { bg: "bg-red-50", border: "border-red-200" },
                { bg: "bg-indigo-50", border: "border-indigo-200" },
                { bg: "bg-amber-50", border: "border-amber-200" },
              ].map((style, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const id = `sticky-${Date.now()}`;
                    const center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
                    const newNode = {
                      id,
                      type: "stickyNote",
                      position: { x: 400, y: 300 },
                      data: { color: `${style.bg}`, label: "Double click to add note..." },
                    };
                    
                    // Actually use the reactflow viewport if possible
                    // But we are inside the component return.
                    // I'll grab the setNodes from props or state.
                    setNodes((nds) => [...nds, newNode]);
                  }}
                  className={`w-10 h-10 rounded-lg border-2 ${style.bg} ${style.border} hover:scale-110 transition-transform shadow-sm`}
                />
              ))}
            </div>
            <button
              onClick={() => {
                setShowStickyNotes(!showStickyNotes);
                setIsStickyPickerOpen(false);
              }}
              className="w-full py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-[10px] font-bold text-gray-400 uppercase tracking-wider hover:bg-gray-100 hover:text-gray-600 transition-all"
            >
              {showStickyNotes ? "Hide Notes" : "Show Notes"}
            </button>
          </div>
        )}

        {/* Version History Sidebar (Left) */}
        {isHistoryOpen && (
          <aside className="w-[320px] bg-white border-r border-gray-100 flex flex-col z-20 shadow-xl overflow-hidden animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 bg-gray-50/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Version History</h3>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-white text-gray-400 hover:text-gray-900 rounded-lg transition-all">
                    <Filter className="w-5 h-5 stroke-[1.5px]" />
                  </button>
                  <button
                    onClick={() => setIsHistoryOpen(false)}
                    className="p-1.5 hover:bg-white text-gray-400 hover:text-gray-900 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5 stroke-[1.5px]" />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.05em] leading-normal pr-4">
                Version history is kept for 30 days, or the last 10 versions if older.
              </p>
            </div>

            {/* Version List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Current Version */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Current Version</h4>
                <div className="bg-white border-2 border-primary-100/50 rounded-2xl p-4 shadow-sm relative group">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        v2
                      </span>
                      <button className="text-[10px] font-bold text-primary-600 hover:text-primary-700 underline underline-offset-2">
                        Save Version
                      </button>
                    </div>
                    <button className="p-1 text-gray-300 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-primary-100 flex items-center justify-center">
                        <History className="w-2.5 h-2.5 text-primary-600" />
                      </div>
                      <p className="text-[11px] font-bold text-gray-400">Apr 10th, 1:11 pm</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-600 text-[10px] font-black tracking-widest uppercase">
                      Auto-Saved
                    </span>
                  </div>
                </div>
              </div>

              {/* Previous Versions */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Previous Versions</h4>
                <div 
                  onClick={() => setIsViewOnly(true)}
                  className={`bg-gray-50/30 border rounded-2xl p-4 hover:bg-white hover:border-primary-500 hover:shadow-lg transition-all group cursor-pointer ${isViewOnly ? 'border-primary-500 bg-white ring-4 ring-primary-500/5' : 'border-gray-100'}`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <h5 className="text-[11px] font-bold text-gray-900 truncate mb-0.5">New Workflow : 1775803949372</h5>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          v1
                        </span>
                        <button className="text-[10px] font-bold text-gray-400 hover:text-primary-600 underline underline-offset-2">
                          Restore
                        </button>
                      </div>
                    </div>
                    <button className="p-1 text-gray-300 hover:text-gray-600 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <History className="w-2.5 h-2.5 text-gray-400" />
                      </div>
                      <p className="text-[11px] font-bold text-gray-400">Apr 10th, 2:52 am</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-400 text-[10px] font-black tracking-widest uppercase">
                      Draft
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Find and Replace Sidebar (Left) */}
        {isFindReplaceOpen && (
          <aside className="w-[320px] bg-white border-r border-gray-100 flex flex-col z-20 shadow-xl overflow-hidden animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 bg-gray-50/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Find and Replace</h3>
                <button
                  onClick={() => setIsFindReplaceOpen(false)}
                  className="p-1.5 hover:bg-white text-gray-400 hover:text-gray-900 rounded-lg transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.05em] leading-relaxed">
                Find by Custom Values, Tags or Text
              </p>
            </div>

            {/* Form Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Find Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Find by Custom Values</h4>
                <div className="flex gap-2">
                  <div className="flex-[2] relative group">
                    <button className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-gray-400 text-left flex items-center justify-between hover:bg-white hover:border-primary-500 transition-all">
                      <span>Select custom value</span>
                      <ChevronDown className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>
                  <div className="flex-1 relative group">
                    <button className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-gray-400 text-left flex items-center justify-between hover:bg-white hover:border-primary-500 transition-all">
                      <span>Custom Value</span>
                      <ChevronDown className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Replace Section */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Replace Custom Value With</h4>
                <div className="flex gap-2">
                  <div className="flex-1 relative group">
                    <button className="w-full bg-gray-50/50 border border-gray-100 rounded-xl px-4 py-3 text-xs font-semibold text-gray-400 text-left flex items-center justify-between hover:bg-white hover:border-primary-500 transition-all">
                      <span>Select replace custom value</span>
                      <ChevronDown className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>
                  <button className="p-3 bg-gray-50/50 border border-gray-100 rounded-xl text-gray-300 hover:text-gray-600 hover:bg-white transition-all">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-50 bg-gray-50/10">
              <div className="flex items-center justify-between">
                <button className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors">
                  Clear
                </button>
                <div className="flex gap-3">
                  <button className="px-6 py-2.5 bg-gray-50 border border-gray-100 text-gray-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-gray-600 transition-all shadow-sm">
                    Replace
                  </button>
                  <button className="px-6 py-2.5 bg-gray-50 border border-gray-100 text-gray-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-gray-600 transition-all shadow-sm">
                    Replace All
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Workflow Switcher Sidebar (Left) */}
        {isSwitcherOpen && (
          <aside className="w-[320px] bg-white border-r border-gray-100 flex flex-col z-20 shadow-xl overflow-hidden animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 bg-gray-50/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-gray-900 tracking-tight">Workflow Switcher</h3>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-white text-gray-400 hover:text-gray-900 rounded-lg transition-all">
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setIsSwitcherOpen(false)}
                    className="p-1.5 hover:bg-white text-gray-400 hover:text-gray-900 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.05em] leading-relaxed">
                Quickly switch or search workflows without leaving your build ever.
              </p>
            </div>

            {/* Search Area */}
            <div className="p-4 border-b border-gray-50">
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search Workflow name"
                  value={switcherSearchQuery}
                  onChange={(e) => setSwitcherSearchQuery(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-700 placeholder:text-gray-400 outline-none focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/5 transition-all"
                />
              </div>
            </div>

            {/* Workflow List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Current Workflow */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Current Workflow</h4>
                <div className="bg-white border-2 border-primary-100/50 rounded-2xl p-4 shadow-sm relative group cursor-pointer hover:border-primary-500 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-gray-400 mb-1 leading-tight group-hover:text-primary-600 transition-colors">
                        Edited: April 10th 2026, 12:24 pm
                      </p>
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-[10px] font-black tracking-widest text-gray-500 uppercase">
                        Draft
                      </span>
                    </div>
                    <button className="p-1 text-gray-300 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Workflows */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Recent Workflows</h4>
                <div className="space-y-3">
                  {[
                    { name: "New Workflow : 1775734314152", date: "April 10th 2026, 12:12 pm", status: "Draft" },
                    { name: "New Workflow : 1775732350134", date: "April 9th 2026, 5:01 pm", status: "Draft" },
                    { name: "Onboarding Completed", date: "February 19th 2026, 4:20 am", status: "Published" },
                    { name: "New Workflow : 1763014889315", date: "November 13th 2025, 11:51 am", status: "Draft" },
                  ].map((wf, i) => (
                    <div key={i} className="bg-gray-50/30 border border-gray-100 rounded-2xl p-4 hover:bg-white hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/5 transition-all group cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h5 className="text-xs font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">{wf.name}</h5>
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] font-medium text-gray-400 whitespace-nowrap">Edited: {wf.date}</p>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase ${wf.status === 'Published' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                              {wf.status}
                            </span>
                          </div>
                        </div>
                        <button className="p-1 text-gray-300 hover:text-gray-600 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* Errors Sidebar (Left) */}
        {isErrorsOpen && (
          <aside className="w-[320px] bg-white border-r border-gray-100 flex flex-col z-20 shadow-xl overflow-hidden transition-all animate-in slide-in-from-left duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-50 bg-gray-50/30">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold text-gray-900">0 Errors</h3>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-white text-gray-400 hover:text-gray-600 rounded-lg transition-all">
                    <EyeOff className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsErrorsOpen(false)}
                    className="p-1.5 hover:bg-white text-gray-400 hover:text-gray-600 rounded-lg transition-all"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium leading-relaxed">
                You are all good to go
              </p>
            </div>

            {/* Empty State Illustration */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
              <div className="w-48 h-48 opacity-80 group">
                <img 
                  src="file:///C:/Users/DELL/.gemini/antigravity/brain/88439a1d-5bc3-4c6e-bf07-edb21f773fee/kite_illustration_1775805101069.png" 
                  alt="No Errors Illustration" 
                  className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-700"
                />
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-3 py-2 px-6 bg-green-50 border border-green-100 rounded-full mx-auto w-fit">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                    <Check className="w-4 h-4 stroke-[3px]" />
                  </div>
                  <span className="text-sm font-bold text-green-700 tracking-tight">Zero Errors</span>
                </div>
                <p className="text-xs text-gray-400 font-medium">You are all good to go</p>
              </div>
            </div>
          </aside>
        )}

        {/* Add Trigger Modal Overlay */}
        {isTriggerModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" 
              onClick={() => setIsTriggerModalOpen(false)}
            />
            
            {/* Modal Container */}
            <div className="relative w-full max-w-[500px] bg-white rounded-[24px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
              {triggerStep === "list" ? (
                <>
                  {/* Modal Header */}
                  <div className="p-8 pb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-[#101828] tracking-tight">Add Trigger</h3>
                      <p className="text-sm text-gray-400 mt-1">Select the event that starts the workflow.</p>
                    </div>
                    <button onClick={() => setIsTriggerModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 transition-colors">
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Search & Tabs */}
                  <div className="px-8 pb-0 space-y-6">
                    <div className="flex gap-2.5">
                      <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:bg-gray-50 transition-all shadow-sm">
                        <Grid className="w-5 h-5" />
                      </button>
                      <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                        <input
                          type="text"
                          placeholder="Search For Triggers"
                          value={triggerSearch}
                          onChange={(e) => setTriggerSearch(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-gray-700 placeholder:text-gray-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex border-b border-gray-100">
                      <button className="flex-1 pb-3 text-sm font-bold text-primary-600 border-b-2 border-primary-600 flex items-center justify-center gap-2.5">
                        <Zap className="w-4 h-4 fill-primary-600/10" /> Triggers
                      </button>
                      <button className="flex-1 pb-3 text-sm font-bold text-gray-400 border-b-2 border-transparent hover:text-gray-600 flex items-center justify-center gap-2.5 transition-all">
                        <Layers className="w-4 h-4" /> Apps
                      </button>
                    </div>
                  </div>

                  {/* Trigger List Body */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {/* Recent Triggers */}
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-between group">
                        <h4 className="text-sm font-bold text-gray-900">Recent Triggers</h4>
                        <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors" />
                      </button>
                      <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                        <div 
                          onClick={() => {
                            setSelectedTrigger({ name: "Birthday Reminder", desc: "Runs on each Contact's birthday at the time you select." });
                            setTriggerStep("config");
                          }}
                          className="flex items-center justify-between p-4 bg-white cursor-pointer hover:bg-gray-50 transition-all group"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                              <Gift className="w-5 h-5 text-blue-500" />
                            </div>
                            <span className="text-sm font-bold text-gray-700">Birthday Reminder</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                        </div>
                      </div>
                    </div>

                    {/* Contact Category */}
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-between group">
                        <h4 className="text-sm font-bold text-gray-900">Contact</h4>
                        <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors" />
                      </button>
                      <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm divide-y divide-gray-50">
                        {[
                          { name: "Birthday Reminder", icon: Gift, color: "text-blue-500", bg: "bg-blue-50" },
                          { name: "Contact Changed", icon: UserCircle, color: "text-primary-500", bg: "bg-primary-50" },
                          { name: "Contact Created", icon: UserPlus, color: "text-primary-500", bg: "bg-primary-50" },
                          { name: "Contact DND", icon: Ban, color: "text-red-500", bg: "bg-red-50" },
                        ].map((t, i) => (
                          <div 
                            key={i} 
                            onClick={() => {
                              setSelectedTrigger({ name: t.name, desc: `Specific event logic for ${t.name}.` });
                              setTriggerStep("config");
                            }}
                            className="flex items-center justify-between p-4 bg-white cursor-pointer hover:bg-gray-50 transition-all group"
                          >
                            <div className="flex items-center gap-3.5">
                              <div className={`w-10 h-10 ${t.bg} rounded-xl flex items-center justify-center shrink-0`}>
                                <t.icon className={`w-5 h-5 ${t.color}`} />
                              </div>
                              <span className="text-sm font-bold text-gray-700">{t.name}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transition-colors" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Modal Config Header */}
                  <div className="p-8 border-b border-gray-50 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button onClick={() => setTriggerStep("list")} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-900 transition-all">
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h3 className="text-xl font-bold text-[#101828] tracking-tight">{selectedTrigger?.name}</h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl border border-blue-100 hover:bg-blue-100 transition-all">
                          Learn more <Lightbulb className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsTriggerModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-900 transition-all">
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed pr-12">
                      {selectedTrigger?.desc}
                    </p>
                  </div>

                  {/* Modal Config Body */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Choose Trigger field */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest">
                        Choose a Workflow Trigger <Info className="w-3.5 h-3.5" />
                      </label>
                      <div className="relative group">
                        <button className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-700 text-left flex items-center justify-between hover:border-primary-500 transition-all focus:ring-4 focus:ring-primary-500/10 shadow-sm">
                          <span>{selectedTrigger?.name}</span>
                          <ChevronDown className="w-4.5 h-4.5 text-gray-300" />
                        </button>
                      </div>
                    </div>

                    {/* Trigger Name field */}
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-0.5">
                        Workflow Trigger Name
                      </label>
                      <input
                        type="text"
                        defaultValue={selectedTrigger?.name}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-800 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all shadow-sm"
                      />
                    </div>

                    {/* Filters Section */}
                    <div className="space-y-5">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest pl-0.5">Filters</h4>
                      </div>
                      
                      {showFilters ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="flex gap-2">
                            <div className="flex-1 relative group">
                              <button className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 text-left flex items-center justify-between hover:border-primary-500 bg-white transition-all shadow-sm">
                                <span>Select</span>
                                <ChevronDown className="w-4 h-4 text-gray-300" />
                              </button>
                              
                              <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 p-2 space-y-1">
                                  <input type="text" placeholder="Search" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-primary-500 mb-2" />
                                  <div className="p-2 text-[10px] font-black text-primary-600 bg-primary-50 rounded-lg uppercase tracking-widest">Standard Fields</div>
                                  <div className="p-2 text-sm font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg cursor-pointer">After no. of days</div>
                                  <div className="p-2 text-sm font-bold text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg cursor-pointer">Date of birth</div>
                              </div>
                            </div>
                            <button onClick={() => setShowFilters(false)} className="p-3 text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setShowFilters(true)}
                          className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-[11px] font-black uppercase tracking-widest transition-colors pl-1"
                        >
                          <Plus className="w-4 h-4" /> Add filters
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-8 pt-4 border-t border-gray-50 flex flex-col gap-3">
                    <div className="flex items-center justify-end gap-4">
                      <button onClick={() => setIsTriggerModalOpen(false)} className="px-6 py-3 bg-white border border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 hover:border-gray-500 transition-all">
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          updateNodeLabel("start", selectedTrigger?.name);
                          setIsTriggerModalOpen(false);
                        }}
                        className="px-8 py-3 bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
                      >
                        Save Trigger
                      </button>
                    </div>
                    
                    <button
                      className="w-full py-4 bg-gray-50 text-gray-400 font-bold rounded-2xl hover:bg-gray-100 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-gray-100/50"
                    >
                      <RotateCw className="w-4 h-4" />
                      Duplicate Trigger
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 relative bg-slate-50 flex flex-col overflow-hidden">
          {activeTab === "Builder" ? (
            <>
               {/* Top Left Keyboard Shortcut Mockup from Screenshot */}
               <div className="absolute left-20 top-6 z-20 flex gap-3">
                 <button 
                  onClick={() => setIsShortcutsOpen(!isShortcutsOpen)}
                  className={`w-10 h-10 border rounded-xl shadow-xl transition-all flex items-center justify-center ${isShortcutsOpen ? "bg-primary-600 border-primary-600 text-white" : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50"}`}
                 >
                   <Keyboard className="w-5 h-5" />
                 </button>
                 <button className="h-10 px-5 bg-white border border-gray-100 rounded-xl shadow-xl flex items-center gap-2 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all group">
                   <Plus className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                   <span>Add</span>
                 </button>
               </div>

              {/* Viewport Control Rail (Vertical Stack) */}
              <div className="absolute left-6 bottom-10 flex flex-col items-center bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-gray-100">
                <button
                  onClick={() => reactFlowFitView()}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Fit View"
                >
                  <MousePointer2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => zoomIn()}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Zoom In"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="px-1 py-3 text-[11px] font-bold text-gray-900 bg-white select-none text-center min-w-[45px]">
                  {Math.round(zoom * 100)}%
                </div>
                <button
                  onClick={() => zoomOut()}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Zoom Out"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewport({ x: 0, y: 0, zoom: 1 })}
                  className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
                  title="Reset View"
                >
                  <Maximize className="w-4 h-4" />
                </button>
              </div>

              {/* React Flow Viewport */}
              <div className="w-full h-full">
                <ReactFlow
                  nodes={nodes.filter(n => showStickyNotes || n.type !== "stickyNote")}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                >
                  <Background
                    variant={BackgroundVariant.Lines}
                    color="#f1f5f9"
                    gap={20}
                  />
                  <MiniMap
                    className="!bg-white !shadow-2xl !border-gray-100 !rounded-2xl"
                    maskColor="rgba(241, 245, 249, 0.7)"
                    pannable
                    zoomable
                  />
                </ReactFlow>
              </div>

              {/* Keyboard Shortcuts Drawer */}
              <div
                className={`absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-[100] transition-all duration-500 transform ${isShortcutsOpen ? "translate-y-0" : "translate-y-full"}`}
              >
                <div className="max-w-[1200px] mx-auto p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                        <Keyboard className="w-4 h-4 text-gray-600" />
                      </div>
                      <h3 className="text-base font-bold text-gray-900 tracking-tight">
                        Keyboard Shortcuts
                      </h3>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-8">
                      {["Essential", "Edit", "View", "Navigation", "Tools"].map(
                        (tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveShortcutTab(tab)}
                            className={`pb-2 text-sm font-bold transition-all relative ${activeShortcutTab === tab ? "text-primary-600" : "text-gray-400 hover:text-gray-600"}`}
                          >
                            {tab}
                            {activeShortcutTab === tab && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 rounded-full" />
                            )}
                          </button>
                        ),
                      )}
                    </div>

                    <button
                      onClick={() => setIsShortcutsOpen(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="grid grid-cols-3 gap-y-6 gap-x-12">
                    {(() => {
                      const shortcuts: any = {
                        Essential: [
                          { label: "Move to Next Node", keys: ["↓"] },
                          { label: "Move to Previous Node", keys: ["↑"] },
                          { label: "Zoom in", keys: ["+"] },
                          { label: "Save Workflow", keys: ["ctrl", "S"] },
                        ],
                        Edit: [
                          { label: "Undo", keys: ["⌘", "Z"] },
                          { label: "Redo", keys: ["⌘", "⇧", "Z"] },
                          { label: "Delete", keys: ["Backspace"] },
                          { label: "Select All", keys: ["⌘", "A"] },
                          { label: "Copy", keys: ["⌘", "C"] },
                          { label: "Paste", keys: ["⌘", "V"] },
                        ],
                        View: [
                          { label: "Zoom in", keys: ["+"] },
                          { label: "Zoom out", keys: ["-"] },
                          { label: "Fit View", keys: ["⇧", "F"] },
                          { label: "Zoom to 100%", keys: ["0"] },
                          { label: "Full screen", keys: ["⌘", "⇧", "F"] },
                        ],
                        Navigation: [
                          { label: "Pan Canvas", keys: ["Space", "Drag"] },
                          { label: "Multi-select", keys: ["⇧", "Drag"] },
                          { label: "Move Viewport", keys: ["Arrows"] },
                          { label: "Step Back", keys: ["Esc"] },
                        ],
                        Tools: [
                          { label: "Notes", keys: ["⇧", "C"] },
                          { label: "Stats View", keys: ["⌘", "⇧", "S"] },
                          { label: "Workflow Switcher", keys: ["⇧", "W"] },
                          { label: "Find and Replace", keys: ["⌥", "F"] },
                          { label: "Version History", keys: ["⇧", "V"] },
                          { label: "Workflow AI", keys: ["⇧", "A"] },
                        ],
                      };

                      const currentShortcuts = shortcuts[activeShortcutTab] || [];

                      return currentShortcuts.length > 0 ? (
                        currentShortcuts.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between group"
                          >
                            <span className="text-sm font-medium text-gray-600">
                              {item.label}
                            </span>
                            <div className="flex items-center gap-1">
                              {item.keys.map((key: string, kIdx: number) => (
                                <kbd
                                  key={kIdx}
                                  className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 text-[10px] font-bold shadow-sm uppercase min-w-[28px] text-center"
                                >
                                  {key}
                                </kbd>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-3 py-10 text-center">
                          <p className="text-sm text-gray-400 font-medium italic">
                            Additional {activeShortcutTab} shortcuts coming
                            soon...
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === "Settings" ? (
            <WorkflowSettings />
          ) : activeTab === "Enrollment History" ? (
            <EnrollmentHistory />
          ) : activeTab === "Execution Logs" ? (
            <ExecutionLogs />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Clock className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">{activeTab}</h3>
                <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
                  Detailed reporting coming soon. This module is finalizing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Node Settings Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-[400px] bg-white border-l border-gray-200 shadow-2xl z-[100] transition-all duration-300 transform ${isSettingsOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {selectedNodeId && (
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${nodes.find((n) => n.id === selectedNodeId)?.data.color || "bg-primary-50 text-primary-600"}`}
                >
                  {(() => {
                    const Icon =
                      nodes.find((n) => n.id === selectedNodeId)?.data.icon ||
                      Settings;
                    return typeof Icon === "function" ? (
                      <Icon className="w-5 h-5" />
                    ) : (
                      <Settings className="w-5 h-5" />
                    );
                  })()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">
                    Step Settings
                  </h2>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-bold uppercase tracking-widest">
                    {nodes.find((n) => n.id === selectedNodeId)?.data.type ||
                      "Configuration"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-200 transition-all shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar Body */}
            <div className="flex-1 p-8 space-y-10 overflow-y-auto">
              {/* Common: Step Name */}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  Display Name
                </label>
                <input
                  className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-900 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none"
                  value={
                    nodes.find((n) => n.id === selectedNodeId)?.data.label || ""
                  }
                  onChange={(e) =>
                    updateNodeLabel(selectedNodeId, e.target.value)
                  }
                  placeholder="e.g. Send Welcome SMS"
                />
              </div>

              {/* Dynamic Content based on node type */}
              {nodes
                .find((n) => n.id === selectedNodeId)
                ?.data.label.includes("Email") ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                      Subject Line
                    </label>
                    <input
                      className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-primary-500"
                      placeholder="Enter subject..."
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                      Email Content
                    </label>
                    <textarea
                      className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-primary-500 h-40 resize-none"
                      placeholder="Write your message here..."
                    />
                  </div>
                </div>
              ) : nodes
                  .find((n) => n.id === selectedNodeId)
                  ?.data.label.includes("SMS") ? (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    SMS Body
                  </label>
                  <textarea
                    className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3.5 text-sm font-medium outline-none focus:border-primary-500 h-40 resize-none"
                    placeholder="Write your text message..."
                  />
                  <p className="text-[10px] text-gray-400 font-medium">
                    Character count: 0 | Credits: 1
                  </p>
                </div>
              ) : nodes
                  .find((n) => n.id === selectedNodeId)
                  ?.data.label.includes("Wait") ||
                nodes
                  .find((n) => n.id === selectedNodeId)
                  ?.data.label.includes("Delay") ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        Duration
                      </label>
                      <input
                        type="number"
                        className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-primary-500"
                        defaultValue={30}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                        Unit
                      </label>
                      <select className="w-full bg-white border-2 border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:border-primary-500 appearance-none">
                        <option>Seconds</option>
                        <option>Minutes</option>
                        <option>Hours</option>
                        <option>Days</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                  <Settings className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    No advanced settings
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    This step uses default system configurations.
                  </p>
                </div>
              )}

              {/* Status Indicator */}
              <div className="p-5 bg-primary-50/50 rounded-2xl border border-primary-100 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-primary-900 mb-0.5">
                    Configuration Active
                  </p>
                  <p className="text-[10px] text-primary-700 leading-relaxed font-medium">
                    Changes made here will affect all future enrollments
                    immediately.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-1 py-4 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all shadow-sm active:scale-95 text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="flex-[2] py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 active:scale-95 text-xs uppercase tracking-widest"
                >
                  Save Settings
                </button>
              </div>

              <button
                onClick={() => handleDuplicateNode(selectedNodeId)}
                className="w-full py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                Duplicate Step
              </button>
            </div>
          </div>
        )}
      </div>

      <ActionsLibrary
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        onSelect={onSelectFromLibrary}
      />
    </div>
  );
}

export default function WorkflowBuilder() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilderContent />
    </ReactFlowProvider>
  );
}
