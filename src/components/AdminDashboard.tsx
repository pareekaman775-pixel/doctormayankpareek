import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  Check,
  Clock3,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "CANCELLED";

type Appointment = {
  id: number;
  full_name: string;
  phone: string;
  email: string;
  appointment_date: string;
  appointment_time: string;
  dental_concern: string;
  message: string | null;
  status: AppointmentStatus;
  created_at: string;
  confirmed_at: string | null;
};

type AdminDashboardProps = {
  token: string;
  onLogout: () => void;
};

const API_URL = "http://localhost:5000/api/appointments";

const formatDate = (value: string) => {
  if (!value) return "—";

  const dateOnly = value.slice(0, 10);

  const [year, month, day] = dateOnly.split("-");

  if (!year || !month || !day) {
    return value;
  }

  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day)
  );

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value: string) => {
  if (!value) return "—";

  const [hoursString, minutesString] = value.split(":");

  let hours = Number(hoursString);
  const minutes = minutesString || "00";

  if (Number.isNaN(hours)) {
    return value;
  }

  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${period}`;
};

const statusClasses: Record<AppointmentStatus, string> = {
  PENDING:
    "border-[#ead9ad] bg-[#fff9e9] text-[#8a6a1f]",
  CONFIRMED:
    "border-[#bfe0d0] bg-[#effaf4] text-[#21643e]",
  REJECTED:
    "border-[#efcaca] bg-[#fff5f5] text-[#8c3030]",
  CANCELLED:
    "border-[#d9dfdf] bg-[#f3f5f5] text-[#647374]",
};

function AdminDashboard({
  token,
  onLogout,
}: AdminDashboardProps) {
  const [appointments, setAppointments] = useState<
    Appointment[]
  >([]);

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | AppointmentStatus
  >("ALL");

  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);

  const [actionId, setActionId] = useState<number | null>(
    null
  );

  const [errorMessage, setErrorMessage] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      if (!token) {
        setErrorMessage(
          "Admin session not found. Please login again."
        );
        return;
      }

      console.log(
        "Fetching appointments from:",
        API_URL
      );

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const text = await response.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {
          message: text || "Invalid server response.",
        };
      }

      console.log(
        "Appointments API response:",
        response.status,
        data
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `HTTP ${response.status}: Unable to fetch appointments.`
        );
      }

      setAppointments(
        Array.isArray(data.appointments)
          ? data.appointments
          : []
      );
    } catch (error) {
      console.error(
        "Fetch appointments error:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to load appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const counts = useMemo(
    () => ({
      total: appointments.length,

      pending: appointments.filter(
        (item) => item.status === "PENDING"
      ).length,

      confirmed: appointments.filter(
        (item) => item.status === "CONFIRMED"
      ).length,

      rejected: appointments.filter(
        (item) => item.status === "REJECTED"
      ).length,
    }),
    [appointments]
  );

  const filteredAppointments = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return appointments.filter((appointment) => {
      const matchesStatus =
        statusFilter === "ALL" ||
        appointment.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!search) {
        return true;
      }

      return [
        appointment.full_name,
        appointment.phone,
        appointment.email,
        appointment.dental_concern,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(search)
      );
    });
  }, [
    appointments,
    searchTerm,
    statusFilter,
  ]);

  const updateAppointment = async (
    id: number,
    action: "confirm" | "reject"
  ) => {
    try {
      setActionId(id);
      setErrorMessage("");
      setSuccessMessage("");

      if (!token) {
        onLogout();
        return;
      }

      const response = await fetch(
        `${API_URL}/${id}/${action}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const text = await response.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {
          message: text || "Invalid server response.",
        };
      }

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Unable to ${action} appointment.`
        );
      }

      setSuccessMessage(
        action === "confirm"
          ? "Appointment confirmed successfully."
          : "Appointment rejected successfully."
      );

      await fetchAppointments();
    } catch (error) {
      console.error(
        `${action} appointment error:`,
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : `Unable to ${action} appointment.`
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4faf9] text-[#173235]">
      <header className="sticky top-0 z-40 border-b border-[#dfeceb] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f6668]">
              Shree Shyam Dental Care
            </p>

            <h1 className="mt-1 text-xl font-extrabold tracking-tight sm:text-2xl">
              Admin Appointment Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl border border-[#efcaca] bg-white px-4 py-2.5 text-sm font-bold text-[#8c3030] transition hover:bg-[#fff5f5]"
            >
              Logout
            </button>

            <button
              type="button"
              onClick={fetchAppointments}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-[#cfe1df] bg-white px-4 py-2.5 text-sm font-bold text-[#315657] transition hover:border-[#0f6668] hover:text-[#0f6668] disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  loading ? "animate-spin" : ""
                }
              />

              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Appointments",
              value: counts.total,
              icon: CalendarDays,
              className: "bg-white",
            },
            {
              label: "Pending",
              value: counts.pending,
              icon: Clock3,
              className: "bg-[#fffaf0]",
            },
            {
              label: "Confirmed",
              value: counts.confirmed,
              icon: Check,
              className: "bg-[#f1faf5]",
            },
            {
              label: "Rejected",
              value: counts.rejected,
              icon: X,
              className: "bg-[#fff7f7]",
            },
          ].map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className={`rounded-2xl border border-[#dfeceb] ${card.className} p-5 shadow-[0_10px_30px_rgba(20,70,70,0.05)]`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#849596]">
                      {card.label}
                    </p>

                    <p className="mt-3 text-3xl font-extrabold text-[#173235]">
                      {card.value}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7f3f1] text-[#0f6668]">
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {successMessage && (
          <div className="mt-6 rounded-xl border border-[#bfe0d0] bg-[#effaf4] px-4 py-3 text-sm font-semibold text-[#21643e]">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 rounded-xl border border-[#efcaca] bg-[#fff5f5] px-4 py-3 text-sm font-semibold text-[#8c3030]">
            {errorMessage}
          </div>
        )}

        <section className="mt-8 rounded-[2rem] border border-[#dfeceb] bg-white shadow-[0_20px_60px_rgba(20,70,70,0.07)]">
          <div className="border-b border-[#e5eeee] p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[#173235]">
                  Appointment Requests
                </h2>

                <p className="mt-1 text-sm text-[#718687]">
                  Review patient requests and manage appointment status.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a9b9c]"
                  />

                  <input
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(event.target.value)
                    }
                    placeholder="Search patient..."
                    className="w-full rounded-xl border border-[#d6e5e3] bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-[#0f6668] focus:ring-4 focus:ring-[#0f6668]/10 sm:w-56"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as
                        | "ALL"
                        | AppointmentStatus
                    )
                  }
                  className="rounded-xl border border-[#d6e5e3] bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-[#0f6668] focus:ring-4 focus:ring-[#0f6668]/10"
                >
                  <option value="ALL">
                    All Status
                  </option>

                  <option value="PENDING">
                    Pending
                  </option>

                  <option value="CONFIRMED">
                    Confirmed
                  </option>

                  <option value="REJECTED">
                    Rejected
                  </option>

                  <option value="CANCELLED">
                    Cancelled
                  </option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-72 items-center justify-center p-8">
              <div className="text-center">
                <Activity
                  size={28}
                  className="mx-auto animate-pulse text-[#0f6668]"
                />

                <p className="mt-3 text-sm font-semibold text-[#718687]">
                  Loading appointments...
                </p>
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-10 text-center sm:p-16">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eaf4f2] text-[#0f6668]">
                <CalendarDays size={28} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-[#294d4e]">
                No appointments found
              </h3>

              <p className="mt-2 text-sm text-[#718687]">
                New appointment requests will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-[#e5eeee] bg-[#f8fbfa] text-left">
                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#849596]">
                      Patient
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#849596]">
                      Appointment
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#849596]">
                      Concern
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#849596]">
                      Status
                    </th>

                    <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#849596]">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAppointments.map(
                    (appointment) => (
                      <tr
                        key={appointment.id}
                        className="border-b border-[#edf3f2] last:border-0"
                      >
                        <td className="px-5 py-5">
                          <p className="font-bold text-[#294d4e]">
                            {appointment.full_name}
                          </p>

                          <p className="mt-1 text-xs text-[#718687]">
                            ID #{appointment.id}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#718687]">
                            <a
                              href={`tel:${appointment.phone}`}
                              className="inline-flex items-center gap-1 hover:text-[#0f6668]"
                            >
                              <Phone size={13} />
                              {appointment.phone}
                            </a>

                            <a
                              href={`mailto:${appointment.email}`}
                              className="inline-flex items-center gap-1 hover:text-[#0f6668]"
                            >
                              <Mail size={13} />
                              {appointment.email}
                            </a>
                          </div>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-bold text-[#294d4e]">
                            {formatDate(
                              appointment.appointment_date
                            )}
                          </p>

                          <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-[#718687]">
                            <Clock3 size={14} />
                            {formatTime(
                              appointment.appointment_time
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-5">
                          <p className="font-semibold text-[#405e5f]">
                            {appointment.dental_concern}
                          </p>

                          {appointment.message && (
                            <p className="mt-2 max-w-xs text-xs leading-5 text-[#849596]">
                              {appointment.message}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${statusClasses[appointment.status]}`}
                          >
                            {appointment.status}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          {appointment.status ===
                          "PENDING" ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={
                                  actionId ===
                                  appointment.id
                                }
                                onClick={() =>
                                  updateAppointment(
                                    appointment.id,
                                    "confirm"
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#21884c] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#176b3a] disabled:opacity-60"
                              >
                                <Check size={14} />
                                Confirm
                              </button>

                              <button
                                type="button"
                                disabled={
                                  actionId ===
                                  appointment.id
                                }
                                onClick={() =>
                                  updateAppointment(
                                    appointment.id,
                                    "reject"
                                  )
                                }
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#c94b4b] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#a93b3b] disabled:opacity-60"
                              >
                                <X size={14} />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-[#9aa8a8]">
                              No action
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="mt-6 flex items-center gap-2 text-xs text-[#899999]">
          <MapPin size={14} />
          Admin panel for Shree Shyam Dental Care • Bhilwara
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;