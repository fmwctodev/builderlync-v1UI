import React, { useState } from "react";
import { 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  Tag,
  ChevronDown
} from "lucide-react";

const GHLToggle = ({ enabled, onChange }: { enabled: boolean, onChange: (val: boolean) => void }) => (
  <button
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-[18px] w-[32px] shrink-0 cursor-pointer rounded-[3px] transition-colors duration-200 ease-in-out focus:outline-none ${
      enabled ? "bg-[#155EEF]" : "bg-gray-200"
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-[14px] w-[14px] transform rounded-[2px] bg-white shadow-sm transition duration-200 ease-in-out mt-[2px] ${
        enabled ? "translate-x-[16px]" : "translate-x-[2px]"
      }`}
    />
  </button>
);

const SettingRow = ({ label, description, children }: { label: string, description: string, children: React.ReactNode }) => (
  <div className="flex items-start gap-4 py-6">
    <div className="pt-0.5">{children}</div>
    <div className="flex flex-col">
      <p className="text-[14px] font-medium text-[#101828] leading-tight mb-1">{label}</p>
      <p className="text-[14px] text-[#475467] leading-relaxed max-w-4xl font-normal">
        {description}
        <button className="ml-1.5 text-[#155EEF] font-medium hover:underline text-[14px]">Learn more</button>
      </p>
    </div>
  </div>
);

const Divider = () => <div className="h-[1px] bg-[#EAECF0] w-full" />;

export default function WorkflowSettings() {
  const [settings, setSettings] = useState({
    allowReentry: true,
    allowMultipleOpps: true,
    stopOnResponse: false,
    timezone: "Account Timezone",
    specificTime: false,
    fromName: "",
    fromEmail: "",
    fromNumber: "",
    markAsRead: false
  });

  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full h-full bg-white overflow-y-auto no-scrollbar font-sans">
      <div className="max-w-7xl mx-auto px-8 py-10 pb-32">
        <div className="mb-8">
          <h1 className="text-[24px] font-semibold text-[#101828]">Workflow Settings</h1>
          <p className="text-[16px] text-[#475467] mt-1">Configure how this workflow runs, including its default options and behavior.</p>
        </div>

        <div className="mt-8">
          <h3 className="text-[18px] font-medium text-[#475467] mb-2 px-1">Contact</h3>
          <Divider />
          <SettingRow label="Allow re-entry" description="Allows a Contact to re-enter once it has left this workflow. If the Contact attempts to re-enter while it is still enrolled, it will get skipped.">
            <GHLToggle enabled={settings.allowReentry} onChange={(v) => updateSetting('allowReentry', v)} />
          </SettingRow>
          <SettingRow label="Allow multiple Opportunities" description="Allows a Contact with multiple Opportunities to enter the workflow as separate executions.">
            <GHLToggle enabled={settings.allowMultipleOpps} onChange={(v) => updateSetting('allowMultipleOpps', v)} />
          </SettingRow>
          <SettingRow label="Stop on response" description="Ends workflow for a Contact if the Contact responds to a message that is sent from this workflow.">
            <GHLToggle enabled={settings.stopOnResponse} onChange={(v) => updateSetting('stopOnResponse', v)} />
          </SettingRow>
        </div>

        <div className="mt-12">
          <h3 className="text-[18px] font-medium text-[#475467] mb-2 px-1">Communication</h3>
          <Divider />
          <div className="py-6">
            <p className="text-[14px] font-medium text-[#475467] mb-2">Timezone</p>
            <div className="relative w-1/3">
              <select className="w-full h-[40px] px-3 bg-white border border-[#D0D5DD] rounded-[3px] text-[15px] appearance-none focus:border-[#155EEf] outline-none" value={settings.timezone} onChange={(e) => updateSetting('timezone', e.target.value)}>
                <option>Account Timezone</option>
                <option>Contact Timezone</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
            </div>
          </div>
          <Divider />
          <div className="py-6 flex items-start gap-4">
            <GHLToggle enabled={settings.specificTime} onChange={(v) => updateSetting('specificTime', v)} />
            <div>
              <p className="text-[14px] font-medium text-[#101828]">Specific Time</p>
              <p className="text-[14px] text-[#475467]">Restrict actions from being sent outside the window you define.</p>
            </div>
          </div>
          <Divider />
          <div className="py-6">
            <p className="text-[14px] font-medium text-[#475467] mb-2">Sender Details</p>
            <div className="flex gap-4 mb-4">
              <div className="relative w-1/3">
                <input placeholder="From Name" className="w-full h-[40px] pl-3 pr-10 border border-[#D0D5DD] rounded-[3px] text-[15px]" value={settings.fromName} onChange={(e) => updateSetting('fromName', e.target.value)} />
                <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <div className="relative w-1/3">
                <input placeholder="From Email" className="w-full h-[40px] pl-3 pr-10 border border-[#D0D5DD] rounded-[3px] text-[15px]" value={settings.fromEmail} onChange={(e) => updateSetting('fromEmail', e.target.value)} />
                <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-[18px] font-medium text-[#475467] mb-2 px-1">Conversations</h3>
          <Divider />
          <SettingRow label="Mark as read" description="Toggle this on if you want the conversations that this Workflow will interact with to be marked as read.">
            <GHLToggle enabled={settings.markAsRead} onChange={(v) => updateSetting('markAsRead', v)} />
          </SettingRow>
        </div>
      </div>

      <div className="fixed bottom-0 left-[56px] right-0 h-[72px] bg-white border-t border-[#EAECF0] flex items-center justify-end px-10 z-50">
         <div className="flex items-center gap-3">
            <button className="h-10 px-4 text-[14px] font-semibold text-[#344054] bg-white border border-[#D0D5DD] rounded-[8px]">Discard</button>
            <button className="h-10 px-5 text-[14px] font-semibold text-white bg-[#155EEF] rounded-[8px]">Save Settings</button>
         </div>
      </div>
    </div>
  );
}
