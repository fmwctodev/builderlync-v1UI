import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  Calendar as CalendarIcon,
  User,
  ChevronDown,
} from "lucide-react";
import { getStaff, StaffMember } from "../../../shared/store/services/staffApi";
import { getJobs, Job } from "../../../shared/store/services/jobsApi";
import {
  createJobEvent,
  getAllEvents,
  updateJobEvent,
  deleteJobEvent,
  Event,
} from "../../../shared/store/services/eventsApi";
import ContactSearchDropdown from "../components/ContactSearchDropdown";

interface CalendarEvent {
  id: string;
  type: string;
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  allDay: boolean;
  location: string;
  invitees: string[];
  description: string;
  teamMember: string;
}

type ViewType = "daily" | "weekly" | "monthly";
const ALL_CONTACT_TYPES: string[] = [];

const Calendars: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [viewType, setViewType] = useState<ViewType>("monthly");
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    type: "",
    title: "",
    contactId: undefined as number | undefined,
    contactName: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    allDay: false,
    location: "",
    job: "",
    teamMember: "",
    invitees: [] as string[],
    description: "",
    syncToGoogle: false,
  });
  const fetchStaff = async () => {
    try {
      const response = await getStaff(1, 100);
      console.log("fetch staff", response.data);
      setStaff((response.data as any) || []);
    } catch (error: any) {
      console.error("Error fetching staff:", error);
      setToast({ message: "Failed to load staff", type: "error" });
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await getJobs(1, 100);
      console.log("fetch jobs", response.data.data);
      setJobs(response.data.data || []);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      setToast({ message: "Failed to load jobs", type: "error" });
    }
  };

  const getEventContactId = (event: Event) => {
    const rawContactId = (event as any).contact_id ?? event.contactId;
    if (rawContactId === null || rawContactId === undefined || rawContactId === "") {
      return undefined;
    }

    const parsedContactId = Number(rawContactId);
    return Number.isNaN(parsedContactId) ? undefined : parsedContactId;
  };

  const fetchEvents = async () => {
    try {
      const response = await getAllEvents();
      setEvents(response.data || []);
    } catch (error: any) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    if (formData.startTime && !formData.endTime && !editingEvent) {
      const [hours, minutes] = formData.startTime.split(":").map(Number);
      const date = new Date();
      date.setHours(hours + 1, minutes);
      const newEndTime = date.toTimeString().slice(0, 5);
      setFormData((prev) => ({ ...prev, endTime: newEndTime }));
    }
  }, [formData.startTime, editingEvent]);

  useEffect(() => {
    console.log("Latest push");
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowViewDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getWeekEnd = (date: Date) => {
    const start = getWeekStart(date);
    return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
  };

  const navigatePrevious = () => {
    if (viewType === "daily") {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 1,
        ),
      );
    } else if (viewType === "weekly") {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() - 7,
        ),
      );
    } else {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() - 1),
      );
    }
  };

  const navigateNext = () => {
    if (viewType === "daily") {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + 1,
        ),
      );
    } else if (viewType === "weekly") {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          currentDate.getDate() + 7,
        ),
      );
    } else {
      setCurrentDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth() + 1),
      );
    }
  };

  const getHeaderTitle = () => {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    if (viewType === "daily") {
      return `${dayNames[currentDate.getDay()]}, ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`;
    } else if (viewType === "weekly") {
      const weekStart = getWeekStart(currentDate);
      const weekEnd = getWeekEnd(currentDate);
      const startMonth = monthNames[weekStart.getMonth()];
      const endMonth = monthNames[weekEnd.getMonth()];

      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
      } else {
        return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
      }
    } else {
      return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }
  };

  const handleDateClick = (day: number, time?: string) => {
    const clickedDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    clickedDate.setHours(0, 0, 0, 0);

    if (clickedDate < today) {
      alert("Cannot create events for past dates");
      return;
    }

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(clickedDate);
    setEditingEvent(null);
    setFormData({
      type: "",
      title: "",
      contactId: undefined,
      contactName: "",
      startDate: dateStr,
      startTime: time || "",
      endDate: dateStr,
      endTime: "",
      allDay: false,
      location: "",
      job: "",
      teamMember: "",
      invitees: [],
      description: "",
      syncToGoogle: false,
    });
    setShowModal(true);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Event data:", event);
    console.log("Staff list:", staff);
    const selectedJob = jobs.find((job) => job.id === (event as any).job_id);
    const eventContactId = getEventContactId(event);
    // Since event doesn't have createdBy/createdByName, use first staff member as default
    const defaultStaff = staff.length > 0 ? staff[0] : null;
    console.log("Default staff:", defaultStaff);
    console.log("Event invitees:", event.invitees);
    setEditingEvent(event);
    const formDataToSet = {
      type: event.type || "meeting",
      title: event.title,
      contactId: eventContactId,
      contactName:
        event.contact?.full_name ||
        (event as any).contact_name ||
        (event as any).contacts?.full_name ||
        event.contactName ||
        "",
      startDate: (event as any).start_date || event.startDate,
      startTime: (event as any).start_time || event.startTime,
      endDate: (event as any).end_date || event.endDate,
      endTime: (event as any).end_time || event.endTime,
      allDay: event.allDay || false,
      location: event.location || "",
      job: selectedJob?.id ? String(selectedJob.id) : "",
      teamMember: defaultStaff
        ? `${defaultStaff.first_name} ${defaultStaff.last_name}`
        : "",
      invitees: event.invitees
        ? Array.isArray(event.invitees)
          ? event.invitees
          : [event.invitees]
        : [],
      description: event.description || "",
      syncToGoogle: !!event.googleEventId,
    };
    console.log("Form data being set:", formDataToSet);
    setFormData(formDataToSet);
    setShowModal(true);
  };

  const isEventInPast = () => {
    if (!editingEvent) return false;
    const eventDate = new Date(
      (editingEvent as any).start_date || editingEvent.startDate,
    );
    const eventTime =
      (editingEvent as any).start_time || editingEvent.startTime;
    if (eventTime) {
      const [hours, minutes] = eventTime.split(":").map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
    }
    return eventDate < new Date();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log(1);
    e.preventDefault();
    setLoading(true);

    try {
      const jobId = formData.job ? parseInt(formData.job) : undefined; const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Get Google Calendar credentials
      const refreshToken = localStorage.getItem("google_refresh_token");
      const googleEmail = localStorage.getItem("google_email");

      const eventData = {
        type: formData.type,
        title: formData.title,
        contactId: formData.contactId,
        jobId: formData.job ? parseInt(formData.job) : undefined,
        startDate: formData.startDate,
        startTime: formData.allDay ? "00:00" : formData.startTime,
        endDate: formData.endDate,
        endTime: formData.allDay ? "23:59" : formData.endTime,
        allDay: formData.allDay,
        location: formData.location,
        invitees: formData.invitees,
        description: formData.description,
        syncToGoogle: formData.syncToGoogle,
        refreshToken,
        googleEmail,
        timeZone
      };

      if (editingEvent) {
        const response = await updateJobEvent(jobId, editingEvent.id!, eventData);
        console.log('Update response:', response);
        // Update the event in state immediately
        setEvents(prevEvents =>
          prevEvents.map(evt =>
            evt.id === editingEvent.id ? { ...evt, ...response.data } : evt
          )
        );
        setToast({ message: "Event updated successfully!", type: "success" });
      } else {
        await createJobEvent(jobId, eventData);
        setToast({ message: "Event created successfully!", type: "success" });
        fetchEvents();
      }

      setShowModal(false);
      resetForm();
      setEditingEvent(null);
    } catch (error: any) {
      console.error('Submit error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || (editingEvent ? "Failed to update event" : "Failed to create event");
      setToast({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editingEvent) return;

    setLoading(true);
    try {
      const selectedJob = jobs.find((job) => job.name === formData.job);
      const jobId = selectedJob ? selectedJob.id : 1;

      await deleteJobEvent(jobId, editingEvent.id!);
      setToast({ message: "Event deleted successfully!", type: "success" });
      setShowModal(false);
      setShowDeleteConfirm(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      setToast({ message: "Failed to delete event", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: "",
      title: "",
      contactId: undefined,
      contactName: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      allDay: false,
      location: "",
      job: "",
      teamMember: "",
      invitees: [],
      description: "",
      syncToGoogle: false,
    });
    setEditingEvent(null);
  };

  useEffect(() => {
    fetchStaff();
    fetchJobs();
    fetchEvents();
  }, []);

  useEffect(() => {
    if (showModal) {
      const timer = setTimeout(() => {
        initAutocomplete();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  const initAutocomplete = () => {
    if (window.google?.maps?.places) {
      const input = document.getElementById(
        "location-input",
      ) as HTMLInputElement;
      if (input) {
        const autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            setFormData((prev) => ({
              ...prev,
              location: place.formatted_address || "",
            }));
          }
        });
      }
    } else {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.onload = () => {
        setTimeout(initAutocomplete, 100);
      };
      document.head.appendChild(script);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="min-h-[120px] border-r border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50"
        ></div>,
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = events.filter((event) => {
        const dateStr = (event as any).start_date || event.startDate;
        if (!dateStr || typeof dateStr !== 'string') return false;
        const [year, month, dayNum] = dateStr.split("-").map(Number);
        return (
          dayNum === day &&
          month - 1 === currentDate.getMonth() &&
          year === currentDate.getFullYear()
        );
      });

      const isToday =
        new Date().toDateString() ===
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          day,
        ).toDateString();

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`min-h-[120px] border-r border-b border-gray-200 dark:border-gray-700 p-3 cursor-pointer hover:bg-primary-50 dark:hover:bg-gray-750 transition-all duration-200 group ${isToday ? "bg-primary-50 dark:bg-primary-900/20" : ""
            }`}
        >
          <div className={`flex items-center justify-between mb-2`}>
            <span
              className={`text-sm font-semibold ${isToday
                ? "text-primary-600 dark:text-primary-400"
                : "text-gray-900 dark:text-white"
                }`}
            >
              {day}
            </span>
            {isToday && (
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            )}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                onClick={(e) => handleEventClick(event, e)}
                className="text-xs bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-md px-2 py-1 truncate shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                title={event.title}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-2">
            <Plus className="w-4 h-4 text-gray-400" />
          </div>
        </div>,
      );
    }

    return days;
  };

  const renderDailyView = () => {
    const hours = Array.from({ length: 13 }, (_, i) => i + 8);
    const dayEvents = events.filter((event) => {
      const dateStr = (event as any).start_date || event.startDate;
      if (!dateStr || typeof dateStr !== 'string') return false;
      const [year, month, day] = dateStr.split("-").map(Number);
      return (
        day === currentDate.getDate() &&
        month - 1 === currentDate.getMonth() &&
        year === currentDate.getFullYear()
      );
    });

    const allDayEvents = dayEvents.filter((event) => event.allDay);
    const timedEvents = dayEvents.filter((event) => !event.allDay);

    return (
      <div className="flex flex-col h-full">
        {allDayEvents.length > 0 && (
          <div className="border-b border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
              All Day
            </div>
            <div className="space-y-1">
              {allDayEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event, e);
                  }}
                  className="text-sm bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-md px-3 py-2 cursor-pointer hover:shadow-md transition-shadow"
                >
                  {event.title}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {hours.map((hour) => {
            const hourStr = `${String(hour).padStart(2, "0")}:00`;
            const hourEvents = timedEvents.filter((event) => {
              const eventTime = (event as any).start_time || event.startTime;
              return (
                eventTime && eventTime.startsWith(String(hour).padStart(2, "0"))
              );
            });

            return (
              <div
                key={hour}
                className="flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="w-20 flex-shrink-0 p-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {hour === 12
                    ? "12:00 PM"
                    : hour > 12
                      ? `${hour - 12}:00 PM`
                      : `${hour}:00 AM`}
                </div>
                <div
                  className="flex-1 p-3 cursor-pointer min-h-[60px]"
                  onClick={() =>
                    handleDateClick(currentDate.getDate(), hourStr)
                  }
                >
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEventClick(event, e);
                      }}
                      className="text-sm bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-md px-3 py-2 mb-1 cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <div className="font-semibold">{event.title}</div>
                      <div className="text-xs opacity-90">
                        {(event as any).start_time || event.startTime}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const hours = Array.from({ length: 13 }, (_, i) => i + 8);
    const weekStart = getWeekStart(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      return new Date(
        weekStart.getFullYear(),
        weekStart.getMonth(),
        weekStart.getDate() + i,
      );
    });

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
      <div className="flex flex-col h-full">
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="w-20 flex-shrink-0"></div>
          {weekDays.map((day, idx) => {
            const isToday = new Date().toDateString() === day.toDateString();
            return (
              <div
                key={idx}
                className="flex-1 p-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0"
              >
                <div
                  className={`text-xs font-semibold ${isToday ? "text-primary-600 dark:text-primary-400" : "text-gray-500 dark:text-gray-400"}`}
                >
                  {dayNames[day.getDay()]}
                </div>
                <div
                  className={`text-lg font-bold mt-1 ${isToday ? "text-primary-600 dark:text-primary-400" : "text-gray-900 dark:text-white"}`}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex-1 overflow-y-auto">
          {hours.map((hour) => {
            const hourStr = `${String(hour).padStart(2, "0")}:00`;
            return (
              <div
                key={hour}
                className="flex border-b border-gray-200 dark:border-gray-700"
              >
                <div className="w-20 flex-shrink-0 p-3 text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {hour === 12
                    ? "12:00 PM"
                    : hour > 12
                      ? `${hour - 12}:00 PM`
                      : `${hour}:00 AM`}
                </div>
                {weekDays.map((day, idx) => {
                  const dayEvents = events.filter((event) => {
                    const dateStr =
                      (event as any).start_date || event.startDate;
                    if (!dateStr || typeof dateStr !== 'string') return false;
                    const [year, month, dayNum] = dateStr
                      .split("-")
                      .map(Number);
                    const eventTime =
                      (event as any).start_time || event.startTime;
                    const matchesDate =
                      dayNum === day.getDate() &&
                      month - 1 === day.getMonth() &&
                      year === day.getFullYear();
                    const matchesTime =
                      !event.allDay &&
                      eventTime &&
                      eventTime.startsWith(String(hour).padStart(2, "0"));
                    return matchesDate && matchesTime;
                  });

                  return (
                    <div
                      key={idx}
                      className="flex-1 p-2 border-r border-gray-200 dark:border-gray-700 last:border-r-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors min-h-[60px]"
                      onClick={() => handleDateClick(day.getDate(), hourStr)}
                    >
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEventClick(event, e);
                          }}
                          className="text-xs bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded px-2 py-1 mb-1 cursor-pointer hover:shadow-md transition-shadow truncate"
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
        >
          {toast.message}
        </div>
      )}

      {/* Calendar Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <CalendarIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Calendar
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-gray-50 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={navigatePrevious}
                className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all duration-200 shadow-sm"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white min-w-[200px] text-center px-4">
                {getHeaderTitle()}
              </h2>
              <button
                onClick={navigateNext}
                className="p-2 hover:bg-white dark:hover:bg-gray-600 rounded-md transition-all duration-200 shadow-sm"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* View Selector Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowViewDropdown(!showViewDropdown)}
                className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                  {viewType}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform duration-200 ${showViewDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {showViewDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                  {(["daily", "weekly", "monthly"] as ViewType[]).map(
                    (view) => (
                      <button
                        key={view}
                        onClick={() => {
                          setViewType(view);
                          setShowViewDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors capitalize ${viewType === view
                          ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                          }`}
                      >
                        {view}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                const today = new Date();
                const year = today.getFullYear();
                const month = today.getMonth() + 1;
                const day = today.getDate();
                const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                setSelectedDate(today);
                setEditingEvent(null);
                setFormData({
                  type: "",
                  title: "",
                  contactId: undefined,
                  contactName: "",
                  startDate: dateStr,
                  startTime: "",
                  endDate: dateStr,
                  endTime: "",
                  allDay: false,
                  location: "",
                  job: "",
                  teamMember: "",
                  invitees: [],
                  description: "",
                  syncToGoogle: false,
                });
                setShowModal(true);
              }}
              className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid - Wider Layout */}
      <div
        className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col"
        style={{ minHeight: "600px" }}
      >
        {viewType === "monthly" && (
          <>
            {/* Day Headers */}
            <div className="grid grid-cols-7 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 flex-shrink-0">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="p-4 text-center font-semibold text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
              <div className="grid grid-cols-7">{renderCalendar()}</div>
            </div>
          </>
        )}

        {viewType === "daily" && renderDailyView()}
        {viewType === "weekly" && renderWeeklyView()}
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                  <CalendarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingEvent
                    ? isEventInPast()
                      ? "View Event"
                      : "Edit Event"
                    : "New Event"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Event Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select event type</option>
                    <option value="meeting">Meeting</option>
                    <option value="appointment">Appointment</option>
                    <option value="inspection">Inspection</option>
                    <option value="installation">Installation</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter event title..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Contact (Optional)
                  </label>
                  <ContactSearchDropdown
                    selectedContact={
                      formData.contactId
                        ? {
                          id: String(formData.contactId),
                          name: formData.contactName || `Contact #${formData.contactId}`,
                        }
                        : null
                    }
                    onSelectContact={(contact) => {
                      setFormData({
                        ...formData,
                        contactId: contact ? Number(contact.id) : undefined,
                        contactName: contact ? contact.name : "",
                      });
                    }}
                    contactTypes={ALL_CONTACT_TYPES}
                    placeholder="Search contacts..."
                    disabled={loading}
                  />
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Start Time
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startDate: e.target.value,
                          })
                        }
                        className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Time
                      </label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                        className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required={!formData.allDay}
                        disabled={formData.allDay}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                    End Time
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                        onChange={(e) =>
                          setFormData({ ...formData, endDate: e.target.value })
                        }
                        className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Time
                      </label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                        className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        required={!formData.allDay}
                        disabled={formData.allDay}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6 mb-4">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.allDay}
                      onChange={(e) =>
                        setFormData({ ...formData, allDay: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      All Day Event
                    </span>
                  </label>
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.syncToGoogle}
                      onChange={(e) =>
                        setFormData({ ...formData, syncToGoogle: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      Sync to Google Calendar
                    </span>
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Enter event location..."
                    id="location-input"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Associated Job (Optional)
                  </label>
                  <select
                    value={formData.job}
                    onChange={(e) =>
                      setFormData({ ...formData, job: e.target.value })
                    }
                    className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a job (optional)</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        #{job.id}
                        {job.name} ({job.createdByName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Assign Team Member
                  </label>
                  <select
                    value={formData.teamMember}
                    onChange={(e) =>
                      setFormData({ ...formData, teamMember: e.target.value })
                    }
                    className="input w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select team member</option>
                    {staff.map((member) => (
                      <option
                        key={member.id}
                        value={`${member.first_name} ${member.last_name}`}
                      >
                        {member.first_name} {member.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="input w-full h-28 resize-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Add event details, notes, or agenda..."
                  />
                </div>

                <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    {editingEvent && !isEventInPast() && (
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Delete Event
                      </button>
                    )}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-all duration-200"
                    >
                      Cancel
                    </button>
                    {!isEventInPast() && (
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading
                          ? editingEvent
                            ? "Updating..."
                            : "Creating..."
                          : editingEvent
                            ? "Update Event"
                            : "Create Event"}
                      </button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md mx-4 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Delete Event
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete "{editingEvent?.title}"? This
                action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendars;
