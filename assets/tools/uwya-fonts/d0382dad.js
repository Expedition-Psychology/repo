/* @ds-bundle: {"format":3,"namespace":"ExpeditionPsychologyDesignSystem_4e7d0e","components":[{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Eyebrow","sourcePath":"components/core/Eyebrow.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"Stat","sourcePath":"components/core/Stat.jsx"}],"sourceHashes":{"components/core/Badge.jsx":"735f4b650752","components/core/Button.jsx":"5f7d762e7e38","components/core/Card.jsx":"e4379e7fe8e4","components/core/Eyebrow.jsx":"96aa8756ab69","components/core/Input.jsx":"b87018e156dc","components/core/Logo.jsx":"67196afe7528","components/core/Stat.jsx":"ed3055658f4d","ui_kits/website/Approach.jsx":"48a9dd50314a","ui_kits/website/Contact.jsx":"1e6acb3b397a","ui_kits/website/Hero.jsx":"cc51767785da","ui_kits/website/Insights.jsx":"7a6cffcad050","ui_kits/website/Proof.jsx":"c82062c2685c","ui_kits/website/Services.jsx":"4f6dbc89a40b","ui_kits/website/SiteHeader.jsx":"b15e5159223b"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ExpeditionPsychologyDesignSystem_4e7d0e = window.ExpeditionPsychologyDesignSystem_4e7d0e || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Expedition Psychology — Badge
 * Small status / signal pill. Maps to the signal palette.
 */
function Badge({
  children,
  tone = 'neutral',
  subtle = true,
  style = {},
  ...rest
}) {
  const tones = {
    neutral: {
      solid: 'var(--ep-neutral-700)',
      tint: 'var(--ep-neutral-200)',
      tintText: 'var(--ep-neutral-700)'
    },
    brand: {
      solid: 'var(--ep-plum)',
      tint: 'var(--ep-plum-tint)',
      tintText: 'var(--ep-plum-700)'
    },
    accent: {
      solid: 'var(--ep-pine)',
      tint: 'var(--ep-pine-tint)',
      tintText: 'var(--ep-pine-700)'
    },
    danger: {
      solid: 'var(--ep-clay)',
      tint: '#f0dcd9',
      tintText: '#8f3a33'
    },
    warning: {
      solid: 'var(--ep-ember)',
      tint: '#f3e1d3',
      tintText: '#9a5630'
    },
    caution: {
      solid: 'var(--ep-sand)',
      tint: '#f3ebd4',
      tintText: '#8a7333'
    },
    success: {
      solid: 'var(--ep-sage)',
      tint: '#dce8e0',
      tintText: '#436051'
    }
  };
  const t = tones[tone] || tones.neutral;
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 11px',
    fontFamily: 'var(--font-heading)',
    fontWeight: 500,
    fontSize: '12px',
    letterSpacing: '0.02em',
    lineHeight: 1.4,
    borderRadius: 'var(--radius-pill)',
    whiteSpace: 'nowrap'
  };
  const skin = subtle ? {
    background: t.tint,
    color: t.tintText
  } : {
    background: t.solid,
    color: 'var(--ep-paper)'
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    className: `ep-badge ep-badge--${tone}`,
    style: {
      ...base,
      ...skin,
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Expedition Psychology — Button
 * Calm, confident CTA. Pine accent by default; Plum for primary brand moments.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  iconLeft = null,
  iconRight = null,
  fullWidth = false,
  disabled = false,
  as = 'button',
  style = {},
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '8px 16px',
      fontSize: '14px',
      gap: '7px',
      radius: 'var(--radius-sm)'
    },
    md: {
      padding: '12px 22px',
      fontSize: '15px',
      gap: '9px',
      radius: 'var(--radius-md)'
    },
    lg: {
      padding: '16px 30px',
      fontSize: '17px',
      gap: '10px',
      radius: 'var(--radius-md)'
    }
  };
  const s = sizes[size] || sizes.md;
  const base = {
    display: fullWidth ? 'flex' : 'inline-flex',
    width: fullWidth ? '100%' : 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    padding: s.padding,
    fontFamily: 'var(--font-heading)',
    fontWeight: 500,
    fontSize: s.fontSize,
    letterSpacing: '0.005em',
    lineHeight: 1,
    borderRadius: s.radius,
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)',
    textDecoration: 'none',
    whiteSpace: 'nowrap'
  };
  const variants = {
    primary: {
      background: 'var(--ep-plum)',
      color: 'var(--ep-paper)',
      borderColor: 'var(--ep-plum)'
    },
    accent: {
      background: 'var(--ep-pine)',
      color: 'var(--ep-paper)',
      borderColor: 'var(--ep-pine)'
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text-strong)',
      borderColor: 'var(--border-strong)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-link)',
      borderColor: 'transparent'
    },
    inverse: {
      background: 'var(--ep-paper)',
      color: 'var(--ep-ink)',
      borderColor: 'var(--ep-paper)'
    }
  };
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: `ep-btn ep-btn--${variant}`,
    disabled: as === 'button' ? disabled : undefined,
    style: {
      ...base,
      ...variants[variant],
      ...style
    }
  }, rest), iconLeft, children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Expedition Psychology — Card
 * Raised paper surface with hairline border and soft shadow.
 */
function Card({
  children,
  as = 'div',
  elevation = 'sm',
  padding = 'lg',
  interactive = false,
  accent = null,
  style = {},
  ...rest
}) {
  const shadows = {
    flat: 'none',
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)'
  };
  const pads = {
    none: '0',
    sm: 'var(--space-4)',
    md: 'var(--space-5)',
    lg: 'var(--space-6)'
  };
  const base = {
    background: 'var(--surface-raised)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-lg)',
    padding: pads[padding] ?? pads.lg,
    boxShadow: shadows[elevation] ?? shadows.sm,
    transition: 'box-shadow var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out)',
    ...(accent ? {
      borderTop: `3px solid ${accent}`
    } : null)
  };
  const Tag = as;
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: "ep-card",
    style: {
      ...base,
      ...style
    },
    "data-interactive": interactive ? '' : undefined
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Expedition Psychology — Eyebrow
 * Overline label: wide-tracked caps in Pine. Sits above headings.
 */
function Eyebrow({
  children,
  color = 'var(--accent)',
  withRule = false,
  style = {},
  ...rest
}) {
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: 'var(--font-heading)',
    fontWeight: 500,
    fontSize: '12px',
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color,
    margin: 0
  };
  return /*#__PURE__*/React.createElement("span", _extends({
    className: "ep-eyebrow",
    style: {
      ...base,
      ...style
    }
  }, rest), withRule && /*#__PURE__*/React.createElement("span", {
    style: {
      width: '26px',
      height: '1.5px',
      background: color,
      display: 'inline-block'
    }
  }), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Expedition Psychology — Input
 * Text field with optional label and helper text. Pine focus ring.
 */
function Input({
  label = null,
  helper = null,
  error = null,
  id,
  type = 'text',
  textarea = false,
  rows = 4,
  style = {},
  ...rest
}) {
  const fieldId = id || `ep-field-${Math.random().toString(36).slice(2, 8)}`;
  const [focused, setFocused] = React.useState(false);
  const fieldStyle = {
    width: '100%',
    fontFamily: 'var(--font-body)',
    fontWeight: 400,
    fontSize: '15px',
    color: 'var(--text-strong)',
    background: 'var(--surface-raised)',
    border: `1px solid ${error ? 'var(--ep-clay)' : focused ? 'var(--ep-pine)' : 'var(--border-default)'}`,
    borderRadius: 'var(--radius-md)',
    padding: textarea ? '12px 14px' : '11px 14px',
    boxShadow: focused ? 'var(--shadow-focus)' : 'none',
    outline: 'none',
    transition: 'border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
    resize: textarea ? 'vertical' : undefined,
    boxSizing: 'border-box',
    ...style
  };
  const onFocus = () => setFocused(true);
  const onBlur = () => setFocused(false);
  return /*#__PURE__*/React.createElement("div", {
    className: "ep-field",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '7px'
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: fieldId,
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 500,
      fontSize: '13px',
      letterSpacing: '0.01em',
      color: 'var(--text-strong)'
    }
  }, label), textarea ? /*#__PURE__*/React.createElement("textarea", _extends({
    id: fieldId,
    rows: rows,
    style: fieldStyle,
    onFocus: onFocus,
    onBlur: onBlur
  }, rest)) : /*#__PURE__*/React.createElement("input", _extends({
    id: fieldId,
    type: type,
    style: fieldStyle,
    onFocus: onFocus,
    onBlur: onBlur
  }, rest)), (helper || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: '12.5px',
      color: error ? 'var(--ep-clay)' : 'var(--text-muted)'
    }
  }, error || helper));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Expedition Psychology — Logo
 * Renders the official logo artwork. Pass `assetBase` to point at the
 * folder holding the PNGs (default 'assets').
 */
function Logo({
  variant = 'wordmark',
  color = 'black',
  assetBase = 'assets',
  height,
  style = {},
  ...rest
}) {
  const suffix = variant === 'wordmark' ? '-trimmed' : '';
  const file = `${assetBase}/logo-${variant}-${color}${suffix}.png`;
  const defaultH = variant === 'symbol' ? 40 : 30;
  return /*#__PURE__*/React.createElement("img", _extends({
    className: `ep-logo ep-logo--${variant}`,
    src: file,
    alt: "Expedition Psychology",
    style: {
      height: (height ?? defaultH) + 'px',
      width: 'auto',
      display: 'block',
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Stat.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Expedition Psychology — Stat
 * A large figure with label — for outcomes, credentials, impact.
 */
function Stat({
  value,
  label,
  sub = null,
  color = 'var(--ep-plum)',
  align = 'left',
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    className: "ep-stat",
    style: {
      textAlign: align,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 600,
      fontSize: 'clamp(2.2rem, 4vw, 3.25rem)',
      lineHeight: 1,
      letterSpacing: '-0.02em',
      color
    }
  }, value), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 500,
      fontSize: '14px',
      letterSpacing: '0.01em',
      color: 'var(--text-strong)',
      marginTop: '10px'
    }
  }, label), sub && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 300,
      fontSize: '13px',
      color: 'var(--text-muted)',
      marginTop: '4px',
      lineHeight: 1.5
    }
  }, sub));
}
Object.assign(__ds_scope, { Stat });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Stat.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Approach.jsx
try { (() => {
// Expedition Psychology — Approach (numbered method)
const {
  Eyebrow,
  Badge
} = window.ExpeditionPsychologyDesignSystem_4e7d0e;
const STEPS = [{
  n: '01',
  title: 'Assess',
  body: 'We start in your environment — understanding the pressures, the people, and what performance really demands of them.',
  tone: 'danger'
}, {
  n: '02',
  title: 'Equip',
  body: 'We translate evidence-based psychology into a small set of practical, field-ready tools your team can actually use.',
  tone: 'warning'
}, {
  n: '03',
  title: 'Embed',
  body: 'We rehearse those skills under realistic conditions, so they hold when uncertainty and consequence are highest.',
  tone: 'caution'
}, {
  n: '04',
  title: 'Sustain',
  body: 'We build in recovery and review, helping people stay effective over the long arc of demanding work.',
  tone: 'success'
}];
function Approach({
  innerRef
}) {
  return /*#__PURE__*/React.createElement("section", {
    id: "approach",
    ref: innerRef,
    style: {
      background: 'var(--ep-neutral-50)',
      borderTop: '1px solid var(--border-subtle)',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-xl)',
      margin: '0 auto',
      padding: 'var(--space-11) 32px',
      display: 'grid',
      gridTemplateColumns: 'minmax(260px, 360px) 1fr',
      gap: 'var(--space-9)',
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'sticky',
      top: 100
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    withRule: true
  }, "Our approach"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '16px 0 14px'
    }
  }, "A clear method, tested in the real world."), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: '16px',
      color: 'var(--text-body)'
    }
  }, "No jargon, no theory for its own sake \u2014 just a practical sequence that bridges academic psychology and operational performance.")), /*#__PURE__*/React.createElement("ol", {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, STEPS.map((s, i) => /*#__PURE__*/React.createElement("li", {
    key: s.n,
    style: {
      display: 'grid',
      gridTemplateColumns: '72px 1fr',
      gap: '24px',
      padding: '28px 0',
      borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 600,
      fontSize: '34px',
      color: 'var(--ep-neutral-300)',
      lineHeight: 1,
      letterSpacing: '-0.02em'
    }
  }, s.n), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px'
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontSize: '23px'
    }
  }, s.title), /*#__PURE__*/React.createElement(Badge, {
    tone: s.tone
  }, s.tone === 'danger' ? 'Field' : s.tone === 'success' ? 'Ongoing' : 'Build')), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '16px',
      color: 'var(--text-body)',
      maxWidth: 560
    }
  }, s.body)))))));
}
window.Approach = Approach;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Approach.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Contact.jsx
try { (() => {
// Expedition Psychology — Contact CTA with working form
const {
  Input,
  Button,
  Eyebrow,
  Logo
} = window.ExpeditionPsychologyDesignSystem_4e7d0e;
function Contact({
  innerRef
}) {
  const [sent, setSent] = React.useState(false);
  const [name, setName] = React.useState('');
  return /*#__PURE__*/React.createElement("section", {
    id: "contact",
    ref: innerRef,
    style: {
      background: 'var(--ep-ink)',
      color: 'var(--ep-paper)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-lg)',
      margin: '0 auto',
      padding: 'var(--space-11) 32px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 'var(--space-9)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, {
    withRule: true,
    color: "var(--ep-sage)"
  }, "Work with us"), /*#__PURE__*/React.createElement("h2", {
    style: {
      color: 'var(--ep-paper)',
      margin: '18px 0 16px'
    }
  }, "Let's prepare your people for what's ahead."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgba(243,243,240,0.76)',
      fontWeight: 300,
      fontSize: '17px',
      maxWidth: 440
    }
  }, "Tell us about your team and the environment you operate in. We'll come back within two working days with a practical way forward.")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-raised)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-7)',
      boxShadow: 'var(--shadow-lg)'
    }
  }, sent ? /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '24px 8px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 56,
      height: 56,
      borderRadius: '999px',
      background: 'var(--ep-pine-tint)',
      color: 'var(--ep-pine-700)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": "check",
    style: {
      width: 28,
      height: 28
    }
  })), /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: '0 0 8px'
    }
  }, "Thank you", name ? `, ${name.split(' ')[0]}` : '', "."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--text-body)',
      fontSize: 15
    }
  }, "Your message is on its way. We'll be in touch shortly.")) : /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      setSent(true);
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 18
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Full name",
    placeholder: "Your name",
    value: name,
    onChange: e => setName(e.target.value),
    required: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "Work email",
    type: "email",
    placeholder: "you@organisation.org",
    required: true
  }), /*#__PURE__*/React.createElement(Input, {
    label: "How can we help?",
    textarea: true,
    rows: 4,
    placeholder: "A little about your team and environment\u2026"
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "accent",
    size: "lg",
    fullWidth: true,
    as: "button",
    type: "submit"
  }, "Send enquiry")))));
}
function SiteFooter() {
  const cols = [{
    h: 'Services',
    items: ['Consultancy', 'Workshops', 'Keynotes', 'Online learning']
  }, {
    h: 'Company',
    items: ['About', 'Approach', 'Insights', 'Contact']
  }, {
    h: 'Sectors',
    items: ['Expedition', 'Rescue', 'Healthcare', 'Leadership']
  }];
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      background: 'var(--ep-paper)',
      borderTop: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-xl)',
      margin: '0 auto',
      padding: 'var(--space-9) 32px var(--space-7)',
      display: 'grid',
      gridTemplateColumns: '1.6fr repeat(3, 1fr)',
      gap: 'var(--space-7)'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Logo, {
    variant: "wordmark",
    color: "black",
    height: 30,
    assetBase: "../../assets"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      marginTop: 18,
      fontSize: 14.5,
      color: 'var(--text-muted)',
      maxWidth: 300,
      fontWeight: 300
    }
  }, "Helping people think clearly, adapt effectively, and thrive in the environments that demand the most.")), cols.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.h
  }, /*#__PURE__*/React.createElement("h6", {
    style: {
      margin: '0 0 14px'
    }
  }, c.h), /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: 'none',
      margin: 0,
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, c.items.map(it => /*#__PURE__*/React.createElement("li", {
    key: it
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    onClick: e => e.preventDefault(),
    style: {
      fontSize: 14.5,
      color: 'var(--text-body)',
      fontWeight: 300
    }
  }, it))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-xl)',
      margin: '0 auto',
      padding: '20px 32px',
      borderTop: '1px solid var(--border-subtle)',
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "\xA9 2026 Expedition Psychology. All rights reserved."), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, "Privacy \xB7 Terms")));
}
window.Contact = Contact;
window.SiteFooter = SiteFooter;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Contact.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Hero.jsx
try { (() => {
// Expedition Psychology — Hero
const {
  Button,
  Eyebrow
} = window.ExpeditionPsychologyDesignSystem_4e7d0e;
function Hero({
  onNav
}) {
  return /*#__PURE__*/React.createElement("section", {
    id: "top",
    style: {
      position: 'relative',
      overflow: 'hidden',
      background: 'var(--ep-ink)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/logo-symbol-white.png",
    alt: "",
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      right: '-7%',
      top: '50%',
      transform: 'translateY(-50%)',
      height: '128%',
      width: 'auto',
      opacity: 0.05,
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-xl)',
      margin: '0 auto',
      padding: '128px 32px 120px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    withRule: true,
    color: "var(--ep-sage)"
  }, "Performance psychology for demanding environments"), /*#__PURE__*/React.createElement("h1", {
    style: {
      color: 'var(--ep-paper)',
      fontSize: 'clamp(2.6rem, 5.4vw, 4.25rem)',
      lineHeight: 1.04,
      margin: '22px 0 0',
      letterSpacing: '-0.025em'
    }
  }, "Think clearly. Adapt effectively. Thrive under pressure."), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'rgba(243,243,240,0.78)',
      fontSize: 'clamp(1.05rem, 1.6vw, 1.3rem)',
      fontWeight: 300,
      lineHeight: 1.6,
      margin: '26px 0 0',
      maxWidth: 620
    }
  }, "Evidence-based psychological training for the teams and individuals who operate where uncertainty, pressure, and consequence are part of the landscape."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: '14px',
      marginTop: '38px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "inverse",
    size: "lg",
    onClick: () => onNav('contact')
  }, "Book a workshop"), /*#__PURE__*/React.createElement(Button, {
    variant: "ghost",
    size: "lg",
    onClick: () => onNav('approach'),
    style: {
      color: 'var(--ep-paper)'
    }
  }, "See our approach")))));
}
window.Hero = Hero;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Hero.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Insights.jsx
try { (() => {
// Expedition Psychology — Insights (article teasers)
const {
  Card,
  Eyebrow,
  Badge
} = window.ExpeditionPsychologyDesignSystem_4e7d0e;
const POSTS = [{
  tag: 'Resilience',
  read: '6 min',
  title: 'What recovery really means under sustained pressure',
  accent: 'var(--ep-sage)'
}, {
  tag: 'Decision-making',
  read: '8 min',
  title: 'Making good calls when the information is incomplete',
  accent: 'var(--ep-ember)'
}, {
  tag: 'Leadership',
  read: '5 min',
  title: 'Holding a team together when conditions turn',
  accent: 'var(--ep-plum)'
}];
function Insights({
  innerRef
}) {
  return /*#__PURE__*/React.createElement("section", {
    id: "insights",
    ref: innerRef,
    style: {
      background: 'var(--ep-paper)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-xl)',
      margin: '0 auto',
      padding: 'var(--space-11) 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 24,
      marginBottom: 'var(--space-8)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 560
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    withRule: true
  }, "Insights"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '16px 0 0'
    }
  }, "Practical thinking from the field.")), /*#__PURE__*/React.createElement("a", {
    href: "#insights",
    onClick: e => e.preventDefault(),
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 500,
      fontSize: '15px',
      color: 'var(--ep-pine-700)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8
    }
  }, "All insights ", /*#__PURE__*/React.createElement("i", {
    "data-lucide": "arrow-right",
    style: {
      width: 17,
      height: 17
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: 'var(--space-5)'
    }
  }, POSTS.map(p => /*#__PURE__*/React.createElement(Card, {
    key: p.title,
    elevation: "sm",
    interactive: true,
    padding: "none",
    accent: p.accent,
    style: {
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-5) var(--space-5) var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 16
    }
  }, /*#__PURE__*/React.createElement(Badge, {
    tone: "accent"
  }, p.tag), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 13,
      color: 'var(--text-muted)'
    }
  }, p.read, " read")), /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontSize: '20px',
      lineHeight: 1.25
    }
  }, p.title), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 20,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 7,
      fontFamily: 'var(--font-heading)',
      fontWeight: 500,
      fontSize: 14,
      color: 'var(--ep-pine-700)'
    }
  }, "Read article ", /*#__PURE__*/React.createElement("i", {
    "data-lucide": "arrow-up-right",
    style: {
      width: 16,
      height: 16
    }
  }))))))));
}
window.Insights = Insights;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Insights.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Proof.jsx
try { (() => {
// Expedition Psychology — Proof: stats + testimonial
const {
  Stat,
  Eyebrow
} = window.ExpeditionPsychologyDesignSystem_4e7d0e;
function Proof({
  innerRef
}) {
  return /*#__PURE__*/React.createElement("section", {
    id: "about",
    ref: innerRef,
    style: {
      background: 'var(--ep-plum)',
      color: 'var(--ep-paper)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-xl)',
      margin: '0 auto',
      padding: 'var(--space-11) 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      gap: 'var(--space-7)',
      paddingBottom: 'var(--space-9)',
      borderBottom: '1px solid rgba(243,243,240,0.18)'
    }
  }, /*#__PURE__*/React.createElement(Stat, {
    value: "15+",
    label: "Years in the field",
    sub: "Expedition, rescue & clinical",
    color: "var(--ep-paper)"
  }), /*#__PURE__*/React.createElement(Stat, {
    value: "40+",
    label: "Organisations trained",
    sub: "Across high-consequence sectors",
    color: "var(--ep-paper)"
  }), /*#__PURE__*/React.createElement(Stat, {
    value: "98%",
    label: "Would recommend",
    sub: "Post-programme feedback",
    color: "var(--ep-paper)"
  }), /*#__PURE__*/React.createElement(Stat, {
    value: "100%",
    label: "Evidence-based",
    sub: "Grounded in current research",
    color: "var(--ep-paper)"
  })), /*#__PURE__*/React.createElement("figure", {
    style: {
      margin: 'var(--space-9) 0 0',
      maxWidth: 900
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    color: "var(--ep-sage)"
  }, "In their words"), /*#__PURE__*/React.createElement("blockquote", {
    style: {
      margin: '20px 0 0',
      fontFamily: 'var(--font-heading)',
      fontWeight: 500,
      fontSize: 'clamp(1.4rem, 2.6vw, 2.1rem)',
      lineHeight: 1.32,
      letterSpacing: '-0.015em',
      color: 'var(--ep-paper)'
    }
  }, "\u201CThey gave our team a shared language for pressure \u2014 and the tools to use it when conditions were at their worst. Practical, credible, and genuinely human.\u201D"), /*#__PURE__*/React.createElement("figcaption", {
    style: {
      marginTop: '22px',
      fontSize: '15px',
      color: 'rgba(243,243,240,0.72)'
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ep-paper)',
      fontWeight: 600
    }
  }, "Operations Lead"), " \xB7 Mountain Rescue Team"))));
}
window.Proof = Proof;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Proof.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/Services.jsx
try { (() => {
// Expedition Psychology — Services grid
const {
  Card,
  Eyebrow
} = window.ExpeditionPsychologyDesignSystem_4e7d0e;
const SERVICES = [{
  icon: 'compass',
  title: 'Consultancy',
  body: 'Embedded psychological support for organisations operating in high-consequence environments.'
}, {
  icon: 'users',
  title: 'Workshops',
  body: 'Hands-on training in resilience, decision-making, and team dynamics — built for the field.'
}, {
  icon: 'mic',
  title: 'Keynote presentations',
  body: 'Compelling, evidence-led talks that translate the science of performance into practice.'
}, {
  icon: 'graduation-cap',
  title: 'Online learning',
  body: 'Self-paced courses that build practical psychological skills, wherever you are based.'
}, {
  icon: 'mountain-snow',
  title: 'Expedition support',
  body: 'Pre-departure preparation and in-field guidance for teams heading into the unknown.'
}, {
  icon: 'heart-pulse',
  title: 'Recovery & wellbeing',
  body: 'Structured recovery and aftercare to sustain people through demanding deployments.'
}];
function Services({
  innerRef
}) {
  return /*#__PURE__*/React.createElement("section", {
    id: "services",
    ref: innerRef,
    style: {
      background: 'var(--ep-paper)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-xl)',
      margin: '0 auto',
      padding: 'var(--space-11) 32px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 640,
      marginBottom: 'var(--space-8)'
    }
  }, /*#__PURE__*/React.createElement(Eyebrow, {
    withRule: true
  }, "What we do"), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '16px 0 0'
    }
  }, "Industry-leading psychological training, delivered where it counts.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
      gap: 'var(--space-5)'
    }
  }, SERVICES.map(s => /*#__PURE__*/React.createElement(Card, {
    key: s.title,
    elevation: "sm",
    interactive: true,
    padding: "lg",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: '14px'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 46,
      height: 46,
      borderRadius: 'var(--radius-md)',
      background: 'var(--ep-pine-tint)',
      color: 'var(--ep-pine-700)',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("i", {
    "data-lucide": s.icon,
    style: {
      width: 22,
      height: 22
    }
  })), /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0
    }
  }, s.title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontSize: '15px',
      color: 'var(--text-body)'
    }
  }, s.body))))));
}
window.Services = Services;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/Services.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/SiteHeader.jsx
try { (() => {
// Expedition Psychology — Site header / nav
const {
  Button,
  Logo
} = window.ExpeditionPsychologyDesignSystem_4e7d0e;
function SiteHeader({
  onNav,
  active
}) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const root = document.querySelector('.ep-site-scroll');
    const el = root || window;
    const onScroll = () => {
      const y = root ? root.scrollTop : window.scrollY;
      setScrolled(y > 12);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);
  const links = ['Services', 'Approach', 'About', 'Insights'];
  return /*#__PURE__*/React.createElement("header", {
    style: {
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: scrolled ? 'rgba(243,243,240,0.85)' : 'transparent',
      backdropFilter: scrolled ? 'saturate(140%) blur(10px)' : 'none',
      borderBottom: scrolled ? '1px solid var(--border-subtle)' : '1px solid transparent',
      transition: 'background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 'var(--container-xl)',
      margin: '0 auto',
      padding: '18px 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    onClick: e => {
      e.preventDefault();
      onNav('top');
    },
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    variant: "wordmark",
    color: "black",
    height: 30,
    assetBase: "../../assets"
  })), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l,
    href: `#${l.toLowerCase()}`,
    onClick: e => {
      e.preventDefault();
      onNav(l.toLowerCase());
    },
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 500,
      fontSize: '14.5px',
      color: active === l.toLowerCase() ? 'var(--ep-plum)' : 'var(--text-body)',
      padding: '8px 14px',
      borderRadius: 'var(--radius-sm)',
      textDecoration: 'none',
      transition: 'color var(--dur-fast) var(--ease-out)'
    }
  }, l)), /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8
    }
  }), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    size: "sm",
    onClick: () => onNav('contact')
  }, "Work with us"))));
}
window.SiteHeader = SiteHeader;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/SiteHeader.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Stat = __ds_scope.Stat;

})();
