import { useEffect, useState, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { SierraAssistantProvider, useSierraAssistant } from '../../context/SierraAssistantContext';
import { SierraAssistantFAB } from '../sierra-assistant/SierraAssistantFAB';
import { SierraAssistantPanel } from '../sierra-assistant/SierraAssistantPanel';
import { useAutoLogout } from '../../utils/autoLogout';
import { ToastProvider } from '../ui/Toast';
import { StudioRail } from './StudioRail';
import { StudioTopBar } from './StudioTopBar';
import { CommandPalette } from './CommandPalette';

interface AppShellInnerProps {
  children?: ReactNode;
}

/**
 * Studio app shell — drop-in replacement for `roof-runner/components/Layout/Layout.tsx`.
 *
 * Mounted by RoofRunnerModule when VITE_NEW_SHELL=1; otherwise the legacy
 * Layout is used. Both keep the same routing tree underneath.
 *
 * Sets `body[data-studio="on"]` so global Studio body styles activate only
 * when the shell is mounted — legacy pages render under their own body
 * background until they're reskinned.
 */
function AppShellInner({ children }: AppShellInnerProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const sierra = useSierraAssistant();

  useAutoLogout();

  // Apply Studio body styles only while shell is mounted
  useEffect(() => {
    document.body.setAttribute('data-studio', 'on');
    return () => {
      document.body.removeAttribute('data-studio');
    };
  }, []);

  // Cmd-K / Ctrl-K to toggle the command palette
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && !e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      // Cmd+Shift+K -> Sierra
      if (mod && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        sierra.setPanelOpen(!sierra.panelOpen);
      }
      if (e.key === 'Escape' && paletteOpen) {
        setPaletteOpen(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [paletteOpen, sierra]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-paper dark:bg-canvas">
      <StudioRail
        onOpenCommandPalette={() => setPaletteOpen(true)}
        onOpenSierra={() => sierra.setPanelOpen(!sierra.panelOpen)}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <StudioTopBar onOpenCommandPalette={() => setPaletteOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-paper dark:bg-canvas scrollbar-studio">
          {children ?? <Outlet />}
        </main>
      </div>

      <SierraAssistantFAB />
      <SierraAssistantPanel />

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}

/**
 * Public shell — wraps the content with required providers.
 * Use this in module routes when VITE_NEW_SHELL is enabled.
 */
export function AppShell({ children }: { children?: ReactNode }) {
  return (
    <SierraAssistantProvider>
      <ToastProvider>
        <AppShellInner>{children}</AppShellInner>
      </ToastProvider>
    </SierraAssistantProvider>
  );
}
