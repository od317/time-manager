"use client";

import { useState } from "react";
import { Clock, X } from "lucide-react";

interface TimePickerProps {
  onTimeSelect: (time: string) => void;
  initialTime?: string;
  label?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = ["00", "15", "30", "45"];

const QUICK_TIMES = [
  { label: "Morning", times: ["07:00", "08:00", "09:00", "10:00"] },
  { label: "Afternoon", times: ["1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"] },
  { label: "Evening", times: ["5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM"] },
];

const QUICK_TIME_VALUES: Record<string, string> = {
  "07:00": "07:00",
  "08:00": "08:00",
  "09:00": "09:00",
  "10:00": "10:00",
  "1:00 PM": "13:00",
  "2:00 PM": "14:00",
  "3:00 PM": "15:00",
  "4:00 PM": "16:00",
  "5:00 PM": "17:00",
  "6:00 PM": "18:00",
  "7:00 PM": "19:00",
  "8:00 PM": "20:00",
};

export function TimePicker({
  onTimeSelect,
  initialTime,
  label = "Set time (optional)",
}: TimePickerProps) {
  const [selectedHour, setSelectedHour] = useState<number | null>(
    initialTime ? parseInt(initialTime.split(":")[0]) : null,
  );
  const [selectedMinute, setSelectedMinute] = useState<string | null>(
    initialTime ? initialTime.split(":")[1] : null,
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (hour: number, minute: string) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    const time = `${hour.toString().padStart(2, "0")}:${minute}`;
    onTimeSelect(time);
    setIsOpen(false);
  };

  const handleQuickSelect = (displayTime: string) => {
    const actualTime = QUICK_TIME_VALUES[displayTime] || displayTime;
    const [hour, minute] = actualTime.split(":");
    handleSelect(parseInt(hour), minute);
  };

  const handleClear = () => {
    setSelectedHour(null);
    setSelectedMinute(null);
    onTimeSelect("");
    setIsOpen(false);
  };

  const formatHour = (hour: number): string => {
    if (hour === 0) return "12 AM";
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return "12 PM";
    return `${hour - 12} PM`;
  };

  const displayTime =
    selectedHour !== null && selectedMinute
      ? `${selectedHour.toString().padStart(2, "0")}:${selectedMinute}`
      : null;

  return (
    <div className="relative">
      {/* Trigger */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm ${
            displayTime
              ? "border-primary/50 bg-primary-bg/30 text-primary"
              : "border-border bg-bg text-text-muted hover:border-primary/30 hover:text-text"
          }`}
        >
          <Clock
            size={16}
            className={displayTime ? "text-primary" : "text-text-muted"}
          />
          <span className="flex-1 text-left">
            {displayTime
              ? `${formatHour(selectedHour!)}${selectedMinute !== "00" ? `:${selectedMinute}` : ""}`
              : label}
          </span>
        </button>

        {displayTime && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-danger rounded transition-all"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 bg-surface rounded-xl border border-border shadow-lg z-50 p-4 w-80 animate-slide-down">
          {/* Quick times */}
          <div className="mb-4">
            <p className="text-xs font-medium text-text-muted mb-2">
              Quick Select
            </p>
            <div className="space-y-2">
              {QUICK_TIMES.map((group) => (
                <div key={group.label}>
                  <p className="text-xs text-text-muted mb-1">{group.label}</p>
                  <div className="flex gap-1.5">
                    {group.times.map((time) => {
                      const actualTime = QUICK_TIME_VALUES[time] || time;
                      return (
                        <button
                          key={time}
                          onClick={() => handleQuickSelect(time)}
                          className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all border ${
                            displayTime === actualTime
                              ? "bg-primary text-white border-primary"
                              : "bg-bg text-text-secondary border-border hover:border-primary/30"
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border my-3" />

          {/* Manual time selection */}
          <div>
            <p className="text-xs font-medium text-text-muted mb-2">
              Custom Time
            </p>
            <div className="flex gap-3">
              {/* Hours */}
              <div className="flex-1">
                <p className="text-xs text-text-muted mb-1 text-center">Hour</p>
                <div className="max-h-32 overflow-y-auto space-y-0.5 pr-1">
                  {HOURS.map((hour) => (
                    <button
                      key={hour}
                      onClick={() => {
                        setSelectedHour(hour);
                        if (selectedMinute) {
                          handleSelect(hour, selectedMinute);
                        }
                      }}
                      className={`w-full text-center py-1.5 rounded text-sm transition-all ${
                        selectedHour === hour
                          ? "bg-primary text-white"
                          : "text-text hover:bg-border-light"
                      }`}
                    >
                      {formatHour(hour)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes */}
              <div className="w-20">
                <p className="text-xs text-text-muted mb-1 text-center">Min</p>
                <div className="space-y-0.5">
                  {MINUTES.map((minute) => (
                    <button
                      key={minute}
                      onClick={() => {
                        setSelectedMinute(minute);
                        if (selectedHour !== null) {
                          handleSelect(selectedHour, minute);
                        }
                      }}
                      className={`w-full text-center py-1.5 rounded text-sm transition-all ${
                        selectedMinute === minute
                          ? "bg-primary text-white"
                          : "text-text hover:bg-border-light"
                      }`}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Clear */}
          {displayTime && (
            <button
              onClick={handleClear}
              className="w-full mt-3 text-xs text-text-muted hover:text-danger transition-all py-1"
            >
              Clear time
            </button>
          )}
        </div>
      )}
    </div>
  );
}
