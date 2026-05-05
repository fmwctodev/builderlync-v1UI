import React from "react";
import { 
  Calendar, 
  Search, 
  RefreshCw, 
  ChevronDown
} from "lucide-react";

export default function ExecutionLogs() {
  return (
    <div className="w-full h-full bg-[#f9fafb] overflow-y-auto no-scrollbar font-sans">
      <div className="w-full max-w-7xl mx-auto px-10 py-8">
        
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-[24px] font-semibold text-[#101828]">Execution Logs</h1>
          <p className="text-[14px] text-[#475467] mt-1 pr-10">
            View a history and details of all executions performed by this Workflow. Execution Logs are available up to last 30 days.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-[#EAECF0] rounded-[8px] mb-2">
          <div className="flex items-center justify-between p-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {/* Date Range Picker UI Mock */}
              <div className="flex items-center h-[40px] px-3 bg-white border border-[#D0D5DD] rounded-[3px] gap-2 min-w-[240px] cursor-pointer hover:border-[#155EEF]">
                <Calendar className="w-4 h-4 text-[#667085]" />
                <span className="text-[14px] text-[#667085]">Start Date - End Date</span>
              </div>

              {/* Action Filter */}
              <div className="relative">
                <select className="h-[40px] pl-3 pr-10 bg-white border border-[#D0D5DD] rounded-[3px] text-[14px] text-[#344054] appearance-none min-w-[160px] outline-none hover:border-[#155EEF]">
                  <option>All actions</option>
                  <option>Send SMS</option>
                  <option>Wait</option>
                  <option>Email</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select className="h-[40px] pl-3 pr-10 bg-white border border-[#D0D5DD] rounded-[3px] text-[14px] text-[#344054] appearance-none min-w-[160px] outline-none hover:border-[#155EEF]">
                  <option>All Status</option>
                  <option>Finished</option>
                  <option>Failed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
              </div>

               {/* Search Contact */}
               <div className="relative">
                <input 
                  placeholder="Select Contact" 
                  className="h-[40px] pl-3 pr-10 bg-white border border-[#D0D5DD] rounded-[3px] text-[14px] min-w-[200px] outline-none hover:border-[#155EEF]"
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
              </div>
            </div>

            <div className="flex items-center gap-px bg-[#EAECF0] border border-[#EAECF0] rounded-[3px] overflow-hidden">
              <button className="flex items-center justify-center p-2.5 bg-white hover:bg-gray-50 text-[#667085]" title="Refresh">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button className="flex items-center justify-center p-2.5 bg-white hover:bg-gray-50 text-[#667085]" title="Options">
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumb Spacer */}
        <div className="h-4 w-full mb-4" />

        {/* Data Table */}
        <div className="bg-white border border-[#EAECF0] rounded-[8px] overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f9fafb] border-b border-[#EAECF0]">
                <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider">Executed On (EDT)</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-[#475467] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
               {/* Empty State */}
               <tr>
                 <td colSpan={5} className="py-24">
                   <div className="flex flex-col items-center justify-center text-center">
                     <div className="w-16 h-16 bg-[#F2F4F7] rounded-full flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-[#98A2B3]" />
                     </div>
                     <h3 className="text-[18px] font-semibold text-[#101828]">No logs found</h3>
                     <p className="text-[14px] text-[#475467] mt-1">Try adjusting your filters or date range.</p>
                   </div>
                 </td>
               </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
