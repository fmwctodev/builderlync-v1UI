import React, { createContext, useContext, useEffect, useState } from 'react';

interface WidgetContextType {
  widgetEnabled: boolean;
  elevenlabsAgentId: string | null;
  widgetConfig: WidgetConfig | null;
  setWidgetEnabled: (enabled: boolean) => void;
  setElevenlabsAgentId: (agentId: string | null) => void;
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
  const [elevenlabsAgentId, setElevenlabsAgentId] = useState<string | null>(null);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);

  useEffect(() => {
    const orgId = localStorage.getItem('currentOrganizationId');
    if (orgId) {
      const savedEnabled = localStorage.getItem(`widget_enabled_${orgId}`);
      const savedAgentId = localStorage.getItem(`widget_agent_${orgId}`);
      const savedConfig = localStorage.getItem(`widget_config_${orgId}`);
      
      if (savedEnabled === 'true' && savedAgentId) {
        setWidgetEnabled(true);
        setElevenlabsAgentId(savedAgentId);
        if (savedConfig) {
          setWidgetConfig(JSON.parse(savedConfig));
        }
      }
    }
  }, []);

  useEffect(() => {
    const scriptId = 'elevenlabs-convai-widget';
    const widgetId = 'elevenlabs-convai-element';
    const styleId = 'elevenlabs-convai-custom-style';
    
    if (widgetEnabled && elevenlabsAgentId) {
      const existingWidget = document.getElementById(widgetId);
      if (!existingWidget) {
        const widget = document.createElement('elevenlabs-convai');
        widget.id = widgetId;
        widget.setAttribute('agent-id', elevenlabsAgentId);
        
        if (widgetConfig?.avatarUrl) {
          widget.setAttribute('avatar-url', widgetConfig.avatarUrl);
        }
        if (widgetConfig?.color) {
          widget.setAttribute('color', widgetConfig.color);
        }
        if (widgetConfig?.position) {
          widget.setAttribute('position', widgetConfig.position);
        }
        
        document.body.appendChild(widget);
      } else {
        if (widgetConfig?.avatarUrl) {
          existingWidget.setAttribute('avatar-url', widgetConfig.avatarUrl);
        }
        if (widgetConfig?.color) {
          existingWidget.setAttribute('color', widgetConfig.color);
        }
        if (widgetConfig?.position) {
          existingWidget.setAttribute('position', widgetConfig.position);
        }
      }

      const existingScript = document.getElementById(scriptId);
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed@beta';
        script.async = true;
        script.type = 'text/javascript';
        document.head.appendChild(script);
      }
      
      const existingStyle = document.getElementById(styleId);
      if (!existingStyle) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          elevenlabs-convai::part(branding) {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
      }
      
      const orgId = localStorage.getItem('currentOrganizationId');
      if (orgId) {
        localStorage.setItem(`widget_enabled_${orgId}`, 'true');
        localStorage.setItem(`widget_agent_${orgId}`, elevenlabsAgentId);
        if (widgetConfig) {
          localStorage.setItem(`widget_config_${orgId}`, JSON.stringify(widgetConfig));
        }
      }
    } else {
      const existingWidget = document.getElementById(widgetId);
      if (existingWidget) {
        existingWidget.remove();
      }
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
      
      const orgId = localStorage.getItem('currentOrganizationId');
      if (orgId) {
        localStorage.removeItem(`widget_enabled_${orgId}`);
        localStorage.removeItem(`widget_agent_${orgId}`);
        localStorage.removeItem(`widget_config_${orgId}`);
      }
    }

    return () => {
      const existingWidget = document.getElementById(widgetId);
      if (existingWidget) {
        existingWidget.remove();
      }
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, [widgetEnabled, elevenlabsAgentId, widgetConfig]);

  return (
    <WidgetContext.Provider value={{ widgetEnabled, elevenlabsAgentId, widgetConfig, setWidgetEnabled, setElevenlabsAgentId, setWidgetConfig }}>
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
