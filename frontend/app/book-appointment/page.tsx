"use client";

import * as React from "react";
import { CalendarCheck2, CheckCircle2, Loader2, Phone } from "lucide-react";
import { submitBookingRequest, type SubmitBookingResult } from "@/services/public-booking-service";
import { ApiError } from "@/lib/api";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookAppointmentPage() {
  const [form, setForm] = React.useState({
    patientName: "",
    patientPhone: "",
    patientEmail: "",
    preferredDate: "",
    preferredTime: "",
    visitReason: "",
    notes: "",
  });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<SubmitBookingResult | null>(null);

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.patientName.trim()) { setError("Full name is required."); return; }
    if (!form.patientPhone.trim()) { setError("Phone number is required."); return; }
    if (!form.preferredDate) { setError("Preferred date is required."); return; }
    if (form.preferredDate < today()) { setError("Please choose a future date."); return; }

    setBusy(true);
    try {
      const res = await submitBookingRequest({
        patientName: form.patientName.trim(),
        patientPhone: form.patientPhone.trim(),
        patientEmail: form.patientEmail.trim() || undefined,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime.trim() || undefined,
        visitReason: form.visitReason.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      setResult(res);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl bg-white border shadow-xl p-8 text-center space-y-5">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-9 w-9 text-green-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Received!</h1>
            <p className="mt-2 text-gray-500 text-sm leading-relaxed">{result.message}</p>
          </div>
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 text-left space-y-2">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Reference</p>
              <p className="text-lg font-bold text-blue-700">{result.bookingRef}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Name</p>
              <p className="font-medium text-gray-800">{result.patientName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Preferred date</p>
              <p className="font-medium text-gray-800">
                {new Date(result.preferredDate).toLocaleDateString(undefined, {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Save your reference number. We will call you to confirm the appointment.
          </p>
          <button
            onClick={() => { setResult(null); setForm({ patientName: "", patientPhone: "", patientEmail: "", preferredDate: "", preferredTime: "", visitReason: "", notes: "" }); }}
            className="w-full rounded-xl bg-blue-600 text-white py-2.5 font-semibold hover:bg-blue-700 transition"
          >
            Book another appointment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white border shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-7 text-white">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/20 flex items-center justify-center">
              <CalendarCheck2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Book an Appointment</h1>
              <p className="text-blue-100 text-sm">Fill in your details and we will confirm shortly</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.patientName}
                onChange={set("patientName")}
                placeholder="e.g. Jane Doe"
                maxLength={150}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Phone number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  value={form.patientPhone}
                  onChange={set("patientPhone")}
                  placeholder="e.g. 0712 345678"
                  maxLength={30}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Email (optional)
              </label>
              <input
                type="email"
                value={form.patientEmail}
                onChange={set("patientEmail")}
                placeholder="optional@email.com"
                maxLength={255}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Preferred date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.preferredDate}
                onChange={set("preferredDate")}
                min={today()}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Preferred time (optional)
              </label>
              <select
                value={form.preferredTime}
                onChange={set("preferredTime")}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Any time</option>
                <option value="08:00">8:00 AM</option>
                <option value="09:00">9:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="16:00">4:00 PM</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Reason for visit (optional)
              </label>
              <textarea
                value={form.visitReason}
                onChange={set("visitReason")}
                placeholder="e.g. Routine check-up, persistent headache..."
                maxLength={1000}
                rows={2}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">
                Additional notes (optional)
              </label>
              <textarea
                value={form.notes}
                onChange={set("notes")}
                placeholder="Allergies, current medications, special requests..."
                maxLength={2000}
                rows={2}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 disabled:opacity-60 transition"
          >
            {busy ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
            ) : (
              <><CalendarCheck2 className="h-4 w-4" /> Request Appointment</>
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            We will contact you on your phone to confirm the date and time.
          </p>
        </form>
      </div>
    </div>
  );
}
