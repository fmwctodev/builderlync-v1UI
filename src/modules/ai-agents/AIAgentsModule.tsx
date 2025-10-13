import { Routes, Route } from 'react-router-dom';
import { AIAgentsLayout } from './components/AIAgentsLayout';
import { GettingStarted } from './pages/GettingStarted';
import { VoiceAI } from './pages/VoiceAI';
import { ConversationAI } from './pages/ConversationAI';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { AgentTemplates } from './pages/AgentTemplates';
import { ContentAI } from './pages/ContentAI';

export function AIAgentsModule() {
  return (
    <Routes>
      <Route path="/*" element={<AIAgentsLayout />}>
        <Route index element={<GettingStarted />} />
        <Route path="voice-ai" element={<VoiceAI />} />
        <Route path="conversation-ai" element={<ConversationAI />} />
        <Route path="knowledge-base" element={<KnowledgeBase />} />
        <Route path="agent-templates" element={<AgentTemplates />} />
        <Route path="content-ai" element={<ContentAI />} />
      </Route>
    </Routes>
  );
}