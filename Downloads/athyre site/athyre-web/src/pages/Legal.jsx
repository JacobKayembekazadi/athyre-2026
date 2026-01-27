import React, { useState } from 'react';
import { Calendar, Shield, Eye, Download, Mail, FileText, CheckCircle } from 'lucide-react';

const LegalLayout = ({ title, lastUpdated, sections }) => {
    const [activeSection, setActiveSection] = useState(0);

    return (
        <div className="pt-32 pb-24 px-8 max-w-7xl mx-auto min-h-screen">
            {/* SECTION 1: HEADER */}
            <header className="mb-24 border-b border-stone-100 pb-12">
                <h1 className="text-4xl md:text-5xl font-light tracking-tight uppercase mb-6">{title}</h1>
                <div className="flex items-center gap-2 text-stone-400 text-xs uppercase tracking-widest">
                    <Calendar className="w-4 h-4" />
                    <span>Last Updated: {lastUpdated}</span>
                </div>
            </header>

            {/* SECTION 2: DUAL-COLUMN CONTENT */}
            <div className="grid lg:grid-cols-12 gap-16 mb-24">
                {/* TOC sidebar */}
                <div className="lg:col-span-3 lg:sticky lg:top-32 self-start">
                    <ul className="space-y-4 border-l border-stone-100 pl-4">
                        {sections.map((section, idx) => (
                            <li key={idx}>
                                <button
                                    onClick={() => setActiveSection(idx)}
                                    className={`text-[10px] uppercase tracking-[0.2em] font-bold text-left hover:text-stone-900 transition-colors ${activeSection === idx ? 'text-stone-900' : 'text-stone-400'}`}
                                >
                                    {section.title}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Content Area */}
                <div className="lg:col-span-9 space-y-20">
                    {sections.map((section, idx) => (
                        <div key={idx} className={`scroll-mt-32 transition-opacity duration-500 ${activeSection === idx ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}>
                            <h2 className="text-xl font-serif italic mb-6">{section.title}</h2>
                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="text-[11px] text-stone-500 leading-loose uppercase tracking-wide font-medium">
                                    {section.legalese}
                                </div>
                                <div className="bg-stone-50 p-8 rounded-[2px] border-l-2 border-stone-900">
                                    <span className="text-[9px] uppercase tracking-widest font-black block mb-4 text-stone-400">Plain English</span>
                                    <p className="text-stone-800 text-sm italic font-serif leading-relaxed">
                                        "{section.human}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECTION 3: RIGHTS & ACTIONS */}
            <section className="bg-stone-900 text-white p-12 mb-24 rounded-[2px] flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                    <h3 className="text-[11px] uppercase tracking-widest font-black mb-2">Your Data Rights</h3>
                    <p className="text-stone-400 text-sm">Control how your information is used.</p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-3 border border-stone-700 px-6 py-3 text-[10px] uppercase tracking-widest hover:bg-stone-800 transition-colors">
                        <Download className="w-4 h-4" /> Download Data
                    </button>
                    <button className="flex items-center gap-3 border border-stone-700 px-6 py-3 text-[10px] uppercase tracking-widest hover:bg-stone-800 transition-colors text-red-400 border-red-900/30 hover:bg-red-900/10">
                        <Shield className="w-4 h-4" /> Delete Data
                    </button>
                </div>
            </section>

            {/* SECTION 4: CONTACT DPO */}
            <section className="text-center max-w-xl mx-auto border-t border-stone-100 pt-20">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-8 text-stone-900">
                    <Mail className="w-6 h-6" />
                </div>
                <h2 className="text-[11px] uppercase tracking-[0.6em] text-stone-400 font-black mb-4">Questions?</h2>
                <p className="text-stone-500 text-sm mb-8">Contact our Data Protection Officer directly.</p>
                <a href="mailto:privacy@athyre.com" className="text-xl font-serif italic border-b border-stone-300 pb-1 hover:border-stone-900 transition-colors">privacy@athyre.com</a>
            </section>

        </div>
    );
};

export const Privacy = () => (
    <LegalLayout
        title="Privacy Policy"
        lastUpdated="October 24, 2024"
        sections={[
            { title: "Data Collection", legalese: "We collect personal data including IP address, cookie identifiers, and email addresses provided voluntarily via forms.", human: "We only see what you give us or what your browser shares automatically." },
            { title: "Use of Information", legalese: "Data is utilized to personalize the user experience, process transactions, and send periodic emails regarding updates.", human: "We use it to send you your order and tell you about cool new drops." },
            { title: "Third Parties", legalese: "We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information.", human: "We don't sell your data. Ever." }
        ]}
    />
);

export const Terms = () => (
    <LegalLayout
        title="Terms of Service"
        lastUpdated="October 24, 2024"
        sections={[
            { title: "Acceptance of Terms", legalese: "By accessing this web site, you are agreeing to be bound by these web site Terms and Conditions of Use.", human: "Using the site means you agree to play by the rules." },
            { title: "Stewardship", legalese: "Users agree to maintain respectful conduct within community areas and reviews.", human: "Be kind. Don't be a jerk in the comments." },
            { title: "Liability", legalese: "Athyre Global shall not be held liable for any damages arising out of the use or inability to use the materials.", human: "We do our best, but we aren't responsible if the internet breaks." }
        ]}
    />
);

export const Accessibility = () => (
    <LegalLayout
        title="Accessibility"
        lastUpdated="October 24, 2024"
        sections={[
            { title: "Our Commitment", legalese: "Athyre is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience.", human: "We want everyone to be able to use this site, regardless of ability." },
            { title: "Standards", legalese: "We apply the relevant accessibility standards, including WCAG 2.1 Level AA.", human: "We follow the official rules to make the web easier to see and use." },
            { title: "Feedback", legalese: "We welcome your feedback on the accessibility of Athyre Global. Please let us know if you encounter accessibility barriers.", human: "Did we miss something? Tell us so we can fix it." }
        ]}
    />
);
