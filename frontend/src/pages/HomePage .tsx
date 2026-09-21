import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Shield,
  Map,
  Activity,
  Siren,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* NAVBAR */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Shield className="h-5 w-5" />
            </div>

            <div>
              <div className="text-sm font-bold tracking-wide">
                DISASTER INTELLIGENCE
              </div>
              <div className="text-xs text-slate-400">
                Response System
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              to="/disasters"
              className="text-sm text-slate-300 hover:text-white"
            >
              Disasters
            </Link>

            <Link
              to="/alerts"
              className="text-sm text-slate-300 hover:text-white"
            >
              Alerts
            </Link>

            <Link
              to="/vulnerability-zones"
              className="text-sm text-slate-300 hover:text-white"
            >
              Risk Zones
            </Link>

            <Link
              to="/about"
              className="text-sm text-slate-300 hover:text-white"
            >
              About
            </Link>

            <Link
              to="/login"
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-500"
            >
              Login
            </Link>
          </nav>

        </div>
      </header>


      {/* HERO */}
      <main>

        <section className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:items-center">

          <div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-2 text-xs font-semibold text-blue-300">
              <Activity className="h-4 w-4" />
              Disaster Intelligence Platform
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Understand disasters.
              <span className="text-blue-500">
                {" "}Respond smarter.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              Explore disaster information, identify vulnerable regions,
              monitor alerts, and coordinate emergency response through
              one centralized platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <Link
                to="/disasters"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
              >
                Explore disasters
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/alerts"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-6 py-3 font-semibold text-slate-200 hover:bg-white/5"
              >
                View alerts
              </Link>

            </div>

          </div>


          {/* VISUAL PANEL */}

          <div className="relative">

            <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-2xl">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Situation overview
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">
                    Disaster Intelligence
                  </h2>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  System available
                </div>
              </div>


              <div className="grid grid-cols-2 gap-4">

                <StatCard
                  icon={<AlertTriangle />}
                  label="Disasters"
                  value="Explore"
                />

                <StatCard
                  icon={<Siren />}
                  label="Alerts"
                  value="Monitor"
                />

                <StatCard
                  icon={<Map />}
                  label="Risk Zones"
                  value="Analyze"
                />

                <StatCard
                  icon={<Shield />}
                  label="Response"
                  value="Coordinate"
                />

              </div>


              <div className="mt-4 rounded-xl border border-white/10 bg-slate-950 p-5">

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Public information access
                  </span>

                  <span className="text-sm font-semibold text-emerald-400">
                    Available
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-4/5 rounded-full bg-blue-600" />
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* FEATURES */}

        <section className="border-y border-white/10 bg-slate-900/50">

          <div className="mx-auto max-w-7xl px-6 py-20">

            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                Platform
              </p>

              <h2 className="mt-3 text-3xl font-bold">
                Information available to everyone
              </h2>

              <p className="mt-4 text-slate-400">
                Browse disaster information and risk insights without
                creating an account. Sign in when you need personalized
                response features.
              </p>
            </div>


            <div className="mt-10 grid gap-5 md:grid-cols-3">

              <Feature
                icon={<AlertTriangle />}
                title="Disaster Information"
                description="Browse disaster records, locations, severity and historical information."
                link="/disasters"
              />

              <Feature
                icon={<Siren />}
                title="Alerts"
                description="View published emergency alerts and their severity."
                link="/alerts"
              />

              <Feature
                icon={<Map />}
                title="Vulnerability Zones"
                description="Explore regions categorized according to disaster risk."
                link="/vulnerability-zones"
              />

            </div>

          </div>

        </section>


        {/* LOGIN CTA */}

        <section className="mx-auto max-w-7xl px-6 py-20">

          <div className="rounded-2xl border border-blue-500/20 bg-blue-600/10 p-8 md:p-12">

            <div className="max-w-2xl">

              <h2 className="text-3xl font-bold">
                Need emergency assistance?
              </h2>

              <p className="mt-4 leading-7 text-slate-400">
                Create an account to submit emergency help requests
                and track their status.
              </p>

              <Link
                to="/login"
                className="mt-7 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
              >
                Sign in to request help
                <ArrowRight className="h-4 w-4" />
              </Link>

            </div>

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="border-t border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">

          <span>
            Disaster Intelligence Response System
          </span>

          <span>
            Public information portal
          </span>

        </div>

      </footer>

    </div>
  );
}


function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950 p-5">

      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400">
        {icon}
      </div>

      <p className="text-xs uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>

    </div>
  );
}


function Feature({
  icon,
  title,
  description,
  link,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}) {
  return (
    <Link
      to={link}
      className="group rounded-xl border border-white/10 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500/40"
    >

      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400">
        {icon}
      </div>

      <h3 className="mt-6 text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-blue-400">
        Explore
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>

    </Link>
  );
}