import { useState } from "react";
import API from "../../../services/api";
import { useNavigate, Link } from "react-router-dom";
import StatusBanner from "../../../components/ui/StatusBanner";
import Spinner from "../../../components/ui/Spinner";
import { getApiErrorMessage } from "../../../lib/get-api-error-message";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    try {
      setLoading(true);
      setErrorMessage("");

      const res = await API.post("/auth/login", form);

      localStorage.removeItem("githubToken");
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setErrorMessage(getApiErrorMessage(err, "Login failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl border border-white/70 bg-white/85 p-8 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">
            Welcome Back
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">
            Log in to your Code Buddy workspace
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Access your saved reviews, repository analysis, and insights dashboard from one place.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Review smarter</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Continue with pasted code reviews and repository file analysis.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Track progress</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Revisit saved history, metrics, and insights without losing context.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/70 bg-white/90 p-8 shadow-sm backdrop-blur">
          <h2 className="text-2xl font-semibold text-slate-900">Login</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use your account credentials to enter the dashboard.
          </p>

          {errorMessage ? (
            <StatusBanner
              tone="error"
              title="Login failed"
              message={errorMessage}
              className="mt-5"
            />
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? <Spinner size="sm" label="Logging in..." className="text-white [&>span:last-child]:text-white" /> : "Login"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Register here
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
