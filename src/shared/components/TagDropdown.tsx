import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Tag, ChevronRight, ArrowLeft, Search } from 'lucide-react';

export const snippetTagsData = [
    {
        "label": "Account",
        "value": "__account__",
        "children": [
            { "label": "Name", "value": "{{location.name}}" },
            { "label": "Full Address", "value": "{{location.full_address}}" },
            { "label": "Address Line 1", "value": "{{location.address}}" },
            { "label": "City", "value": "{{location.city}}" },
            { "label": "State", "value": "{{location.state}}" },
            { "label": "Country", "value": "{{location.country}}" },
            { "label": "Postal Code", "value": "{{location.postal_code}}" },
            { "label": "Email", "value": "{{location.email}}" },
            { "label": "Phone", "value": "{{location.phone}}" },
            { "label": "Website", "value": "{{location.website}}" },
            { "label": "Logo URL", "value": "{{location.logo_url}}" },
            {
                "label": "Owner",
                "value": "__owner__",
                "children": [
                    { "label": "First name", "value": "{{location_owner.first_name}}" },
                    { "label": "Last name", "value": "{{location_owner.last_name}}" },
                    { "label": "Email", "value": "{{location_owner.email}}" }
                ]
            },
            { "label": "ID", "value": "{{location.id}}" }
        ]
    },
    {
        "label": "Appointment",
        "value": "__appointment__",
        "children": [
            { "label": "Start Date Time", "value": "{{appointment.start_time}}" },
            { "label": "Start Date", "value": "{{appointment.only_start_date}}" },
            { "label": "Start Time", "value": "{{appointment.only_start_time}}" },
            { "label": "End Date Time", "value": "{{appointment.end_time}}" },
            { "label": "End Date", "value": "{{appointment.only_end_date}}" },
            { "label": "End Time", "value": "{{appointment.only_end_time}}" },
            { "label": "Timezone", "value": "{{appointment.timezone}}" },
            { "label": "Cancellation Link", "value": "{{appointment.cancellation_link}}" },
            { "label": "Reschedule Link", "value": "{{appointment.reschedule_link}}" },
            { "label": "Meeting Location", "value": "{{appointment.meeting_location}}" },
            { "label": "Notes", "value": "{{appointment.notes}}" },
            { "label": "Add to Google Calendar", "value": "{{appointment.add_to_google_calendar}}" },
            { "label": "Add to iCal/Outlook", "value": "{{appointment.add_to_ical_outlook}}" }
        ]
    },
    {
        "label": "Attribution",
        "value": "__attribution__",
        "children": [
            {
                "label": "First",
                "value": "__first__",
                "children": [
                    { "label": "Session Source", "value": "{{ contact.attributionSource.sessionSource }}" },
                    { "label": "URL", "value": "{{ contact.attributionSource.url }}" },
                    { "label": "Campaign", "value": "{{ contact.attributionSource.campaign }}" },
                    { "label": "UTM Source", "value": "{{ contact.attributionSource.utmSource }}" },
                    { "label": "UTM Medium", "value": "{{ contact.attributionSource.utmMedium }}" },
                    { "label": "UTM Content", "value": "{{ contact.attributionSource.utmContent }}" },
                    { "label": "Referrer", "value": "{{ contact.attributionSource.referrer }}" },
                    { "label": "Campaign Id", "value": "{{ contact.attributionSource.campaignId }}" },
                    { "label": "FB ClickId", "value": "{{ contact.attributionSource.fbclid }}" },
                    { "label": "Google ClickId", "value": "{{ contact.attributionSource.gclid }}" }
                ]
            },
            {
                "label": "Latest",
                "value": "__latest__",
                "children": [
                    { "label": "Session Source", "value": "{{ contact.lastAttributionSource.sessionSource }}" },
                    { "label": "URL", "value": "{{ contact.lastAttributionSource.url }}" },
                    { "label": "Campaign", "value": "{{ contact.lastAttributionSource.campaign }}" },
                    { "label": "UTM Source", "value": "{{ contact.lastAttributionSource.utmSource }}" },
                    { "label": "UTM Medium", "value": "{{ contact.lastAttributionSource.utmMedium }}" },
                    { "label": "UTM Content", "value": "{{ contact.lastAttributionSource.utmContent }}" },
                    { "label": "Referrer", "value": "{{ contact.lastAttributionSource.referrer }}" },
                    { "label": "Campaign Id", "value": "{{ contact.lastAttributionSource.campaignId }}" },
                    { "label": "FB ClickId", "value": "{{ contact.lastAttributionSource.fbclid }}" },
                    { "label": "Google ClickId", "value": "{{ contact.lastAttributionSource.gclid }}" }
                ]
            }
        ]
    },
    {
        "label": "Calendar",
        "value": "__calendar__",
        "children": [
            { "label": "Name", "value": "{{calendar.name}}" }
        ]
    },
    {
        "label": "Contact",
        "value": "__contact__",
        "children": [
            { "label": "Full Name", "value": "{{contact.name}}" },
            { "label": "First Name", "value": "{{contact.first_name}}" },
            { "label": "Last Name", "value": "{{contact.last_name}}" },
            { "label": "Email", "value": "{{contact.email}}" },
            { "label": "Phone", "value": "{{contact.phone}}" },
            { "label": "Company Name", "value": "{{contact.company_name}}" },
            { "label": "Full Address", "value": "{{contact.full_address}}" },
            { "label": "Address 1", "value": "{{contact.address1}}" },
            { "label": "City", "value": "{{contact.city}}" },
            { "label": "State", "value": "{{contact.state}}" },
            { "label": "Postal Code", "value": "{{contact.postal_code}}" },
            { "label": "Date of birth", "value": "{{contact.date_of_birth}}" },
            { "label": "Source", "value": "{{contact.source}}" },
            { "label": "Website", "value": "{{contact.website}}" },
            { "label": "Phone (raw format)", "value": "{{contact.phone_raw}}" },
            { "label": "Country", "value": "{{contact.country}}" },
            { "label": "ID", "value": "{{contact.id}}" }
        ]
    },
    {
        "label": "Message",
        "value": "__message__",
        "children": [
            { "label": "Message Body", "value": "{{message.body}}" }
        ]
    },
    {
        "label": "Right now",
        "value": "__right-now__",
        "children": [
            { "label": "Second", "value": "{{right_now.second}}" },
            { "label": "Minute", "value": "{{right_now.minute}}" },
            { "label": "Hour 24h format", "value": "{{right_now.hour}}" },
            { "label": "Hour AM/PM format", "value": "{{right_now.hour_ampm}}" },
            { "label": "Time 24h format", "value": "{{right_now.time}}" },
            { "label": "Time AM/PM format", "value": "{{right_now.time_ampm}}" },
            { "label": "AM/PM", "value": "{{right_now.ampm}}" },
            { "label": "Day", "value": "{{right_now.day}}" },
            { "label": "Day of the week extended English", "value": "{{right_now.day_of_week}}" },
            { "label": "Month", "value": "{{right_now.month}}" },
            { "label": "Month extended English", "value": "{{right_now.month_english}}" },
            { "label": "Year", "value": "{{right_now.year}}" },
            { "label": "Date (month/day/year)", "value": "{{right_now.middle_endian_date}}" },
            { "label": "Date (day/month/year)", "value": "{{right_now.little_endian_date}}" }
        ]
    },
    {
        "label": "User",
        "value": "__user__",
        "children": [
            { "label": "Full Name", "value": "{{user.name}}" },
            { "label": "First Name", "value": "{{user.first_name}}" },
            { "label": "Last Name", "value": "{{user.last_name}}" },
            { "label": "Email", "value": "{{user.email}}" },
            { "label": "Phone", "value": "{{user.phone}}" },
            { "label": "Signature", "value": "{{user.email_signature}}" },
            { "label": "Calendar Link", "value": "{{user.calendar_link}}" },
            { "label": "Twilio Phone", "value": "{{user.twilio_phone_number}}" },
            { "label": "Last Name (lower case)", "value": "{{user.last_name_lower_case}}" },
            { "label": "Twilio Phone (raw format)", "value": "{{user.twilio_phone_number_raw}}" },
            { "label": "First Name (lower case)", "value": "{{user.first_name_lower_case}}" }
        ]
    },
    {
        "label": "Invoice",
        "value": "__invoice__",
        "children": [
            {
                "label": "Company",
                "value": "__company__",
                "children": [
                    { "label": "Name", "value": "{{ invoice.company.name }}" },
                    { "label": "Phone", "value": "{{ invoice.company.phone }}" },
                    { "label": "Address", "value": "{{ invoice.company.address }}" },
                    { "label": "City", "value": "{{ invoice.company.city }}" },
                    { "label": "State", "value": "{{ invoice.company.state }}" },
                    { "label": "Country", "value": "{{ invoice.company.country }}" },
                    { "label": "Website", "value": "{{ invoice.company.website }}" },
                    { "label": "Logo", "value": "{{ invoice.company.logo }}" }
                ]
            },
            {
                "label": "Customer",
                "value": "__customer__",
                "children": [
                    { "label": "Name", "value": "{{ invoice.customer.name }}" },
                    { "label": "First Name", "value": "{{ invoice.customer.first_name }}" },
                    { "label": "Last Name", "value": "{{ invoice.customer.last_name }}" },
                    { "label": "Phone", "value": "{{ invoice.customer.phone }}" },
                    { "label": "Email", "value": "{{ invoice.customer.email }}" },
                    { "label": "Company", "value": "{{ invoice.customer.company }}" },
                    { "label": "Address", "value": "{{ invoice.customer.address }}" },
                    { "label": "City", "value": "{{ invoice.customer.city }}" },
                    { "label": "State", "value": "{{ invoice.customer.state }}" },
                    { "label": "Postal code", "value": "{{ invoice.customer.postal_code }}" }
                ]
            },
            {
                "label": "Sender",
                "value": "__sender__",
                "children": [
                    { "label": "Name", "value": "{{ invoice.sender.name }}" },
                    { "label": "Email", "value": "{{ invoice.customer.email }}" }
                ]
            },
            { "label": "Name", "value": "{{ invoice.name }}" },
            { "label": "Number", "value": "{{ invoice.number }}" },
            { "label": "Issue Date", "value": "{{ invoice.issue_date }}" },
            { "label": "Due Date", "value": "{{ invoice.due_date }}" },
            { "label": "Sub Total", "value": "{{ invoice.sub_total }}" },
            { "label": "Discount Amount", "value": "{{ invoice.discount_amount }}" },
            { "label": "Tax Amount", "value": "{{ invoice.tax_amount }}" },
            { "label": "Total Amount", "value": "{{ invoice.total_amount }}" },
            { "label": "Title", "value": "{{ invoice.title }}" },
            { "label": "URL", "value": "{{ invoice.url }}" },
            {
                "label": "Card information",
                "value": "__card-information__",
                "children": [
                    { "label": "Card brand", "value": "{{ invoice.card.brand }}" },
                    { "label": "Last 4 digits", "value": "{{ invoice.card.last4 }}" }
                ]
            },
            {
                "label": "Payment Schedule",
                "value": "__payment-schedule__",
                "children": [
                    { "label": "Current Schedule Due Date", "value": "{{ invoice.paymentSchedule.currentScheduleDueDate }}" },
                    { "label": "Current Schedule Amount", "value": "{{ invoice.paymentSchedule.currentScheduleAmount }}" },
                    { "label": "Amount Due", "value": "{{ invoice.paymentSchedule.amountDue }}" },
                    { "label": "Current Schedule Number", "value": "{{ invoice.paymentSchedule.currentScheduleNumber }}" }
                ]
            }
        ]
    },
    {
        "label": "Documents & Contracts",
        "value": "__documents_contracts__",
        "children": [
            { "label": "Name", "value": "{{document.name}}" },
            { "label": "URL", "value": "{{document.url}}" },
            { "label": "Type", "value": "{{document.type}}" },
            { "label": "Total Amount", "value": "{{document.totalAmount}}" },
            { "label": "Currency Code", "value": "{{document.currencyCode}}" },
            { "label": "Currency Symbol", "value": "{{document.currencySymbol}}" },
            { "label": "Expiry Date", "value": "{{document.expirydate}}" },
            { "label": "Preview URL", "value": "{{document.previewUrl}}" },
            { "label": "PDF URL", "value": "{{document.pdfLink}}" },
            { "label": "Document Decline Reasons", "value": "{{document.declinedReasons}}" },
            { "label": "Document Decline Reason Body", "value": "{{document.declinedReasonBody}}" },
            {
                "label": "Recipient",
                "value": "__recipient__",
                "children": [
                    { "label": "First Name", "value": "{{document.recipient.firstName}}" },
                    { "label": "Last Name", "value": "{{document.recipient.lastName}}" },
                    { "label": "Email", "value": "{{document.recipient.email}}" },
                    { "label": "Phone", "value": "{{document.recipient.phoneNumber}}" },
                    { "label": "Country", "value": "{{document.recipient.country}}" }
                ]
            }
        ]
    },
    {
        "label": "Campaign",
        "value": "__campaign__",
        "children": [
            { "label": "Event Date & Time", "value": "{{campaign.event_date_time}}" },
            { "label": "Event Date", "value": "{{campaign.event_date}}" },
            { "label": "Event Time", "value": "{{campaign.event_time}}" }
        ]
    }
];

interface TagDropdownProps {
    onSelect: (val: string) => void;
    onClose: () => void;
    position?: 'top' | 'bottom';
}

export function TagDropdown({ onSelect, onClose, position = 'bottom' }: TagDropdownProps) {
    const [currentPath, setCurrentPath] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const currentNodes = currentPath.length === 0
        ? snippetTagsData
        : currentPath[currentPath.length - 1].children;

    const filteredNodes = useMemo(() => {
        if (!searchQuery) return currentNodes;
        return currentNodes.filter((n: any) => n.label.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [currentNodes, searchQuery]);

    const positioningClass = position === 'top'
        ? 'bottom-[calc(100%+0.5rem)] mb-0' // open upwards
        : 'top-[calc(100%+0.5rem)] mt-0';  // open downwards

    return (
        <div
            ref={dropdownRef}
            className={`absolute left-0 w-64 h-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-2xl z-[100] text-left flex flex-col ${positioningClass}`}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="p-2 border-b border-gray-200 dark:border-gray-700 z-10 shrink-0">
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500 bg-transparent text-gray-900 dark:text-gray-100"
                    />
                </div>
            </div>

            <div className="overflow-y-auto flex-1 pb-1 scrollbar-thin">
                {currentPath.length > 0 && (
                    <div
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center text-sm font-medium text-primary-600 dark:text-primary-400 sticky top-0 bg-white dark:bg-gray-800"
                        onClick={() => {
                            setCurrentPath(prev => prev.slice(0, -1));
                            setSearchQuery('');
                        }}
                    >
                        <ArrowLeft size={14} className="mr-2" />
                        {currentPath[currentPath.length - 1].label}
                    </div>
                )}

                {filteredNodes.map((node: any, idx: number) => (
                    <div
                        key={idx}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center text-sm text-gray-700 dark:text-gray-200"
                        onClick={() => {
                            if (node.children) {
                                setCurrentPath(prev => [...prev, node]);
                                setSearchQuery('');
                            } else {
                                onSelect(node.value);
                            }
                        }}
                    >
                        <span>{node.label}</span>
                        {node.children && <ChevronRight size={14} className="text-gray-400" />}
                    </div>
                ))}
                {filteredNodes.length === 0 && (
                    <div className="px-4 py-8 text-sm text-gray-500 text-center">No matching tags</div>
                )}
            </div>
        </div>
    );
}
