import React from "https://esm.sh/react@18";
import { createRoot } from "https://esm.sh/react-dom@18/client";
import htm from "https://esm.sh/htm@3.1.1";

const html = htm.bind(React.createElement);

// Miles app URL — same origin in production, localhost:3000 in local dev
const MILES_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? `http://${window.location.hostname}:3000`
        : "/";

// Innovation Lab is hosted at /lab on the same origin
const LAB_URL =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? `http://${window.location.hostname}:3000/lab`
        : "/lab";

const pipelineSteps = [
    {
        number: "01.",
        title: "Ideate",
        heading: "Capture sparks",
        copy:
            "Initial ideas can come from unexpected places. Facilitated jam sessions, makers in our ecosystem, innovators & creatives solving big problems in a novel way. Only ideas that match our F*** Yeah Index criteria (yes, that's real) make the cut.",
        colorClass: "dots-orange",
        accentClass: "cg-orange"
    },
    {
        number: "02.",
        title: "Validate",
        heading: "Test Feasibility + Demand",
        copy:
            "Cool ideas are one thing, but can the concept really work? Does it deserve to be a standalone company? To get through this stage gate, we must validate demand, feasibility, profitability, risk, talent needs, and investor returns.",
        colorClass: "dots-green",
        accentClass: "cg-green"
    },
    {
        number: "03.",
        title: "Build",
        heading: "Assemble + Refine",
        copy:
            "Supported by doers, designers, makers, and sellers, the laboratory brings a validated product to life. Financial modeling, competitive analysis, go-to-market strategy, talent recruitment. Assembling the key ingredients in record time. Makers in our ecosystem, innovators & creatives, are solving big problems in a novel way. Only ideas that match our F*** Yeah Index criteria (yes, that's real) make the cut.",
        colorClass: "dots-yellow",
        accentClass: "cg-yellow"
    },
    {
        number: "04.",
        title: "Launch",
        heading: "Blast Off",
        copy:
            "Human ingenuity meets investor capital to launch a newborn enterprise. Fully supported by our select group of experienced Advisors and Board Members to turbo-charge growth.",
        colorClass: "dots-purple",
        accentClass: "cg-purple",
        icon: "triple"
    },
    {
        number: "05.",
        title: "Scale",
        heading: "Escape Velocity",
        copy:
            "Our ecosystem of trusted partners, capital, client access, mentors, and service providers helps founders scale beyond their organic capacity to accelerate and expand outcomes at each stage of growth and eventually through liquidity.",
        icon: "yin-yang"
    }
];

const footerRows = [
    [
        { title: "Let's Connect.", value: "LinkedIn", href: "https://www.linkedin.com/company/mudit%C4%81vp/" },
        { title: "Detroit", value: "detroit@muditavp.com", href: "mailto:detroit@muditavp.com" },
        { title: "Ann Arbor", value: "a2@muditavp.com", href: "mailto:a2@muditavp.com" },
        { title: "Chicago", value: "chicago@muditavp.com", href: "mailto:chicago@muditavp.com" },
        { title: "Las Vegas", value: "vegas@muditavp.com", href: "mailto:vegas@muditavp.com" },
        { title: "San Francisco", value: "sfo@muditavp.com", href: "mailto:sfo@muditavp.com" }
    ],
    [
        { title: "Current Investors.", value: "LP Login", href: "https://apps.intralinks.com/InvestorVision" },
        { title: "Pitch Us.", value: "pitch@muditavp.com", href: "mailto:pitch@muditavp.com" },
        { title: "Invest With Us.", value: "invest@muditavp.com", href: "mailto:invest@muditavp.com" },
        { title: "Jam With Us.", value: "ideas@muditavp.com", href: "mailto:ideas@muditavp.com" },
        { title: "Work With Us.", value: "jobs@muditavp.com", href: "mailto:jobs@muditavp.com" },
        { title: "Feature Us.", value: "media@muditavp.com", href: "mailto:media@muditavp.com" }
    ]
];

const PipelineStep = ({ step }) => {
    const iconClass =
        step.icon === "yin-yang"
            ? "pipeline-icon-yinyang"
            : step.icon === "triple"
                ? "pipeline-icon-triple"
                : `pipeline-dots ${step.colorClass}`;
    return html`
        <article className="pipeline-item">
            <div className=${iconClass} aria-hidden="true"></div>
            <div className="pipeline-text">
                <p className="pipeline-kicker">
                    <span className=${step.accentClass}>${step.number}</span> ${step.title}
                </p>
                <h3>${step.heading}</h3>
                <p className="pipeline-copy">${step.copy}</p>
            </div>
        </article>
    `;
};

const FooterRow = ({ items }) => html`
    <div className="container footer-row">
        ${items.map(
            (item) => html`
                <div className="footer-col">
                    <h5>${item.title}</h5>
                    <a href=${item.href}>${item.value}</a>
                </div>
            `
        )}
    </div>
`;

const App = () => {
    const [open, setOpen] = React.useState(false);

    return html`
        <div>
            <header className="nav">
                <div className="nav-inner">
                    <a className="nav-logo" href="https://muditavp.com/" aria-label="Mudita Venture Partners">
                        <img
                            src="https://muditavp.com/wp-content/uploads/2024/01/MUDITA-Logo-White.png"
                            alt="Mudita Venture Partners"
                            width="190"
                            height="70"
                            decoding="async"
                        />
                    </a>
                    <button
                        className="nav-toggle"
                        type="button"
                        aria-controls="navLinks"
                        aria-expanded=${open}
                        onClick=${() => setOpen(!open)}
                    >
                        Menu
                    </button>
                    <ul
                        className=${`nav-links cg-upper ${open ? "active" : ""}`}
                        id="navLinks"
                        onClick=${(event) => {
                            if (event.target.closest("a")) {
                                setOpen(false);
                            }
                        }}
                    >
                        <li><a href="https://muditavp.com/portfolio/">Portfolio</a></li>
                        <li><a href="https://muditavp.com/about/">About</a></li>
                        <li><a href="https://muditavp.com/how-we-work/">How We Work</a></li>
                        <li><a href="https://muditavp.com/who-we-back/">Who We Back</a></li>
                        <li><a href="https://muditavp.com/studios/" className="active">Studios</a></li>
                        <li><a href="https://careers.muditavp.com">Careers</a></li>
                        <li><a href="https://muditavp.com/connect/">Connect</a></li>
                        <li><a href=${LAB_URL} className="lab-nav-link">2026 Cohort</a></li>
                        <li><a href=${MILES_URL} className="miles-nav-link" target="_blank" rel="noopener noreferrer">Miles ✦</a></li>
                    </ul>
                </div>
            </header>

            <main>
                <section className="hero">
                    <div className="container hero-content">
                        <div>
                            <h1>Full-Throttle <span className="cg-green">Innovation.</span></h1>
                            <p className="cg-body">Mudita Studios is an advanced innovation factory and start-up studio, <strong>inventing and developing backable ideas that change the world.</strong></p>
                            <a className="btn" href="https://muditavp.com/connect/">
                                <span>HAVE AN IDEA? CONNECT WITH US</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </a>
                        </div>
                        <div className="hero-profile">
                            <img src="https://muditavp.com/wp-content/uploads/2024/02/bitewell.png" alt="Bitewell" width="140" height="40" decoding="async" />
                            <p><strong>Jeremy Ballard</strong><br />Head of Technology</p>
                        </div>
                    </div>
                </section>

                <section className="section section-dark">
                    <div className="container dreaming-intro">
                        <p className="cg-huge">From <span className="cg-yellow">dreaming...</span></p>
                    </div>
                    <div className="container dreaming-grid">
                        <div className="spotlight">
                            <div className="spotlight-frame">
                                <img src="https://muditavp.com/wp-content/uploads/2024/02/Photo-1.jpg" alt="Markell Dehaney" loading="lazy" decoding="async" />
                                <div className="spotlight-badge badge-left badge-orange">
                                    <img src="https://muditavp.com/wp-content/uploads/2024/02/risekit.png" alt="RiseKit" width="90" height="28" loading="lazy" decoding="async" />
                                    <div>
                                        <strong>Markell Dehaney</strong>
                                        <span>Full Stack Software Engineer</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="doing-copy">
                            <p className="cg-massive">...to doing</p>
                            <p className="cg-med">Every breakthrough starts with a <span className="cg-orange">spark.</span></p>
                        </div>
                    </div>
                </section>

                <section className="section section-light">
                    <div className="container split">
                        <div>
                            <p>From refining raw ideas to advanced prototyping, market testing to financial modeling, Mudita Studios fuses creativity with rigor to</p>
                            <p className="cg-lg">invent and launch the <span className="cg-purple">next generation</span><br />of transformative companies.</p>
                            <p>Innovating on behalf of Mudita Venture Partners, other venture firms, and corporate clients alike, our team of proven experts discover bold new opportunities, accelerate time to market, and boost the probability of success.</p>
                        </div>
                        <div className="spotlight spotlight-right">
                            <div className="spotlight-frame">
                                <img src="https://muditavp.com/wp-content/uploads/2024/02/Photo-2.jpg" alt="Diane Gaerlan" loading="lazy" decoding="async" />
                                <div className="spotlight-badge badge-right badge-yellow">
                                    <img src="https://muditavp.com/wp-content/uploads/2024/01/Screencastify.png" alt="Screencastify" width="110" height="24" loading="lazy" decoding="async" />
                                    <div>
                                        <strong>Diane Gaerlan</strong>
                                        <span>Vice President</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="section ninety-nine-section">
                    <div className="ninety-nine-layout">
                        <div className="ninety-nine-block">
                            <p className="ninety-nine-value">99%</p>
                            <p className="ninety-nine-title">
                                of our ideas don't<br />make the
                            </p>
                        </div>
                        <div className="ninety-nine-body">
                            <p className="ninety-nine-heading">This ensures that the ones that launch have the highest chance to thrive.</p>
                            <p><strong>As raw ideas are forged into fundable businesses,</strong> we bring a comprehensive mix of talent and services, including product design, customer acquisition, leadership development, sales strategy, go-to-market, finance, and talent acquisition.</p>
                        </div>
                    </div>
                </section>

                <section className="section section-dark">
                    <div className="container simply-put">
                        <div className="spotlight">
                            <div className="spotlight-frame">
                                <img src="https://muditavp.com/wp-content/uploads/2024/02/Photo-3.jpg" alt="Nina Spahn" loading="lazy" decoding="async" />
                                <div className="spotlight-badge badge-left badge-orange badge-top">
                                    <img src="https://muditavp.com/wp-content/uploads/2024/01/amplify.png" alt="Amplify Publishing Group" width="90" height="24" loading="lazy" decoding="async" />
                                    <div>
                                        <strong>Nina Spahn</strong>
                                        <span>VP, Production</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <p className="cg-med bold-text">Simply put...</p>
                            <p className="cg-lg">we invent, develop, launch, and scale...</p>
                            <p className="cg-massive cg-purple">Faster</p>
                        </div>
                    </div>
                </section>

                <section className="pipeline">
                    <div className="container pipeline-list">
                        ${pipelineSteps.map((step) => html`<${PipelineStep} step=${step} />`)}
                    </div>
                </section>

                <section className="cta" id="contact">
                    <div className="container cta-grid">
                        <div>
                            <p className="cg-huge">Let's Make<br />the World Better...</p>
                            <p className="cg-massive cg-green cta-together">TOGETHER</p>
                        </div>
                        <div className="cta-action">
                            <a className="btn" href="https://muditavp.com/connect/">
                                <span>Contact Us</span>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="footer">
                ${footerRows.map((row) => html`<${FooterRow} items=${row} />`)}
                <div className="container footer-bottom">
                    <div className="footer-logo">
                        <img src="https://muditavp.com/wp-content/uploads/2024/01/MUDITA-Logo-White.png" alt="Mudita Venture Partners" width="160" height="48" loading="lazy" decoding="async" />
                    </div>
                    <div>
                        <a href="https://muditavp.com/privacy-policy">Privacy Policy</a> | <a href="https://muditavp.com/privacy-policy-copy/">Legal Disclaimer</a> | 
                        &copy; 2026 Mudita Venture Partners. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    `;
};

const root = createRoot(document.getElementById("root"));
root.render(html`<${App} />`);
