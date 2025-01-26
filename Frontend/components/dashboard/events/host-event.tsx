'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon} from "lucide-react";
import { format, isBefore, addMinutes, startOfDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { apiUrl } from '@/components/noncomponents';
import Cookies from 'js-cookie'

interface EventFormInputs {
  eventName: string;
  eventStartDate: Date | null;
  eventStartTime: string;
  eventEndDate: Date | null;
  eventEndTime: string;
}

const timeOptions = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

export default function HostEvent() {
  const { register, handleSubmit, setValue, watch, formState: { errors, isValid } } = useForm<EventFormInputs>({
    mode: "onChange",
    defaultValues: {
      eventName: "",
      eventStartDate: null,
      eventStartTime: timeOptions[0],
      eventEndDate: null,
      eventEndTime: timeOptions[0],
    },
  });

  const watchEventStartDate = watch("eventStartDate");
  const watchEventEndDate = watch("eventEndDate");
  const watchEventStartTime = watch("eventStartTime");
  const watchEventEndTime = watch("eventEndTime");

  const validateStartDate = (date: Date | null) => {
    if (!date) return "Start date is required";
    if (isBefore(date, startOfDay(new Date()))) return "Start date must be today or in the future";
    return true;
  };

  const validateStartTime = () => {
    const now = new Date();
    const selectedStart = watchEventStartDate
      ? new Date(format(watchEventStartDate, "yyyy-MM-dd") + " " + watchEventStartTime)
      : null;

    if (!selectedStart || isBefore(selectedStart, addMinutes(now, 1))) {
      return "Start time must be at least one minute from now";
    }
    return true;
  };

  const validateEndDate = (date: Date | null) => {
    if (!date) return "End date is required";
    if (!watchEventStartDate || isBefore(date, watchEventStartDate)) {
      return "End date must be after the start date";
    }
    return true;
  };

  const validateEndTime = () => {
    const startDateTime = watchEventStartDate
      ? new Date(format(watchEventStartDate, "yyyy-MM-dd") + " " + watchEventStartTime)
      : null;
    const endDateTime = watchEventEndDate
      ? new Date(format(watchEventEndDate, "yyyy-MM-dd") + " " + watchEventEndTime)
      : null;

    if (!endDateTime || !startDateTime || isBefore(endDateTime, startDateTime)) {
      return "End time must be after the start time";
    }
    return true;
  };

  const onSubmit: SubmitHandler<EventFormInputs> = async (data) => {
    if (
      validateStartDate(watchEventStartDate) !== true ||
      validateStartTime() !== true ||
      validateEndDate(watchEventEndDate) !== true ||
      validateEndTime() !== true
    ) {
      return; 
    }
    try {
      const cookies = Cookies.get("accessToken");
      if (cookies) {
      const session = JSON.parse(cookies);
      const body = {startDate: data.eventStartDate, endDate: data.eventEndDate, startTime: data.eventStartTime, endTime: data.eventEndTime, accType:"Host", event: data.eventName, user: session.user}
      const response = (await apiUrl.post(`/events/host`, body)).data
      if (response && response.success){
        console.log("data inserted succesfully")
      }
      } else {
      console.log("Cookie not found, data insertion failed");
      return; 
    }
    } catch (error) {
      console.log("something went wrong: ", error);
      return
    }
  };

  return (
    <div className="flex justify-center h-2/4">
      <Card className="w-full max-w-xl p-6 shadow-lg border border-gray-200 rounded-lg bg-white">
        <CardHeader className="mb-4">
          <CardTitle className="text-2xl font-bold text-gray-800 text-center">
            Host an Event
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Event Name */}
            <div>
              <Label htmlFor="eventName" className="text-gray-600 font-medium mb-2 block">
                Event Name
              </Label>
              <Input
                id="eventName"
                type="text"
                placeholder="Enter event name"
                {...register("eventName", { required: "Event name is required" })}
                className="peer block w-full px-4 py-2 border border-gray-300 rounded-lg placeholder-gray-400"
              />
              {errors.eventName && (
                <p className="text-sm text-red-500 mt-1">{errors.eventName.message}</p>
              )}
            </div>

            {/* Event Start */}
            <div>
              <Label htmlFor="eventStart" className="text-gray-600 font-medium mb-2 block">
                Event Start
              </Label>
              <div className="flex space-x-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-80 justify-start text-left font-normal">
                      {watchEventStartDate ? format(watchEventStartDate, "PPPP") : <span>Select date</span>}
                      <CalendarIcon className="w-4 h-4 ml-auto text-gray-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar
                      mode="single"
                      selected={watchEventStartDate || undefined}
                      onSelect={(date) => setValue("eventStartDate", date || null)}
                    />
                  </PopoverContent>
                </Popover>
                <select
                  value={watchEventStartTime}
                  onChange={(e) => setValue("eventStartTime", e.target.value)}
                  className="w-48 pl-3 pr-4 py-2 border rounded"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              {errors.eventStartDate && (
                <p className="text-sm text-red-500 mt-1">{errors.eventStartDate.message}</p>
              )}
            </div>

            {/* Event End */}
            <div>
              <Label htmlFor="eventEnd" className="text-gray-600 font-medium mb-2 block">
                Event End
              </Label>
              <div className="flex space-x-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-80 justify-start text-left font-normal">
                      {watchEventEndDate ? format(watchEventEndDate, "PPPP") : <span>Select date</span>}
                      <CalendarIcon className="w-4 h-4 ml-auto text-gray-500" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="p-0">
                    <Calendar
                      mode="single"
                      selected={watchEventEndDate || undefined}
                      onSelect={(date) => setValue("eventEndDate", date || null)}
                    />
                  </PopoverContent>
                </Popover>
                <select
                  value={watchEventEndTime}
                  onChange={(e) => setValue("eventEndTime", e.target.value)}
                  className="w-48 pl-3 pr-4 py-2 border rounded"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
              {errors.eventEndDate && (
                <p className="text-sm text-red-500 mt-1">{errors.eventEndDate.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2"
              disabled={!isValid}
            >
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
