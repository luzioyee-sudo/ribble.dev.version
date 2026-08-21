import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=431c6c6e"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=431c6c6e"; const useState = __vite__cjsImport1_react["useState"]; const useEffect = __vite__cjsImport1_react["useEffect"];
import { motion, AnimatePresence } from "/node_modules/.vite/deps/motion_react.js?v=431c6c6e";
export const PixelMascot = ({
  className = "",
  size = 72,
  interactive = true,
  isFlying = false,
  actionOverride
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [isDay, setIsDay] = useState(true);
  useEffect(() => {
    const checkTime = () => {
      const hour = (/* @__PURE__ */ new Date()).getHours();
      setIsDay(hour >= 6 && hour < 18);
    };
    checkTime();
    const interval = setInterval(checkTime, 6e4);
    return () => clearInterval(interval);
  }, []);
  const messages = isDay ? [
    "Good morning! Ready to shine today? ☀️",
    "Keep up the bright work! ✨",
    "Have a radiant day! 🌻"
  ] : [
    "Good evening! Time to relax. 🌙",
    "Sweet dreams! 💫",
    "The stars are proud of you today. ✨"
  ];
  const handleClick = (e) => {
    if (!interactive) return;
    setIsClicked(true);
    if (!showBubble) {
      const text = messages[Math.floor(Math.random() * messages.length)];
      setBubbleText(text);
      setShowBubble(true);
    } else {
      setShowBubble(false);
    }
    setTimeout(() => setIsClicked(false), 800);
  };
  return /* @__PURE__ */ jsxDEV(
    "div",
    {
      className: `relative inline-flex items-center justify-center ${isHovered ? "z-50" : "z-10"} ${className}`,
      style: { width: size, height: size },
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
      onClick: handleClick,
      children: [
        /* @__PURE__ */ jsxDEV(AnimatePresence, { children: showBubble && /* @__PURE__ */ jsxDEV(
          motion.div,
          {
            initial: { opacity: 0, scale: 0.8, y: -40 },
            animate: { opacity: 1, scale: 1, y: -65 },
            exit: { opacity: 0, scale: 0.8, y: -80 },
            className: "absolute bottom-full mb-6 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md text-[#2D3027] dark:text-stone-100 border border-[#FCD34D]/20 rounded-2xl p-3 text-xs font-semibold shadow-2xl w-48 text-center select-none z-50 leading-relaxed ring-1 ring-black/5",
            children: [
              /* @__PURE__ */ jsxDEV("p", { className: "text-[#2D3027] dark:text-stone-200 font-medium", children: bubbleText }, void 0, false, {
                fileName: "/app/applet/src/components/PixelMascot.tsx",
                lineNumber: 77,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "absolute top-full left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white dark:bg-stone-900 border-r border-b border-[#FCD34D]/20 rotate-45 -translate-y-[8px]" }, void 0, false, {
                fileName: "/app/applet/src/components/PixelMascot.tsx",
                lineNumber: 80,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/components/PixelMascot.tsx",
            lineNumber: 71,
            columnNumber: 11
          },
          this
        ) }, void 0, false, {
          fileName: "/app/applet/src/components/PixelMascot.tsx",
          lineNumber: 69,
          columnNumber: 7
        }, this),
        /* @__PURE__ */ jsxDEV(
          motion.div,
          {
            className: "w-full h-full relative flex items-center justify-center cursor-pointer",
            style: { transformOrigin: "50% 50%" },
            animate: isHovered ? {
              y: [0, -8, 0],
              scale: 1.1
            } : isFlying || actionOverride === "walk" || actionOverride === "run" ? {
              y: [0, -5, 0]
            } : {
              y: [0, 2, 0]
            },
            transition: isHovered ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : isFlying || actionOverride === "walk" || actionOverride === "run" ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
            children: isDay ? (
              // --- SUN ---
              /* @__PURE__ */ jsxDEV("svg", { viewBox: "0 0 100 100", width: "100%", height: "100%", className: "drop-shadow-lg", children: [
                /* @__PURE__ */ jsxDEV(
                  motion.g,
                  {
                    animate: { rotate: 360 },
                    transition: { duration: 20, repeat: Infinity, ease: "linear" },
                    style: { transformOrigin: "50% 50%" },
                    children: [
                      /* @__PURE__ */ jsxDEV("circle", { cx: "50", cy: "50", r: "28", fill: "#FBBF24" }, void 0, false, {
                        fileName: "/app/applet/src/components/PixelMascot.tsx",
                        lineNumber: 112,
                        columnNumber: 15
                      }, this),
                      Array.from({ length: 8 }).map((_, i) => /* @__PURE__ */ jsxDEV(
                        "rect",
                        {
                          x: "46",
                          y: "5",
                          width: "8",
                          height: "12",
                          rx: "4",
                          fill: "#F59E0B",
                          transform: `rotate(${i * 45} 50 50)`
                        },
                        i,
                        false,
                        {
                          fileName: "/app/applet/src/components/PixelMascot.tsx",
                          lineNumber: 115,
                          columnNumber: 17
                        },
                        this
                      ))
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/app/applet/src/components/PixelMascot.tsx",
                    lineNumber: 107,
                    columnNumber: 13
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV("circle", { cx: "40", cy: "46", r: "4", fill: "#78350F" }, void 0, false, {
                  fileName: "/app/applet/src/components/PixelMascot.tsx",
                  lineNumber: 128,
                  columnNumber: 13
                }, this),
                /* @__PURE__ */ jsxDEV("circle", { cx: "60", cy: "46", r: "4", fill: "#78350F" }, void 0, false, {
                  fileName: "/app/applet/src/components/PixelMascot.tsx",
                  lineNumber: 129,
                  columnNumber: 13
                }, this),
                isHovered ? /* @__PURE__ */ jsxDEV("path", { d: "M 44 54 Q 50 62 56 54", stroke: "#78350F", strokeWidth: "3", fill: "none", strokeLinecap: "round" }, void 0, false, {
                  fileName: "/app/applet/src/components/PixelMascot.tsx",
                  lineNumber: 131,
                  columnNumber: 16
                }, this) : /* @__PURE__ */ jsxDEV("path", { d: "M 44 54 Q 50 58 56 54", stroke: "#78350F", strokeWidth: "3", fill: "none", strokeLinecap: "round" }, void 0, false, {
                  fileName: "/app/applet/src/components/PixelMascot.tsx",
                  lineNumber: 133,
                  columnNumber: 16
                }, this),
                /* @__PURE__ */ jsxDEV("circle", { cx: "34", cy: "52", r: "3", fill: "#FCD34D", opacity: "0.6" }, void 0, false, {
                  fileName: "/app/applet/src/components/PixelMascot.tsx",
                  lineNumber: 135,
                  columnNumber: 13
                }, this),
                /* @__PURE__ */ jsxDEV("circle", { cx: "66", cy: "52", r: "3", fill: "#FCD34D", opacity: "0.6" }, void 0, false, {
                  fileName: "/app/applet/src/components/PixelMascot.tsx",
                  lineNumber: 136,
                  columnNumber: 13
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/components/PixelMascot.tsx",
                lineNumber: 106,
                columnNumber: 11
              }, this)
            ) : (
              // --- MOON ---
              /* @__PURE__ */ jsxDEV("svg", { viewBox: "0 0 100 100", width: "100%", height: "100%", className: "drop-shadow-lg", children: [
                /* @__PURE__ */ jsxDEV(
                  motion.g,
                  {
                    animate: { rotate: [0, 5, -5, 0] },
                    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                    style: { transformOrigin: "50% 50%" },
                    children: [
                      /* @__PURE__ */ jsxDEV(
                        "path",
                        {
                          d: "M 65 20 A 35 35 0 1 0 75 80 A 40 40 0 0 1 65 20 Z",
                          fill: "#FDF2F8"
                        },
                        void 0,
                        false,
                        {
                          fileName: "/app/applet/src/components/PixelMascot.tsx",
                          lineNumber: 147,
                          columnNumber: 15
                        },
                        this
                      ),
                      /* @__PURE__ */ jsxDEV(
                        "path",
                        {
                          d: "M 65 20 A 35 35 0 1 0 75 80 A 40 40 0 0 1 65 20 Z",
                          fill: "url(#moonGlow)",
                          opacity: "0.5"
                        },
                        void 0,
                        false,
                        {
                          fileName: "/app/applet/src/components/PixelMascot.tsx",
                          lineNumber: 151,
                          columnNumber: 15
                        },
                        this
                      ),
                      isHovered ? /* @__PURE__ */ jsxDEV(Fragment, { children: [
                        /* @__PURE__ */ jsxDEV("path", { d: "M 38 46 Q 42 42 46 46", stroke: "#475569", strokeWidth: "2.5", fill: "none", strokeLinecap: "round" }, void 0, false, {
                          fileName: "/app/applet/src/components/PixelMascot.tsx",
                          lineNumber: 160,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ jsxDEV("path", { d: "M 52 48 Q 56 44 60 48", stroke: "#475569", strokeWidth: "2.5", fill: "none", strokeLinecap: "round" }, void 0, false, {
                          fileName: "/app/applet/src/components/PixelMascot.tsx",
                          lineNumber: 161,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ jsxDEV("path", { d: "M 45 56 Q 50 62 54 55", stroke: "#475569", strokeWidth: "2.5", fill: "none", strokeLinecap: "round" }, void 0, false, {
                          fileName: "/app/applet/src/components/PixelMascot.tsx",
                          lineNumber: 162,
                          columnNumber: 19
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/app/applet/src/components/PixelMascot.tsx",
                        lineNumber: 159,
                        columnNumber: 17
                      }, this) : /* @__PURE__ */ jsxDEV(Fragment, { children: [
                        /* @__PURE__ */ jsxDEV("circle", { cx: "42", cy: "48", r: "3.5", fill: "#475569" }, void 0, false, {
                          fileName: "/app/applet/src/components/PixelMascot.tsx",
                          lineNumber: 166,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ jsxDEV("circle", { cx: "56", cy: "50", r: "3.5", fill: "#475569" }, void 0, false, {
                          fileName: "/app/applet/src/components/PixelMascot.tsx",
                          lineNumber: 167,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ jsxDEV("path", { d: "M 45 58 Q 50 62 54 57", stroke: "#475569", strokeWidth: "2.5", fill: "none", strokeLinecap: "round" }, void 0, false, {
                          fileName: "/app/applet/src/components/PixelMascot.tsx",
                          lineNumber: 168,
                          columnNumber: 19
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/app/applet/src/components/PixelMascot.tsx",
                        lineNumber: 165,
                        columnNumber: 17
                      }, this),
                      /* @__PURE__ */ jsxDEV("circle", { cx: "36", cy: "54", r: "3", fill: "#FCE7F3", opacity: "0.6" }, void 0, false, {
                        fileName: "/app/applet/src/components/PixelMascot.tsx",
                        lineNumber: 171,
                        columnNumber: 15
                      }, this),
                      /* @__PURE__ */ jsxDEV("circle", { cx: "62", cy: "56", r: "3", fill: "#FCE7F3", opacity: "0.6" }, void 0, false, {
                        fileName: "/app/applet/src/components/PixelMascot.tsx",
                        lineNumber: 172,
                        columnNumber: 15
                      }, this)
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/app/applet/src/components/PixelMascot.tsx",
                    lineNumber: 141,
                    columnNumber: 13
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV("defs", { children: /* @__PURE__ */ jsxDEV("radialGradient", { id: "moonGlow", cx: "50%", cy: "50%", r: "50%", fx: "50%", fy: "50%", children: [
                  /* @__PURE__ */ jsxDEV("stop", { offset: "0%", stopColor: "#DBEAFE" }, void 0, false, {
                    fileName: "/app/applet/src/components/PixelMascot.tsx",
                    lineNumber: 177,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("stop", { offset: "100%", stopColor: "#818CF8", stopOpacity: "0" }, void 0, false, {
                    fileName: "/app/applet/src/components/PixelMascot.tsx",
                    lineNumber: 178,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/components/PixelMascot.tsx",
                  lineNumber: 176,
                  columnNumber: 15
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/components/PixelMascot.tsx",
                  lineNumber: 175,
                  columnNumber: 13
                }, this),
                Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ jsxDEV(
                  motion.circle,
                  {
                    cx: 20 + i * 30,
                    cy: 20 + i * 15 % 40,
                    r: "1.5",
                    fill: "#FDE047",
                    animate: { opacity: [0.2, 1, 0.2] },
                    transition: { duration: 2 + i, repeat: Infinity, ease: "easeInOut" }
                  },
                  `star-${i}`,
                  false,
                  {
                    fileName: "/app/applet/src/components/PixelMascot.tsx",
                    lineNumber: 184,
                    columnNumber: 15
                  },
                  this
                ))
              ] }, void 0, true, {
                fileName: "/app/applet/src/components/PixelMascot.tsx",
                lineNumber: 140,
                columnNumber: 11
              }, this)
            )
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/components/PixelMascot.tsx",
            lineNumber: 85,
            columnNumber: 7
          },
          this
        )
      ]
    },
    void 0,
    true,
    {
      fileName: "/app/applet/src/components/PixelMascot.tsx",
      lineNumber: 62,
      columnNumber: 5
    },
    this
  );
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIlBpeGVsTWFzY290LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IG1vdGlvbiwgQW5pbWF0ZVByZXNlbmNlIH0gZnJvbSAnbW90aW9uL3JlYWN0JztcblxuaW50ZXJmYWNlIFBpeGVsTWFzY290UHJvcHMge1xuICBjbGFzc05hbWU/OiBzdHJpbmc7XG4gIHNpemU/OiBudW1iZXI7XG4gIGludGVyYWN0aXZlPzogYm9vbGVhbjtcbiAgaXNGbHlpbmc/OiBib29sZWFuO1xuICBhY3Rpb25PdmVycmlkZT86ICdpZGxlJyB8ICd3YWxrJyB8ICdydW4nIHwgJ3dhdmUnIHwgJ2JhY2tmbGlwJyB8ICdmbHknO1xufVxuXG5leHBvcnQgY29uc3QgUGl4ZWxNYXNjb3Q6IFJlYWN0LkZDPFBpeGVsTWFzY290UHJvcHM+ID0gKHtcbiAgY2xhc3NOYW1lID0gJycsXG4gIHNpemUgPSA3MixcbiAgaW50ZXJhY3RpdmUgPSB0cnVlLFxuICBpc0ZseWluZyA9IGZhbHNlLFxuICBhY3Rpb25PdmVycmlkZSxcbn0pID0+IHtcbiAgY29uc3QgW2lzSG92ZXJlZCwgc2V0SXNIb3ZlcmVkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2lzQ2xpY2tlZCwgc2V0SXNDbGlja2VkXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW3Nob3dCdWJibGUsIHNldFNob3dCdWJibGVdID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbYnViYmxlVGV4dCwgc2V0QnViYmxlVGV4dF0gPSB1c2VTdGF0ZSgnJyk7XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIGl0IGlzIGRheSBvciBuaWdodCBiYXNlZCBvbiBjdXJyZW50IHRpbWVcbiAgY29uc3QgW2lzRGF5LCBzZXRJc0RheV0gPSB1c2VTdGF0ZSh0cnVlKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IGNoZWNrVGltZSA9ICgpID0+IHtcbiAgICAgIGNvbnN0IGhvdXIgPSBuZXcgRGF0ZSgpLmdldEhvdXJzKCk7XG4gICAgICBzZXRJc0RheShob3VyID49IDYgJiYgaG91ciA8IDE4KTtcbiAgICB9O1xuICAgIGNoZWNrVGltZSgpO1xuICAgIGNvbnN0IGludGVydmFsID0gc2V0SW50ZXJ2YWwoY2hlY2tUaW1lLCA2MDAwMCk7IC8vIENoZWNrIGV2ZXJ5IG1pbnV0ZVxuICAgIHJldHVybiAoKSA9PiBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IG1lc3NhZ2VzID0gaXNEYXkgPyBbXG4gICAgJ0dvb2QgbW9ybmluZyEgUmVhZHkgdG8gc2hpbmUgdG9kYXk/IOKYgO+4jycsXG4gICAgJ0tlZXAgdXAgdGhlIGJyaWdodCB3b3JrISDinKgnLFxuICAgICdIYXZlIGEgcmFkaWFudCBkYXkhIPCfjLsnXG4gIF0gOiBbXG4gICAgJ0dvb2QgZXZlbmluZyEgVGltZSB0byByZWxheC4g8J+MmScsXG4gICAgJ1N3ZWV0IGRyZWFtcyEg8J+SqycsXG4gICAgJ1RoZSBzdGFycyBhcmUgcHJvdWQgb2YgeW91IHRvZGF5LiDinKgnXG4gIF07XG5cbiAgY29uc3QgaGFuZGxlQ2xpY2sgPSAoZTogUmVhY3QuTW91c2VFdmVudCkgPT4ge1xuICAgIGlmICghaW50ZXJhY3RpdmUpIHJldHVybjtcbiAgICBzZXRJc0NsaWNrZWQodHJ1ZSk7XG5cbiAgICBpZiAoIXNob3dCdWJibGUpIHtcbiAgICAgIGNvbnN0IHRleHQgPSBtZXNzYWdlc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBtZXNzYWdlcy5sZW5ndGgpXTtcbiAgICAgIHNldEJ1YmJsZVRleHQodGV4dCk7XG4gICAgICBzZXRTaG93QnViYmxlKHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTaG93QnViYmxlKGZhbHNlKTtcbiAgICB9XG4gICAgc2V0VGltZW91dCgoKSA9PiBzZXRJc0NsaWNrZWQoZmFsc2UpLCA4MDApO1xuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBcbiAgICAgIGNsYXNzTmFtZT17YHJlbGF0aXZlIGlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciAke2lzSG92ZXJlZCA/ICd6LTUwJyA6ICd6LTEwJ30gJHtjbGFzc05hbWV9YH1cbiAgICAgIHN0eWxlPXt7IHdpZHRoOiBzaXplLCBoZWlnaHQ6IHNpemUgfX1cbiAgICAgIG9uTW91c2VFbnRlcj17KCkgPT4gc2V0SXNIb3ZlcmVkKHRydWUpfVxuICAgICAgb25Nb3VzZUxlYXZlPXsoKSA9PiBzZXRJc0hvdmVyZWQoZmFsc2UpfVxuICAgICAgb25DbGljaz17aGFuZGxlQ2xpY2t9XG4gICAgPlxuICAgICAgPEFuaW1hdGVQcmVzZW5jZT5cbiAgICAgICAge3Nob3dCdWJibGUgJiYgKFxuICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjgsIHk6IC00MCB9fVxuICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSwgeTogLTY1IH19XG4gICAgICAgICAgICBleGl0PXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjgsIHk6IC04MCB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiYWJzb2x1dGUgYm90dG9tLWZ1bGwgbWItNiBsZWZ0LTEvMiAtdHJhbnNsYXRlLXgtMS8yIGJnLXdoaXRlLzk1IGRhcms6Ymctc3RvbmUtOTAwLzk1IGJhY2tkcm9wLWJsdXItbWQgdGV4dC1bIzJEMzAyN10gZGFyazp0ZXh0LXN0b25lLTEwMCBib3JkZXIgYm9yZGVyLVsjRkNEMzREXS8yMCByb3VuZGVkLTJ4bCBwLTMgdGV4dC14cyBmb250LXNlbWlib2xkIHNoYWRvdy0yeGwgdy00OCB0ZXh0LWNlbnRlciBzZWxlY3Qtbm9uZSB6LTUwIGxlYWRpbmctcmVsYXhlZCByaW5nLTEgcmluZy1ibGFjay81XCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsjMkQzMDI3XSBkYXJrOnRleHQtc3RvbmUtMjAwIGZvbnQtbWVkaXVtXCI+XG4gICAgICAgICAgICAgIHtidWJibGVUZXh0fVxuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtZnVsbCBsZWZ0LTEvMiAtdHJhbnNsYXRlLXgtMS8yIHctMy41IGgtMy41IGJnLXdoaXRlIGRhcms6Ymctc3RvbmUtOTAwIGJvcmRlci1yIGJvcmRlci1iIGJvcmRlci1bI0ZDRDM0RF0vMjAgcm90YXRlLTQ1IC10cmFuc2xhdGUteS1bOHB4XVwiIC8+XG4gICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICApfVxuICAgICAgPC9BbmltYXRlUHJlc2VuY2U+XG5cbiAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgIGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgcmVsYXRpdmUgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgY3Vyc29yLXBvaW50ZXJcIlxuICAgICAgICBzdHlsZT17eyB0cmFuc2Zvcm1PcmlnaW46ICc1MCUgNTAlJyB9fVxuICAgICAgICBhbmltYXRlPXtcbiAgICAgICAgICBpc0hvdmVyZWQgPyB7XG4gICAgICAgICAgICB5OiBbMCwgLTgsIDBdLFxuICAgICAgICAgICAgc2NhbGU6IDEuMSxcbiAgICAgICAgICB9IDogaXNGbHlpbmcgfHwgYWN0aW9uT3ZlcnJpZGUgPT09ICd3YWxrJyB8fCBhY3Rpb25PdmVycmlkZSA9PT0gJ3J1bicgPyB7XG4gICAgICAgICAgICB5OiBbMCwgLTUsIDBdLFxuICAgICAgICAgIH0gOiB7XG4gICAgICAgICAgICB5OiBbMCwgMiwgMF0sXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRyYW5zaXRpb249e1xuICAgICAgICAgIGlzSG92ZXJlZCA/IHsgZHVyYXRpb246IDAuOCwgcmVwZWF0OiBJbmZpbml0eSwgZWFzZTogJ2Vhc2VJbk91dCcgfVxuICAgICAgICAgIDogaXNGbHlpbmcgfHwgYWN0aW9uT3ZlcnJpZGUgPT09ICd3YWxrJyB8fCBhY3Rpb25PdmVycmlkZSA9PT0gJ3J1bicgPyB7IGR1cmF0aW9uOiAxLjIsIHJlcGVhdDogSW5maW5pdHksIGVhc2U6ICdlYXNlSW5PdXQnIH1cbiAgICAgICAgICA6IHsgZHVyYXRpb246IDMuNSwgcmVwZWF0OiBJbmZpbml0eSwgZWFzZTogJ2Vhc2VJbk91dCcgfVxuICAgICAgICB9XG4gICAgICA+XG4gICAgICAgIHtpc0RheSA/IChcbiAgICAgICAgICAvLyAtLS0gU1VOIC0tLVxuICAgICAgICAgIDxzdmcgdmlld0JveD1cIjAgMCAxMDAgMTAwXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIGNsYXNzTmFtZT1cImRyb3Atc2hhZG93LWxnXCI+XG4gICAgICAgICAgICA8bW90aW9uLmdcbiAgICAgICAgICAgICAgYW5pbWF0ZT17eyByb3RhdGU6IDM2MCB9fVxuICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiAyMCwgcmVwZWF0OiBJbmZpbml0eSwgZWFzZTogXCJsaW5lYXJcIiB9fVxuICAgICAgICAgICAgICBzdHlsZT17eyB0cmFuc2Zvcm1PcmlnaW46ICc1MCUgNTAlJyB9fVxuICAgICAgICAgICAgPlxuICAgICAgICAgICAgICA8Y2lyY2xlIGN4PVwiNTBcIiBjeT1cIjUwXCIgcj1cIjI4XCIgZmlsbD1cIiNGQkJGMjRcIiAvPlxuICAgICAgICAgICAgICB7LyogU3VuIFJheXMgKi99XG4gICAgICAgICAgICAgIHtBcnJheS5mcm9tKHsgbGVuZ3RoOiA4IH0pLm1hcCgoXywgaSkgPT4gKFxuICAgICAgICAgICAgICAgIDxyZWN0IFxuICAgICAgICAgICAgICAgICAga2V5PXtpfSBcbiAgICAgICAgICAgICAgICAgIHg9XCI0NlwiIFxuICAgICAgICAgICAgICAgICAgeT1cIjVcIiBcbiAgICAgICAgICAgICAgICAgIHdpZHRoPVwiOFwiIFxuICAgICAgICAgICAgICAgICAgaGVpZ2h0PVwiMTJcIiBcbiAgICAgICAgICAgICAgICAgIHJ4PVwiNFwiIFxuICAgICAgICAgICAgICAgICAgZmlsbD1cIiNGNTlFMEJcIiBcbiAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybT17YHJvdGF0ZSgke2kgKiA0NX0gNTAgNTApYH0gXG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICA8L21vdGlvbi5nPlxuICAgICAgICAgICAgey8qIEZyaWVuZGx5IEZhY2UgKi99XG4gICAgICAgICAgICA8Y2lyY2xlIGN4PVwiNDBcIiBjeT1cIjQ2XCIgcj1cIjRcIiBmaWxsPVwiIzc4MzUwRlwiIC8+XG4gICAgICAgICAgICA8Y2lyY2xlIGN4PVwiNjBcIiBjeT1cIjQ2XCIgcj1cIjRcIiBmaWxsPVwiIzc4MzUwRlwiIC8+XG4gICAgICAgICAgICB7aXNIb3ZlcmVkID8gKFxuICAgICAgICAgICAgICAgPHBhdGggZD1cIk0gNDQgNTQgUSA1MCA2MiA1NiA1NFwiIHN0cm9rZT1cIiM3ODM1MEZcIiBzdHJva2VXaWR0aD1cIjNcIiBmaWxsPVwibm9uZVwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIC8+XG4gICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgPHBhdGggZD1cIk0gNDQgNTQgUSA1MCA1OCA1NiA1NFwiIHN0cm9rZT1cIiM3ODM1MEZcIiBzdHJva2VXaWR0aD1cIjNcIiBmaWxsPVwibm9uZVwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjM0XCIgY3k9XCI1MlwiIHI9XCIzXCIgZmlsbD1cIiNGQ0QzNERcIiBvcGFjaXR5PVwiMC42XCIgLz5cbiAgICAgICAgICAgIDxjaXJjbGUgY3g9XCI2NlwiIGN5PVwiNTJcIiByPVwiM1wiIGZpbGw9XCIjRkNEMzREXCIgb3BhY2l0eT1cIjAuNlwiIC8+XG4gICAgICAgICAgPC9zdmc+XG4gICAgICAgICkgOiAoXG4gICAgICAgICAgLy8gLS0tIE1PT04gLS0tXG4gICAgICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDEwMCAxMDBcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCIgY2xhc3NOYW1lPVwiZHJvcC1zaGFkb3ctbGdcIj5cbiAgICAgICAgICAgIDxtb3Rpb24uZ1xuICAgICAgICAgICAgICBhbmltYXRlPXt7IHJvdGF0ZTogWzAsIDUsIC01LCAwXSB9fVxuICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7IGR1cmF0aW9uOiA2LCByZXBlYXQ6IEluZmluaXR5LCBlYXNlOiBcImVhc2VJbk91dFwiIH19XG4gICAgICAgICAgICAgIHN0eWxlPXt7IHRyYW5zZm9ybU9yaWdpbjogJzUwJSA1MCUnIH19XG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIHsvKiBDcmVzY2VudCBNb29uICovfVxuICAgICAgICAgICAgICA8cGF0aCBcbiAgICAgICAgICAgICAgICBkPVwiTSA2NSAyMCBBIDM1IDM1IDAgMSAwIDc1IDgwIEEgNDAgNDAgMCAwIDEgNjUgMjAgWlwiIFxuICAgICAgICAgICAgICAgIGZpbGw9XCIjRkRGMkY4XCIgXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDxwYXRoIFxuICAgICAgICAgICAgICAgIGQ9XCJNIDY1IDIwIEEgMzUgMzUgMCAxIDAgNzUgODAgQSA0MCA0MCAwIDAgMSA2NSAyMCBaXCIgXG4gICAgICAgICAgICAgICAgZmlsbD1cInVybCgjbW9vbkdsb3cpXCIgXG4gICAgICAgICAgICAgICAgb3BhY2l0eT1cIjAuNVwiXG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIFxuICAgICAgICAgICAgICB7LyogRnJpZW5kbHkgRmFjZSAqL31cbiAgICAgICAgICAgICAge2lzSG92ZXJlZCA/IChcbiAgICAgICAgICAgICAgICA8PlxuICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0gMzggNDYgUSA0MiA0MiA0NiA0NlwiIHN0cm9rZT1cIiM0NzU1NjlcIiBzdHJva2VXaWR0aD1cIjIuNVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgLz5cbiAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNIDUyIDQ4IFEgNTYgNDQgNjAgNDhcIiBzdHJva2U9XCIjNDc1NTY5XCIgc3Ryb2tlV2lkdGg9XCIyLjVcIiBmaWxsPVwibm9uZVwiIHN0cm9rZUxpbmVjYXA9XCJyb3VuZFwiIC8+XG4gICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTSA0NSA1NiBRIDUwIDYyIDU0IDU1XCIgc3Ryb2tlPVwiIzQ3NTU2OVwiIHN0cm9rZVdpZHRoPVwiMi41XCIgZmlsbD1cIm5vbmVcIiBzdHJva2VMaW5lY2FwPVwicm91bmRcIiAvPlxuICAgICAgICAgICAgICAgIDwvPlxuICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgICAgICA8Y2lyY2xlIGN4PVwiNDJcIiBjeT1cIjQ4XCIgcj1cIjMuNVwiIGZpbGw9XCIjNDc1NTY5XCIgLz5cbiAgICAgICAgICAgICAgICAgIDxjaXJjbGUgY3g9XCI1NlwiIGN5PVwiNTBcIiByPVwiMy41XCIgZmlsbD1cIiM0NzU1NjlcIiAvPlxuICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0gNDUgNTggUSA1MCA2MiA1NCA1N1wiIHN0cm9rZT1cIiM0NzU1NjlcIiBzdHJva2VXaWR0aD1cIjIuNVwiIGZpbGw9XCJub25lXCIgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCIgLz5cbiAgICAgICAgICAgICAgICA8Lz5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjM2XCIgY3k9XCI1NFwiIHI9XCIzXCIgZmlsbD1cIiNGQ0U3RjNcIiBvcGFjaXR5PVwiMC42XCIgLz5cbiAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjYyXCIgY3k9XCI1NlwiIHI9XCIzXCIgZmlsbD1cIiNGQ0U3RjNcIiBvcGFjaXR5PVwiMC42XCIgLz5cbiAgICAgICAgICAgIDwvbW90aW9uLmc+XG5cbiAgICAgICAgICAgIDxkZWZzPlxuICAgICAgICAgICAgICA8cmFkaWFsR3JhZGllbnQgaWQ9XCJtb29uR2xvd1wiIGN4PVwiNTAlXCIgY3k9XCI1MCVcIiByPVwiNTAlXCIgZng9XCI1MCVcIiBmeT1cIjUwJVwiPlxuICAgICAgICAgICAgICAgIDxzdG9wIG9mZnNldD1cIjAlXCIgc3RvcENvbG9yPVwiI0RCRUFGRVwiIC8+XG4gICAgICAgICAgICAgICAgPHN0b3Agb2Zmc2V0PVwiMTAwJVwiIHN0b3BDb2xvcj1cIiM4MThDRjhcIiBzdG9wT3BhY2l0eT1cIjBcIiAvPlxuICAgICAgICAgICAgICA8L3JhZGlhbEdyYWRpZW50PlxuICAgICAgICAgICAgPC9kZWZzPlxuXG4gICAgICAgICAgICB7LyogRmxvYXRpbmcgU3RhcnMgKi99XG4gICAgICAgICAgICB7QXJyYXkuZnJvbSh7IGxlbmd0aDogMyB9KS5tYXAoKF8sIGkpID0+IChcbiAgICAgICAgICAgICAgPG1vdGlvbi5jaXJjbGVcbiAgICAgICAgICAgICAgICBrZXk9e2BzdGFyLSR7aX1gfVxuICAgICAgICAgICAgICAgIGN4PXsyMCArIChpICogMzApfVxuICAgICAgICAgICAgICAgIGN5PXsyMCArIChpICogMTUgJSA0MCl9XG4gICAgICAgICAgICAgICAgcj1cIjEuNVwiXG4gICAgICAgICAgICAgICAgZmlsbD1cIiNGREUwNDdcIlxuICAgICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogWzAuMiwgMSwgMC4yXSB9fVxuICAgICAgICAgICAgICAgIHRyYW5zaXRpb249e3sgZHVyYXRpb246IDIgKyBpLCByZXBlYXQ6IEluZmluaXR5LCBlYXNlOiBcImVhc2VJbk91dFwiIH19XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgKX1cbiAgICAgIDwvbW90aW9uLmRpdj5cbiAgICA8L2Rpdj5cbiAgKTtcbn07XG5cbiJdLCJt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