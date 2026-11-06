import { useEffect } from "react";
import "./VietnamToday.css";
import render from "./VietnamToday.js";
const VietnamToday = () => {
  useEffect(() => {
    render();
  }, []);
  
  return (
    <>
      <div className="layout">
        <div className="sidebar">
          <h1>Vietnam Today</h1>

          <div className="sub">
            Study dashboard · n = <span id="totalN"></span>
          </div>

          <div id="navList"></div>
        </div>

        <div className="main">
          <div className="topbar">
            <div className="pagetitle">
              <h2 id="pageH2"></h2>
              <p id="pageP"></p>
            </div>
          </div>

          {/* Filter bar */}
          <div className="filterbar" id="filterbarWrap">
            {/* Audience A */}
            <div className="audiencecard A">
              <div className="ahead">
                <strong>Audience A</strong>
                <span className="ncount" id="ncountA"></span>
              </div>

              <div className="filtergrid" id="filtersA"></div>

              <span className="resetlink" id="resetA">
                Reset to everyone
              </span>
            </div>

            {/* Audience B */}
            <div
              className="audiencecard B"
              id="cardB"
              style={{ display: "none" }}
            >
              <div className="ahead">
                <strong>Audience B</strong>
                <span className="ncount" id="ncountB"></span>
              </div>

              <div className="filtergrid" id="filtersB"></div>

              <span className="resetlink" id="resetB">
                Reset to everyone
              </span>
            </div>
          </div>

          {/* Toggle Audience B */}
          <div
            style={{
              margin: "-8px 0 16px",
            }}
            id="toggleBWrap"
          >
            <span className="toggleB" id="toggleBBtn">
              + Compare with a second audience
            </span>
          </div>

          {/* Screener A */}
          <div
            className="audiencecard A"
            id="screenerBar"
            style={{
              display: "none",
              marginBottom: "16px",
            }}
          >
            <div className="ahead">
              <strong>Target A</strong>
              <span className="ncount" id="screenerN_A"></span>
            </div>

            <div className="chipset" id="screenerChips_A"></div>

            <div
              style={{
                marginTop: "10px",
                paddingTop: "10px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <label
                className="flabel"
                style={{
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                Base
              </label>

              <div className="triset" id="screenerBaseToggle_A"></div>
            </div>
          </div>

          {/* Screener B */}
          <div
            className="audiencecard B"
            id="screenerBarB"
            style={{
              display: "none",
              marginBottom: "16px",
            }}
          >
            <div className="ahead">
              <strong>Target B</strong>
              <span className="ncount" id="screenerN_B"></span>
            </div>

            <div className="chipset" id="screenerChips_B"></div>

            <div
              style={{
                marginTop: "10px",
                paddingTop: "10px",
                borderTop: "1px solid var(--border)",
              }}
            >
              <label
                className="flabel"
                style={{
                  display: "block",
                  marginBottom: "5px",
                }}
              >
                Base
              </label>

              <div className="triset" id="screenerBaseToggle_B"></div>
            </div>
          </div>

          {/* Toggle Screener B */}
          <div
            style={{
              margin: "-8px 0 16px",
              display: "none",
            }}
            id="screenerToggleBWrap"
          >
            <span className="toggleB" id="screenerToggleBBtn">
              + Compare with a second market or base
            </span>
          </div>

          {/* Module tabs */}
          <div className="moduletabs" id="moduleTabs"></div>

          {/* Main panel */}
          <div className="panel">
            <h3 id="panelTitle"></h3>

            <p className="desc" id="panelDesc"></p>

            <div id="vizArea"></div>

            <div className="footnote" id="panelFootnote"></div>
          </div>

          {/* Drilldown */}
          <div id="drilldownArea"></div>

          {/* Footnote */}
          <p className="footnote">
            Percentages are the share of each audience selecting that item, out
            of everyone in that audience who answered the question (a few
            questions are only asked to a relevant subset, noted where it
            applies). Multi-select items can sum to more than 100%.
          </p>
        </div>
      </div>
    </>
  );
};

export default VietnamToday;