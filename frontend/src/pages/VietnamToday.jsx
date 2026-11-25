import { useEffect } from "react";
import "./VietnamToday.css";
import initializeVietnamToday from "./VietnamToday.js";
import logoVietnamToday from "../assets/vntoday.jpg";
import logoXL from "../assets/xl.png";

const QUICK_VIEWS = [
  { section: "overview", module: "kpis", label: "Survey Snapshot" },
  { section: "planner", module: "summary", label: "Audience Profile" },
  { section: "demographics_profile", module: "age", label: "Who they are" },
  {
    section: "devices_sources",
    module: "platforms",
    label: "Where to reach them",
  },
  { section: "topics", module: "d3", label: "What content they want" },
  { section: "format_length", module: "fmtnews", label: "What formats work" },
  { section: "viewing_time", module: "weekday", label: "When to reach them" },
  {
    section: "vntd_nonaudience",
    module: "discovery_pref",
    label: "How to grow reach",
  },
];

const VietnamToday = () => {
  useEffect(() => initializeVietnamToday(), []);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Vietnam Today</h1>
        <div className="sub">
          Study dashboard · n = <span id="totalN"></span>
        </div>
        <div id="navList"></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="pagetitle">
            <h2 id="pageH2"></h2>
            <p id="pageP"></p>
          </div>
          <div className="topbar-right">
            <div className="lang-switch" id="langSwitch">
              <button type="button" className="lang-btn active" data-lang="en">
                EN
              </button>
              <button type="button" className="lang-btn" data-lang="vi">
                VI
              </button>
            </div>
            <div className="topbar-logos">
              <img className="vt-logo" src={logoXL} alt="Vietnam Today logo" />
              <img className="vt-logo" src={logoVietnamToday} alt="XL logo" />
            </div>
          </div>
        </header>

        <section className="workspace" id="audienceWorkspace">
          <div className="workspace-head">
            <div className="workspace-title">Audience</div>
            <div className="workspace-actions">
              <button
                type="button"
                className="uxbtn primary"
                id="editAudienceBtn"
              >
                Edit audience
              </button>
              <button type="button" className="uxbtn" id="copyAToBBtn">
                Compare audience
              </button>
            </div>
          </div>
          <div className="quickviews" id="quickViews">
            {QUICK_VIEWS.map(({ section, module, label }) => (
              <button
                type="button"
                className="quickview"
                data-section={section}
                data-module={module}
                key={`${section}-${module}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="audience-summary" id="audienceSummary"></div>
        </section>

        <section className="filterbar collapsed" id="filterbarWrap">
          <div className="audiencecard A">
            <div className="ahead">
              <strong>Audience 1</strong>
              <span className="ncount" id="ncountA"></span>
            </div>
            <div className="filtergrid" id="filtersA"></div>
          </div>
          <div
            className="audiencecard B"
            id="cardB"
            style={{ display: "none" }}
          >
            <div className="ahead">
              <strong>Audience 2</strong>
              <span className="ncount" id="ncountB"></span>
            </div>
            <div className="filtergrid" id="filtersB"></div>
          </div>
        </section>

        <div id="toggleBWrap" style={{ margin: "-8px 0 16px" }}>
          <span className="toggleB" id="toggleBBtn">
            + Add comparison audience
          </span>
        </div>

        <section
          className="audiencecard A"
          id="screenerBar"
          style={{ display: "none", marginBottom: "16px" }}
        >
          <div className="ahead">
            <strong>Target A</strong>
            <span className="ncount" id="screenerN_A"></span>
          </div>
          <div className="chipset" id="screenerChips_A"></div>
          <div className="screener-base">
            <label className="flabel">Base</label>
            <div className="triset" id="screenerBaseToggle_A"></div>
          </div>
        </section>

        <section
          className="audiencecard B"
          id="screenerBarB"
          style={{ display: "none", marginBottom: "16px" }}
        >
          <div className="ahead">
            <strong>Target B</strong>
            <span className="ncount" id="screenerN_B"></span>
          </div>
          <div className="chipset" id="screenerChips_B"></div>
          <div className="screener-base">
            <label className="flabel">Base</label>
            <div className="triset" id="screenerBaseToggle_B"></div>
          </div>
        </section>

        <div
          id="screenerToggleBWrap"
          style={{ margin: "-8px 0 16px", display: "none" }}
        >
          <span className="toggleB" id="screenerToggleBBtn">
            + Compare with a second market or base
          </span>
        </div>

        <div className="moduletabs" id="moduleTabs"></div>
        <section className="panel">
          <h3 id="panelTitle"></h3>
          <p className="desc" id="panelDesc"></p>
          <div className="brand-mark is-hidden" id="brandMark">
            <img src={logoVietnamToday} alt="Vietnam Today" />
            <span>Vietnam Today</span>
          </div>
          <div id="vizArea"></div>
          <div className="footnote" id="panelFootnote"></div>
        </section>
        <div id="drilldownArea"></div>
        <p className="footnote">
          Percentages are the share of each audience selecting that item, out of
          everyone in that audience who answered the question (a few questions
          are only asked to a relevant subset, noted where it applies).
          Multi-select items can sum to more than 100%.
        </p>
      </main>
    </div>
  );
};

export default VietnamToday;
