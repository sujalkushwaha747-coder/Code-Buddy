import { useState } from "react";
import API from "../../../services/api";
import { useNavigate, Link } from "react-router-dom";
import StatusBanner from "../../../components/ui/StatusBanner";
import Spinner from "../../../components/ui/Spinner";
import { getApiErrorMessage } from "../../../lib/get-api-error-message";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setErrorMessage("Name, email, and password are required.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      localStorage.removeItem("githubToken");
      await API.post("/auth/register", form);
      navigate("/login");
    } catch (err: any) {
      setErrorMessage(getApiErrorMessage(err, "Register failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl border border-white/70 bg-white/85 p-8 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-600">
            Create Account
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
            Start reviewing code with saved history and insights
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Create your account to review pasted code, inspect GitHub files, and track quality
            trends over time.
          </p>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Repository analysis</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Connect GitHub, browse files and folders, and review repository code with AI.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Metrics and insights</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Save every review, inspect complexity patterns, and track recurring issues.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-sm backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900">Register</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Set up your account to unlock the full review workflow.
          </p>

          {errorMessage ? (
            <StatusBanner
              tone="error"
              title="Registration failed"
              message={errorMessage}
              className="mt-5"
            />
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
              <input
                placeholder="Your full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {loading ? (
                <Spinner
                  size="sm"
                  label="Registering..."
                  className="text-white [&>span:last-child]:text-white"
                />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
              Login here
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
