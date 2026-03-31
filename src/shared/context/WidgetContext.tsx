import React, { createContext, useContext, useEffect, useState } from 'react';

interface WidgetContextType {
  widgetEnabled: boolean;
  vapiAssistantId: string | null;
  widgetConfig: WidgetConfig | null;
  setWidgetEnabled: (enabled: boolean) => void;
  setVapiAssistantId: (assistantId: string | null) => void;
  setWidgetConfig: (config: WidgetConfig | null) => void;
}

interface WidgetConfig {
  avatarUrl?: string;
  color?: string;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const WidgetContext = createContext<WidgetContextType | undefined>(undefined);

export function WidgetProvider({ children }: { children: React.ReactNode }) {
  const [widgetEnabled, setWidgetEnabled] = useState(false);
  const [vapiAssistantId, setVapiAssistantId] = useState<string | null>(null);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);

  useEffect(() => {
    const orgId = localStorage.getItem('currentOrganizationId');
    if (orgId) {
      const savedEnabled = localStorage.getItem(`widget_enabled_${orgId}`);
      const savedAssistantId = localStorage.getItem(`widget_agent_${orgId}`);
      const savedConfig = localStorage.getItem(`widget_config_${orgId}`);
      
      if (savedEnabled === 'true' && savedAssistantId) {
        setWidgetEnabled(true);
        setVapiAssistantId(savedAssistantId);
        if (savedConfig) {
          setWidgetConfig(JSON.parse(savedConfig));
        }
      }
    }
  }, []);

  useEffect(() => {
    const scriptId = 'vapi-widget-script';
    const widgetId = 'vapi-assistant-element';
    const styleId = 'vapi-custom-style';
    
    if (widgetEnabled && vapiAssistantId) {
      const existingWidget = document.getElementById(widgetId);
      if (!existingWidget) {
        const widget = document.createElement('vapi-assistant');
        widget.id = widgetId;
        widget.setAttribute('assistant-id', vapiAssistantId);
        
        document.body.appendChild(widget);
      } else {
        existingWidget.setAttribute('assistant-id', vapiAssistantId);
      }

      const existingScript = document.getElementById(scriptId);
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://cdn.jsdelivr.net/gh/VapiAI/html-widget@latest/dist/vapi-widget.js';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      
      const orgId = localStorage.getItem('currentOrganizationId');
      if (orgId) {
        localStorage.setItem(`widget_enabled_${orgId}`, 'true');
        localStorage.setItem(`widget_agent_${orgId}`, vapiAssistantId);
      }
    } else {
      const existingWidget = document.getElementById(widgetId);
      if (existingWidget) existingWidget.remove();
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
    }

    return () => {
      const existingWidget = document.getElementById(widgetId);
      if (existingWidget) existingWidget.remove();
      const existingScript = document.getElementById(scriptId);
      if (existingScript) existingScript.remove();
    }
  }, [widgetEnabled, vapiAssistantId, widgetConfig]);

  return (
    <WidgetContext.Provider value={{ widgetEnabled, vapiAssistantId, widgetConfig, setWidgetEnabled, setVapiAssistantId, setWidgetConfig }}>
      {children}
    </WidgetContext.Provider>
  );
}

export function useWidget() {
  const context = useContext(WidgetContext);
  if (context === undefined) {
    throw new Error('useWidget must be used within a WidgetProvider');
  }
  return context;
}
