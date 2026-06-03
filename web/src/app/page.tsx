import Hook from "@/components/sections/Hook";
import RawData from "@/components/sections/RawData";
import Cleaning from "@/components/sections/Cleaning";
import Findings from "@/components/sections/Findings";
import Dashboard from "@/components/sections/Dashboard";
import Prediction from "@/components/sections/Prediction";
import Recommendation from "@/components/sections/Recommendation";
import Footer from "@/components/sections/Footer";
import Reveal from "@/components/ui/Reveal";
import SectionNav from "@/components/ui/SectionNav";

// The single case-study page — the 7 narrative beats in scroll order.
export default function Page() {
  return (
    <>
      <SectionNav />
      <main className="relative overflow-x-clip">
        {/* Section 1 — Hook */}
        <Reveal>
          <Hook />
        </Reveal>
        {/* Section 2 — Raw Data */}
        <Reveal>
          <RawData />
        </Reveal>
        {/* Section 3 — The Cleaning */}
        <Reveal>
          <Cleaning />
        </Reveal>
        {/* Section 4 — The Findings */}
        <Reveal>
          <Findings />
        </Reveal>
        {/* Section 5 — The Dashboard (interactive control tower) */}
        <Reveal>
          <Dashboard />
        </Reveal>
        {/* Section 6 — The Prediction (risk model) */}
        <Reveal>
          <Prediction />
        </Reveal>
        {/* Section 7 — The Recommendation */}
        <Reveal>
          <Recommendation />
        </Reveal>
      </main>
      <Footer />
    </>
  );
}
