"use client";
import React, {useState, useEffect} from "react";

const THEME_KEY = "eventcheck_theme";

function getInitialTheme() {
  if (typeof window !== "undefined" && window.localStorage) {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") return stored;
    if (window.matchMedia("(prefers-color-scheme: dark)").matches)
      return "dark";
  }
  return "light";
}

export default function Home() {
  const [theme, setTheme] = useState("light");
  const [hasMounted, setHasMounted] = useState(false);
  interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    heardFrom: string[];
  }

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    heardFrom: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState<null | {
    type: "success" | "error";
    msg: string;
  }>(null);
  const [errors, setErrors] = useState<{firstName?: string; lastName?: string}>(
    {}
  );
  const [formTitle, setFormTitle] = useState("");
  const [isFetchingTitle, setIsFetchingTitle] = useState(true);

  useEffect(() => {
    setTheme(getInitialTheme());
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme, hasMounted]);

  useEffect(() => {
    const fetchFormTitle = async () => {
      try {
        setIsFetchingTitle(true);
        const res = await fetch("/api/form");
        if (res.ok) {
          const {title} = await res.json();
          setFormTitle(title);
          setIsFetchingTitle(false);
        }
      } catch (error) {
        console.error("Error fetching form title:", error);
        setFormTitle("Register for Event");
        setIsFetchingTitle(false);
      }
    };
    fetchFormTitle();
  }, []);

  const handleThemeToggle = () =>
    setTheme(theme === "light" ? "dark" : "light");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const {name, value, type} = target;
    if (name === "heardFrom") {
      if (type === "checkbox") {
        setForm((prev) => ({
          ...prev,
          heardFrom: target.checked
            ? [...prev.heardFrom, value]
            : prev.heardFrom.filter((item) => item !== value),
        }));
      }
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Update error fields for firstName/lastName

  const validate = () => {
    const errs: {firstName?: string; lastName?: string} = {};
    if (!form.firstName.trim()) errs.firstName = "First Name is required";
    if (!form.lastName.trim()) errs.lastName = "Last Name is required";
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          heardFrom: form.heardFrom.join(", "),
        }),
      });
      if (res.ok) {
        setShowToast({type: "success", msg: "Thank you for registering!"});
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          heardFrom: [],
        });
      } else {
        const data = await res.json();
        setShowToast({type: "error", msg: data.error || "Submission failed."});
      }
    } catch {
      setShowToast({type: "error", msg: "Submission failed."});
    } finally {
      setSubmitting(false);
      setTimeout(() => setShowToast(null), 2500);
    }
  };

  if (!hasMounted) return null;
  if (isFetchingTitle) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-lg text-gray-700 dark:text-gray-300">Loading...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center py-4 px-2 sm:px-6 transition-colors relative">
      <button
        aria-label="Toggle light/dark mode"
        onClick={handleThemeToggle}
        className="rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 absolute top-4 right-4"
      >
        {theme === "dark" ? "🌙" : "☀️"}
      </button>
      {/* Header with Theme Toggle */}
      <div className="mt-16 ">
        <header className="w-full flex justify-center items-center mb-8 px-2 sm:px-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {formTitle}
          </h1>
        </header>
        {/* Registration Form */}
        <main className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 sm:p-12 lg:p-16 flex flex-col gap-4 gap-y-2">
          <form
            onSubmit={handleSubmit}
            autoComplete="false"
            className="flex flex-col gap-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className="mt-2 block w-full rounded-md border-gray-500 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 h-10 px-2 shadow-md"
                  disabled={submitting}
                  autoComplete="false"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                  className="mt-2 block w-full rounded-md border-gray-500 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 h-10 px-2 shadow-md"
                  disabled={submitting}
                  autoComplete="off"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-500 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 h-10 px-2 shadow-md"
                  disabled={submitting}
                  autoComplete="off"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  className="mt-2 block w-full rounded-md border-gray-500 dark:border-gray-600 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500 h-10 px-2 shadow-md"
                  disabled={submitting}
                  autoComplete="off"
                />
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700 dark:text-gray-200 my-6">
                How did you hear about this event?{" "}
                <span className="text-sm">(Select all that apply)</span>
              </label>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                {[
                  "Instagram",
                  "Facebook",
                  "Twitter",
                  "TikTok",
                  "LinkedIn",
                  "Friend",
                  "Other",
                ].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <input
                      id={`heardFrom-${option}`}
                      name="heardFrom"
                      type="checkbox"
                      value={option}
                      checked={form.heardFrom.includes(option)}
                      onChange={handleChange}
                      disabled={submitting}
                      className="rounded border-gray-500 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 shadow-md"
                    />
                    <label
                      htmlFor={`heardFrom-${option}`}
                      className="text-base text-gray-700 dark:text-gray-200"
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="mt-2 w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
              disabled={submitting}
            >
              {submitting ? "Registering..." : "Register"}
            </button>
          </form>
        </main>
      </div>
      {/* Toast Notification */}
      {showToast && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded shadow-lg text-white font-semibold z-50 transition-all
            ${showToast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
        >
          {showToast.msg}
        </div>
      )}
    </div>
  );
}
