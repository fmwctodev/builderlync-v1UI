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
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import ActionsLibrary from "../components/ActionsLibrary";
import WorkflowSettings from "../components/WorkflowSettings";
import EnrollmentHistory from "../components/EnrollmentHistory";
import ExecutionLogs from "../components/ExecutionLogs";

// --- Custom Components ---

// 0. AI Hub Node (The "Infinite Header")
const AIHubNode = ({ data }: any) => {
  const [prompt, setPrompt] = useState(""); 
  const [showAll, setShowAll] = useState(false);
  
  const allSuggestions = [
    { icon: User, label: "Lead Nurturing" },
    { icon: ListFilter, label: "Form Automation" },
    { icon: MessageSquare, label: "Email Campaigns" },
    { icon: Clock, label: "Appointment Automation" },
    { icon: FileText, label: "Contact Management" }
  ];

  const suggestions = showAll ? allSuggestions : allSuggestions.slice(0, 3);

  return (
    <div className="w-[600px] flex flex-col items-center">
      <div className="w-full p-[2px] rounded-2xl bg-gradient-to-r from-primary-400 via-purple-400 to-pink-300 shadow-2xl transition-shadow hover:shadow-primary-100/20">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-1 nodrag nopan">
              <textarea 
                className="w-full bg-transparent border-none resize-none text-gray-800 placeholder:text-gray-300 focus:ring-0 text-sm leading-relaxed font-medium cursor-text"
                placeholder="Describe your workflow (e.g., Create a 7-day SMS follow-up)..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
              />
            </div>
            <div className="flex gap-3 items-center nodrag nopan">
              <Mic className="w-5 h-5 text-gray-300 hover:text-primary-500 cursor-pointer transition-colors" />
              <button 
                onClick={() => data.onGenerate && data.onGenerate(prompt)}
                className="w-10 h-10 rounded-full bg-primary-600 hover:bg-primary-700 flex items-center justify-center text-white shadow-lg hover:shadow-primary-500/30 transition-all active:scale-95 group cursor-pointer"
              >
                <ArrowUpCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-gray-100 nodrag nopan">
            {suggestions.map(tag => (
              <button 
                key={tag.label} 
                onClick={() => setPrompt(`Step for ${tag.label}: `)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-white hover:border-primary-200 hover:text-primary-500 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                 <tag.icon className="w-3.5 h-3.5" />
                 {tag.label}
              </button>
            ))}
            {!showAll && (
              <button 
                onClick={() => setShowAll(true)}
                className="text-[10px] font-bold text-gray-400 hover:text-primary-500 px-3 py-1.5 cursor-pointer uppercase tracking-widest transition-colors"
              >
                + more
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-center mt-9 gap-5 w-full opacity-40">
        <div className="h-[1px] flex-1 bg-gray-200" />
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] whitespace-nowrap px-6">Or</span>
        <div className="h-[1px] flex-1 bg-gray-200" />
      </div>
    </div>
  );
};

// 1. Custom Trigger Node
const TriggerNode = ({ data, id }: any) => (
  <div 
    className="group relative nodrag nopan"
    onClick={(e) => { e.stopPropagation(); data.onNodeClick && data.onNodeClick(id); }}
  >
    <div className="min-w-[200px] bg-white border border-dashed border-primary-400/60 rounded-xl px-5 py-3 flex items-center justify-center gap-3 hover:border-primary-500 hover:bg-primary-50/10 transition-all shadow-sm hover:shadow-md cursor-pointer">
      <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 group-hover:scale-110 transition-transform shadow-inner">
        <Plus className="w-3 h-3 stroke-[3px]" />
      </div>
      <span className="text-primary-600 font-bold text-[10px] uppercase tracking-[0.1em]">{data.label}</span>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-primary-300/50 !w-2 !h-2 !border-none" />
  </div>
);

// 2. Custom Action Node
const ActionNode = ({ data, id }: any) => (
  <div 
    className="w-[280px] group bg-white border border-gray-200 rounded-xl px-6 py-4 shadow-sm hover:shadow-lg transition-all border-l-4 border-l-primary-500 nodrag nopan relative cursor-pointer"
    onClick={(e) => { e.stopPropagation(); data.onNodeClick && data.onNodeClick(id); }}
  >
    <Handle type="target" position={Position.Top} className="!bg-gray-300 !w-2 !h-2" />
    
    <button 
      onClick={(e) => { e.stopPropagation(); data.onDelete && data.onDelete(id); }}
      className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-md opacity-0 group-hover:opacity-100 transition-all z-10"
    >
       <X className="w-3 h-3" />
    </button>

    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600">
        <MessageSquare className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{data.type || 'Action'}</p>
        <p className="text-sm font-bold text-gray-800">{data.label}</p>
      </div>
    </div>
    <Handle type="source" position={Position.Bottom} className="!bg-gray-300 !w-2 !h-2" />
  </div>
);

// 3. Custom End Node
const EndNode = ({ data }: any) => (
  <div className="px-8 py-2 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center shadow-sm">
    <Handle type="target" position={Position.Top} className="!bg-gray-400 !w-2 !h-2" />
    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">{data.label}</span>
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
  data
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
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={{ ...style, strokeWidth: 2, stroke: '#e2e8f0' }} />
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

const nodeTypes = {
  aihub: AIHubNode,
  trigger: TriggerNode,
  action: ActionNode,
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
    selectable: false,
  },
  {
    id: "start",
    type: "trigger",
    position: { x: 400, y: 350 },
    data: { label: "Add New Trigger" },
  },
  {
    id: "end",
    type: "end",
    position: { x: 435, y: 550 },
    data: { label: "END" },
  }
];

const initialEdges: Edge[] = [
  {
    id: "e-start-end",
    source: "start",
    target: "end",
    type: "button",
    markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' },
  }
];

export default function WorkflowBuilder() {
  const navigate = useNavigate();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [libraryContext, setLibraryContext] = useState<{ edgeId?: string, nodeId?: string } | null>(null);

  // Helper to open library
  const openLibrary = (context: { edgeId?: string, nodeId?: string }) => {
    setLibraryContext(context);
    setIsLibraryOpen(true);
  };

  const handleNodeClick = (id: string) => {
    setSelectedNodeId(id);
    setIsSettingsOpen(true);
  };

  const initialNodesWithActions: Node[] = initialNodes.map(node => {
     if (node.id === 'start') {
        return { ...node, data: { ...node.data, onAddTrigger: (id: string) => openLibrary({ nodeId: id }), onNodeClick: handleNodeClick } };
     }
     if (node.id === 'ai-header') {
        return { ...node, data: { ...node.data, onGenerate: (prompt: string) => handleGenerate(prompt) } };
     }
     return { ...node, data: { ...node.data, onNodeClick: handleNodeClick } };
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodesWithActions);

  const initialEdgesWithActions: Edge[] = initialEdges.map(edge => ({
    ...edge,
    data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) }
  }));

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdgesWithActions);
  const [activeTab, setActiveTab] = useState("Builder");
  const [isPublished, setIsPublished] = useState(false);
  const [builderType, setBuilderType] = useState("Standard");
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  
  // Name Edit State
  const [workflowName, setWorkflowName] = useState("New Workflow");
  const [isEditingName, setIsEditingName] = useState(false);
  const workflowId = "1775734314152";

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, type: 'button' }, eds)),
    [setEdges]
  );

  const updateNodeLabel = (id: string, newLabel: string) => {
    setNodes(nds => nds.map(node => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, label: newLabel } };
      }
      return node;
    }));
  };

  const handleDeleteNode = useCallback((nodeId: string) => {
    if (selectedNodeId === nodeId) setIsSettingsOpen(false);
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => {
      // Heal the connection: connect source of deleted node to target of deleted node
      const incoming = eds.find((e) => e.target === nodeId);
      const outgoing = eds.find((e) => e.source === nodeId);
      
      let newEds = eds.filter((e) => e.source !== nodeId && e.target !== nodeId);
      
      if (incoming && outgoing) {
        newEds.push({
          ...incoming,
          id: `e-${incoming.source}-${outgoing.target}`,
          target: outgoing.target,
          data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) }
        });
      }
      return newEds;
    });
  }, [setNodes, setEdges]);

  const handleGenerate = (prompt: string) => {
    // Basic "Magic" Simulation
    const isMissedCall = prompt.toLowerCase().includes('missed') || prompt.toLowerCase().includes('7-day');
    
    if (isMissedCall) {
      const templateNodes: Node[] = [
        { id: 'ai-header', type: 'aihub', position: { x: 200, y: 50 }, data: { onGenerate: (p: string) => handleGenerate(p) }, draggable: false, selectable: false },
        { id: 'start', type: 'trigger', position: { x: 400, y: 350 }, data: { label: 'Inbound Call: Missed', type: 'CRM', onAddTrigger: (id: string) => openLibrary({ nodeId: id }) } },
        { id: 'node-1', type: 'action', position: { x: 360, y: 500 }, data: { label: 'Wait 30 Seconds', type: 'Logic', onDelete: handleDeleteNode } },
        { id: 'node-2', type: 'action', position: { x: 360, y: 700 }, data: { label: 'Send SMS: "Sorry I missed you..."', type: 'Messaging', onDelete: handleDeleteNode } },
        { id: 'node-3', type: 'action', position: { x: 360, y: 900 }, data: { label: 'Wait 1 Day', type: 'Logic', onDelete: handleDeleteNode } },
        { id: 'node-4', type: 'action', position: { x: 360, y: 1100 }, data: { label: 'Send Email: Follow up', type: 'Messaging', onDelete: handleDeleteNode } },
        { id: 'end', type: 'end', position: { x: 435, y: 1300 }, data: { label: 'END' } }
      ];

      const templateEdges: Edge[] = [
        { id: 'e-1', source: 'start', target: 'node-1', type: 'button', data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) } },
        { id: 'e-2', source: 'node-1', target: 'node-2', type: 'button', data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) } },
        { id: 'e-3', source: 'node-2', target: 'node-3', type: 'button', data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) } },
        { id: 'e-4', source: 'node-3', target: 'node-4', type: 'button', data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) } },
        { id: 'e-5', source: 'node-4', target: 'end', type: 'button', data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) } }
      ];

      setNodes(templateNodes);
      setEdges(templateEdges);
    }
  };

  const onSelectFromLibrary = (item: any) => {
    setIsLibraryOpen(false);
    
    if (libraryContext?.edgeId) {
      const edge = edges.find(e => e.id === libraryContext.edgeId);
      if (!edge) return;

      const newNodeId = `node-${Date.now()}`;
      const sourceNode = nodes.find(n => n.id === edge.source);
      const targetNode = nodes.find(n => n.id === edge.target);
      
      if (!sourceNode || !targetNode) return;

      const newY = sourceNode.position.y + 150;
      const newNode: Node = {
        id: newNodeId,
        type: item.type === 'trigger' ? 'trigger' : 'action',
        position: { x: sourceNode.position.x - (item.type === 'action' ? 40 : 0), y: newY },
        data: { 
          label: item.label, 
          type: item.title,
          onDelete: handleDeleteNode,
          onNodeClick: handleNodeClick,
          onAddTrigger: item.type === 'trigger' ? (id: string) => openLibrary({ nodeId: id }) : undefined
        },
      };

      const shiftedNodes = nodes.map(node => {
        if (node.position.y >= targetNode.position.y && node.id !== 'ai-header') {
          return { ...node, position: { ...node.position, y: node.position.y + 200 } };
        }
        return node;
      });

      const newEdge1: Edge = {
        id: `e-${edge.source}-${newNodeId}`,
        source: edge.source,
        target: newNodeId,
        type: 'button',
        data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' },
      };

      const newEdge2: Edge = {
        id: `e-${newNodeId}-${edge.target}`,
        source: newNodeId,
        target: edge.target,
        type: 'button',
        data: { onAddNode: (id: string) => openLibrary({ edgeId: id }) },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' },
      };

      setNodes([...shiftedNodes, newNode]);
      setEdges([...edges.filter(e => e.id !== edge.id), newEdge1, newEdge2]);
    } else if (libraryContext?.nodeId) {
       // Just update existing node type/label if it's a trigger change
       setNodes(nodes.map(n => {
          if (n.id === libraryContext.nodeId) {
             return { ...n, data: { ...n.data, label: item.label, type: item.title } };
          }
          return n;
       }));
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#f8fafc] overflow-hidden font-sans">
      
      {/* 1. Primary Header */}
      <header className="h-[60px] bg-white border-b border-gray-200 flex items-center justify-between px-6 z-30 shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('..')}
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
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                />
                <button onClick={() => setIsEditingName(false)} className="text-primary-600">
                   <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div 
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-all"
              >
                <h1 className="text-[#101828] font-normal text-lg" id="cmp-header__txt--edit-workflow-name">
                  {workflowName} : <span className="text-[#667085] font-normal">{workflowId}</span>
                </h1>
                <Edit3 className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#155EEF] transition-colors ml-1" />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5">
           <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 pr-4 border-r border-gray-100">
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-[10px] font-bold ring-2 ring-white shadow-sm">VS</div>
                <div className="flex gap-2.5">
                  <RotateCcw className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                  <RotateCw className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
                </div>
              </div>
              <FileText className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
           </div>
           
           <div className="flex items-center gap-1.5 text-gray-400">
             <Cloud className="w-4 h-4" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Saved</span>
           </div>

           <button className="px-4 py-1.5 text-xs font-bold text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-all border border-primary-100">
             Test Workflow
           </button>

           <div className="flex items-center gap-3 ml-2">
              <span className={`text-[10px] font-bold uppercase ${!isPublished ? 'text-gray-900' : 'text-gray-400'}`}>Draft</span>
              <button 
                onClick={() => setIsPublished(!isPublished)}
                className={`w-9 h-4.5 rounded-full relative transition-all ${isPublished ? 'bg-primary-500' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all ${isPublished ? 'right-0.5' : 'left-0.5'}`} />
              </button>
              <span className={`text-[10px] font-bold uppercase ${isPublished ? 'text-gray-900' : 'text-gray-400'}`}>Publish</span>
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
              <span className="text-[11px] font-bold text-gray-700">{builderType} Builder</span>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`} />
            </div>

            {showTypeDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                <button 
                  onClick={() => { setBuilderType("Standard"); setShowTypeDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors flex items-center justify-between"
                >
                  Standard Builder
                  {builderType === 'Standard' && <Plus className="w-3 h-3" />}
                </button>
                <div className="h-[1px] bg-gray-50 mx-2" />
                <button 
                  onClick={() => { setBuilderType("Advanced"); setShowTypeDropdown(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs font-semibold text-gray-400 hover:bg-gray-50 flex items-center justify-between cursor-not-allowed"
                >
                  <span>Advanced Builder</span>
                  <span className="text-[8px] bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">Later</span>
                </button>
              </div>
            )}
         </div>

         <div className="flex items-center h-full gap-8">
            {["Builder", "Settings", "Enrollment History", "Execution Logs"].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`h-full px-2 text-[11px] font-bold transition-all border-b-2 flex items-center uppercase tracking-wider ${
                  activeTab === tab ? 'text-primary-600 border-primary-600' : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
         </div>

         <div className="w-[140px]" /> 
      </div>

      {/* 3. Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Vertical Tool Rail */}
        <aside className="w-[56px] bg-white border-r border-gray-100 flex flex-col items-center py-6 gap-6 z-10 shrink-0 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
          <MessageSquare className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
          <CheckCircle2 className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
          <Clock className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
          <FileText className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
          <Zap className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
          <Search className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
          <History className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors" />
          <div className="flex-1" />
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600 cursor-pointer hover:bg-purple-100 transition-colors">
            <Sparkles className="w-4 h-4" />
          </div>
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 relative bg-[#fcfdff] overflow-hidden">
          {activeTab === 'Builder' ? (
            <>
              {/* Viewport Control Rail (Vertical Stack) */}
              <div className="absolute left-6 bottom-10 flex flex-col items-center bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden divide-y divide-gray-100">
                 <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                   <MousePointer2 className="w-4 h-4" />
                 </button>
                 <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                   <Plus className="w-4 h-4" />
                 </button>
                 <div className="px-2 py-3 text-[9px] font-bold text-gray-400 bg-gray-50 select-none">100%</div>
                 <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                   <Minus className="w-4 h-4" />
                 </button>
                 <button className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                   <Maximize className="w-4 h-4" />
                 </button>
              </div>

              {/* React Flow Viewport */}
              <div className="w-full h-full">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  snapToGrid
                  snapGrid={[15, 15]}
                  defaultEdgeOptions={{
                    type: 'button',
                    markerEnd: { type: MarkerType.ArrowClosed, color: '#cbd5e1' },
                  }}
                >
                  <Background variant={BackgroundVariant.Lines} color="#f1f5f9" gap={20} />
                  <MiniMap 
                    className="!bg-white !shadow-2xl !border-gray-100 !rounded-2xl" 
                    maskColor="rgba(241, 245, 249, 0.7)"
                  />
                </ReactFlow>
              </div>
            </>
          ) : activeTab === 'Settings' ? (
            <WorkflowSettings />
          ) : activeTab === 'Enrollment History' ? (
            <EnrollmentHistory />
          ) : activeTab === 'Execution Logs' ? (
            <ExecutionLogs />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
               <div className="text-center">
                  <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                     <Clock className="w-8 h-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{activeTab}</h3>
                  <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">Detailed reporting coming soon. This module is finalizing.</p>
               </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Node Settings Sidebar */}
      <div className={`fixed inset-y-0 right-0 w-[350px] bg-white border-l border-gray-200 shadow-2xl z-[100] transition-all duration-300 transform ${isSettingsOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {selectedNodeId && (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Step Settings</h2>
                <p className="text-[10px] text-primary-500 mt-0.5 font-bold uppercase tracking-widest">{nodes.find(n => n.id === selectedNodeId)?.data.type || 'Configuration'}</p>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-white rounded-xl text-gray-400 border border-transparent hover:border-gray-200 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 p-6 space-y-8 overflow-y-auto no-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Step Name</label>
                <input 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-primary-500/20 transition-all"
                  value={nodes.find(n => n.id === selectedNodeId)?.data.label || ''}
                  onChange={(e) => updateNodeLabel(selectedNodeId, e.target.value)}
                />
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Wait Time</label>
                    <span className="text-xs font-bold text-primary-600">30 Seconds</span>
                 </div>
                 <input type="range" className="w-full accent-primary-600" />
              </div>

              <div className="p-4 bg-primary-50 rounded-2xl border border-primary-100 flex gap-3">
                 <Sparkles className="w-5 h-5 text-primary-600 shrink-0" />
                 <p className="text-[11px] text-primary-700 leading-relaxed font-medium">
                   Our AI is monitoring this step to ensure optimal engagement based on lead behavior.
                 </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/50">
              <button 
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-3.5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-gray-800 transition-all shadow-lg active:scale-95"
              >
                Save Settings
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
