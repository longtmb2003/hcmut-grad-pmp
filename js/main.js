// Cấu hình ngày giờ Lễ Tốt Nghiệp theo chuẩn ISO-8601 (ví dụ: "2026-12-20T08:00:00+07:00").
// Để trống "" cho tới khi có ngày chính xác; đồng hồ sẽ hiển thị mặc định 00:00:00:00.
const EVENT_DATE_ISO = "";

document.addEventListener("DOMContentLoaded", () => {
    initScrollReveal();
    initPowerTelemetry();
    initEnergyCanvas();
    initGridBoost();
    initSpecRollup();
    initCardTiltGlow();
    initAtomLab();
    initAtomLinks();
    initCountdown(EVENT_DATE_ISO);
    initCopyAddress();
    initRsvpForm();
});

/**
 * Hiệu ứng xuất hiện dần khi cuộn trang (Scroll-telling)
 */
function initScrollReveal() {
    const sections = document.querySelectorAll(".fade-in");
    if (!sections.length) return;

    if (!("IntersectionObserver" in window)) {
        sections.forEach((section) => section.classList.add("visible"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    obs.unobserve(entry.target);
                }
            });
        },
        {
            root: null,
            rootMargin: "0px",
            threshold: 0.12
        }
    );

    sections.forEach((section) => observer.observe(section));
}

/**
 * Thanh tiến độ công suất cuộn trang trên HUD
 */
function initPowerTelemetry() {
    const percentEl = document.getElementById("power-percent");
    const barEl = document.getElementById("power-progress");
    if (!percentEl || !barEl) return;

    let ticking = false;
    const updateProgress = () => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
        const pct = Math.round(ratio * 100);
        percentEl.textContent = `${pct}%`;
        barEl.style.width = `${pct}%`;
        ticking = false;
    };

    window.addEventListener(
        "scroll",
        () => {
            if (!ticking) {
                window.requestAnimationFrame(updateProgress);
                ticking = true;
            }
        },
        { passive: true }
    );
    updateProgress();
}

/**
 * Nền mạng lưới hạt năng lượng tương tác ở Hero
 */
function initEnergyCanvas() {
    const canvas = document.getElementById("energy-canvas");
    const hero = document.getElementById("hero");
    if (!canvas || !hero) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let nodes = [];
    let rafId = null;
    let heroVisible = true;
    const pointer = { x: null, y: null };

    const createNodes = () => {
        const count = Math.min(48, Math.max(18, Math.floor((width * height) / 26000)));
        const symbols = ["H₂", "Li⁺", "e⁻", "50Hz", "Si", "Cu", null, null, null];
        nodes = Array.from({ length: count }, (_, idx) => ({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            radius: Math.random() * 1.6 + 1.2,
            label: idx % 5 === 0 ? symbols[idx % symbols.length] : null
        }));
    };

    const resize = () => {
        const rect = hero.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        createNodes();
    };

    const drawFrame = () => {
        const boosted = document.body.classList.contains("grid-boosted");
        const speedFactor = boosted ? 1.9 : 1;
        const linkDist = boosted ? 155 : 125;

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < nodes.length; i++) {
            const n = nodes[i];
            if (!prefersReducedMotion) {
                n.x += n.vx * speedFactor;
                n.y += n.vy * speedFactor;
                if (n.x < 0 || n.x > width) n.vx *= -1;
                if (n.y < 0 || n.y > height) n.vy *= -1;
            }

            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fillStyle = boosted ? "rgba(0, 229, 255, 0.85)" : "rgba(0, 229, 255, 0.55)";
            ctx.fill();

            if (n.label) {
                ctx.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
                ctx.fillStyle = boosted ? "rgba(0, 229, 255, 0.55)" : "rgba(125, 211, 252, 0.28)";
                ctx.fillText(n.label, n.x + 8, n.y - 6);
            }

            for (let j = i + 1; j < nodes.length; j++) {
                const m = nodes[j];
                const dx = n.x - m.x;
                const dy = n.y - m.y;
                const dist = Math.hypot(dx, dy);
                if (dist < linkDist) {
                    const alpha = (1 - dist / linkDist) * (boosted ? 0.45 : 0.24);
                    ctx.beginPath();
                    ctx.moveTo(n.x, n.y);
                    ctx.lineTo(m.x, m.y);
                    ctx.strokeStyle = `rgba(0, 229, 255, ${alpha.toFixed(3)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            if (pointer.x !== null && pointer.y !== null) {
                const distPtr = Math.hypot(n.x - pointer.x, n.y - pointer.y);
                if (distPtr < 150) {
                    const alpha = (1 - distPtr / 150) * 0.5;
                    ctx.beginPath();
                    ctx.moveTo(n.x, n.y);
                    ctx.lineTo(pointer.x, pointer.y);
                    ctx.strokeStyle = `rgba(20, 139, 219, ${alpha.toFixed(3)})`;
                    ctx.lineWidth = 1.1;
                    ctx.stroke();
                }
            }
        }
    };

    const tick = () => {
        if (!heroVisible || document.hidden || prefersReducedMotion) {
            rafId = null;
            return;
        }
        drawFrame();
        rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
        if (prefersReducedMotion) {
            drawFrame();
            return;
        }
        if (!rafId && heroVisible && !document.hidden) {
            rafId = window.requestAnimationFrame(tick);
        }
    };

    hero.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
    });

    hero.addEventListener("pointerleave", () => {
        pointer.x = null;
        pointer.y = null;
    });

    if ("IntersectionObserver" in window) {
        const heroObserver = new IntersectionObserver((entries) => {
            heroVisible = entries[0]?.isIntersecting ?? true;
            if (heroVisible) startLoop();
        });
        heroObserver.observe(hero);
    }

    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) startLoop();
    });

    window.addEventListener("resize", () => {
        resize();
        if (prefersReducedMotion) drawFrame();
    });

    resize();
    startLoop();
}

/**
 * Bắn tia hạt năng lượng tại vị trí tương tác
 */
function spawnEnergyBurst(targetOrEvent) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let originX = window.innerWidth / 2;
    let originY = window.innerHeight / 2;

    if (targetOrEvent && typeof targetOrEvent.clientX === "number" && targetOrEvent.clientX > 0) {
        originX = targetOrEvent.clientX;
        originY = targetOrEvent.clientY;
    } else if (targetOrEvent && typeof targetOrEvent.getBoundingClientRect === "function") {
        const rect = targetOrEvent.getBoundingClientRect();
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;
    }

    const sparkCount = 12;
    for (let i = 0; i < sparkCount; i++) {
        const spark = document.createElement("span");
        spark.className = "energy-spark";
        const angle = (Math.PI * 2 * i) / sparkCount + (Math.random() - 0.5) * 0.3;
        const dist = 34 + Math.random() * 44;
        spark.style.left = `${originX}px`;
        spark.style.top = `${originY}px`;
        spark.style.setProperty("--tx", `${Math.cos(angle) * dist}px`);
        spark.style.setProperty("--ty", `${Math.sin(angle) * dist}px`);
        document.body.appendChild(spark);
        spark.addEventListener("animationend", () => spark.remove(), { once: true });
    }
}

/**
 * Công tắc tăng áp hiệu ứng lưới điện
 */
function initGridBoost() {
    const btn = document.getElementById("grid-boost-btn");
    if (!btn) return;

    btn.addEventListener("click", (event) => {
        const active = document.body.classList.toggle("grid-boosted");
        btn.setAttribute("aria-pressed", String(active));
        btn.textContent = active ? "⚡ Đang hòa lưới 100%" : "⚡ Kích hoạt hòa lưới";
        spawnEnergyBurst(event.clientX ? event : btn);
    });
}

/**
 * Hiệu ứng nghiêng 3D nhẹ & ánh sáng theo con trỏ trên các thẻ
 */
function initCardTiltGlow() {
    if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        window.matchMedia("(hover: none)").matches
    ) {
        return;
    }

    const cards = document.querySelectorAll(".tilt-card, .spec-card");
    cards.forEach((card) => {
        card.addEventListener("pointermove", (event) => {
            const rect = card.getBoundingClientRect();
            const relX = (event.clientX - rect.left) / rect.width;
            const relY = (event.clientY - rect.top) / rect.height;
            const tiltX = (0.5 - relY) * 6;
            const tiltY = (relX - 0.5) * 6;

            card.style.setProperty("--mx", `${(relX * 100).toFixed(1)}%`);
            card.style.setProperty("--my", `${(relY * 100).toFixed(1)}%`);
            card.style.transform = `perspective(700px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-2px)`;
        });

        card.addEventListener("pointerleave", () => {
            card.style.transform = "";
        });
    });
}

/**
 * Hiệu ứng đếm số tăng dần cho phần Thông Số Vận Hành
 */
function initSpecRollup() {
    const specsSection = document.getElementById("specs");
    const counters = document.querySelectorAll(".roll-num[data-target]");
    if (!specsSection || !counters.length) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced || !("IntersectionObserver" in window)) return;

    const runRollup = () => {
        counters.forEach((el) => {
            const target = Number(el.dataset.target);
            if (!Number.isFinite(target)) return;
            const duration = 900;
            const start = performance.now();

            const step = (now) => {
                const progress = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = String(Math.round(target * eased));
                if (progress < 1) {
                    window.requestAnimationFrame(step);
                }
            };
            window.requestAnimationFrame(step);
        });
    };

    const observer = new IntersectionObserver(
        (entries, obs) => {
            if (entries.some((e) => e.isIntersecting)) {
                runRollup();
                obs.disconnect();
            }
        },
        { threshold: 0.25 }
    );
    observer.observe(specsSection);
}

/**
 * Mô phỏng nguyên tử năng lượng & hóa học (Bohr Atom SVG + Selector)
 */
const ENERGY_ELEMENTS = {
    H: {
        number: 1,
        symbol: "H",
        mass: "1.008 u",
        icon: "assets/icons/chem-hydrogen.svg",
        shells: [1],
        config: "1s¹ (1 lớp)",
        category: "Năng lượng Hóa học & Nhiệt hạch",
        title: "Hydro (Hydrogen) — Nhiên liệu của sao và Pin H₂",
        desc: "Nguyên tố nhẹ nhất vũ trụ nhưng mang mật độ năng lượng hóa học cao trong pin nhiên liệu (Fuel Cell) và là nhiên liệu cốt lõi của phản ứng nhiệt hạch sạch."
    },
    Li: {
        number: 3,
        symbol: "Li",
        mass: "6.94 u",
        icon: "assets/icons/volta-cell.svg",
        shells: [2, 1],
        config: "[He] 2s¹ (2 · 1)",
        category: "Năng lượng Điện hóa & Lưu trữ",
        title: "Lithium — Trái tim của pin lưu trữ hiện đại",
        desc: "Kim loại nhẹ nhất có thế điện hóa âm cực cao, tiếp nối phát minh pin Volta để tạo nên pin Lithium-ion cho xe điện và hệ thống lưu trữ lưới điện."
    },
    O: {
        number: 8,
        symbol: "O",
        mass: "15.999 u",
        icon: "assets/icons/thermal-flame.svg",
        shells: [2, 6],
        config: "[He] 2s² 2p⁴ (2 · 6)",
        category: "Năng lượng Hóa nhiệt & Oxy hóa",
        title: "Oxy (Oxygen) — Chất xúc tác phản ứng nhiệt lực",
        desc: "Không thể thiếu trong quá trình đốt cháy tạo hơi nước vận hành tuabin nhiệt điện, cũng như phản ứng điện hóa sạch trong pin nhiên liệu H₂–O₂."
    },
    Si: {
        number: 14,
        symbol: "Si",
        mass: "28.085 u",
        icon: "assets/icons/solar-cell.svg",
        shells: [2, 8, 4],
        config: "[Ne] 3s² 3p² (2 · 8 · 4)",
        category: "Quang điện & Bán dẫn",
        title: "Silicon — Chuyển hóa ánh sáng thành dòng điện",
        desc: "Vật liệu bán dẫn nền tảng cho tế bào quang điện (Solar PV) biến bức xạ mặt trời thành điện năng và vi mạch điều khiển lưới điện thông minh."
    },
    Cu: {
        number: 29,
        symbol: "Cu",
        mass: "63.546 u",
        icon: "assets/icons/faraday-coil.svg",
        shells: [2, 8, 18, 1],
        config: "[Ar] 3d¹⁰ 4s¹ (2·8·18·1)",
        category: "Cảm ứng Điện từ & Truyền tải",
        title: "Đồng (Copper) — Mạch máu của hệ thống điện",
        desc: "Nhờ độ dẫn điện vượt trội và electron lớp ngoài linh hoạt, cuộn dây đồng là cốt lõi trong máy phát Faraday và lưới truyền tải xoay chiều AC của Tesla."
    },
    U: {
        number: 92,
        symbol: "U",
        mass: "238.03 u",
        icon: "assets/icons/nuclear-atom.svg",
        shells: [2, 8, 18, 32, 21, 9, 2],
        config: "[Rn] 5f³ 6d¹ 7s² (7 lớp)",
        category: "Năng lượng Hạt nhân",
        title: "Uranium — Mật độ năng lượng phân hạch cực đại",
        desc: "Đồng vị U-235 giải phóng nguồn nhiệt lượng khổng lồ qua phản ứng phân hạch có kiểm soát để phát điện nền công suất lớn, không phát thải carbon trực tiếp."
    }
};

let selectEnergyElement = null;

function initAtomLab() {
    const orbitsEl = document.getElementById("atom-orbits");
    const rippleEl = document.getElementById("atom-ripple");
    const nucNumberEl = document.getElementById("atom-nuc-number");
    const nucSymbolEl = document.getElementById("atom-nuc-symbol");
    const configEl = document.getElementById("atom-config");
    const detailIconEl = document.getElementById("el-detail-icon");
    const categoryEl = document.getElementById("el-category");
    const massEl = document.getElementById("el-mass");
    const titleEl = document.getElementById("el-title");
    const descEl = document.getElementById("el-desc");
    const tabButtons = document.querySelectorAll(".element-tile[data-element]");

    if (!orbitsEl || !tabButtons.length) return;

    const svgNS = "http://www.w3.org/2000/svg";

    const renderAtom = (key, triggerPulse = false) => {
        const el = ENERGY_ELEMENTS[key];
        if (!el) return;

        nucNumberEl.textContent = String(el.number);
        nucSymbolEl.textContent = el.symbol;
        configEl.textContent = `Lớp e⁻: ${el.config}`;
        if (detailIconEl) detailIconEl.src = el.icon;
        categoryEl.textContent = el.category;
        massEl.textContent = el.mass;
        titleEl.textContent = el.title;
        descEl.textContent = el.desc;

        if (triggerPulse && rippleEl) {
            rippleEl.classList.remove("is-pulsing");
            void rippleEl.offsetWidth;
            rippleEl.classList.add("is-pulsing");
        }

        tabButtons.forEach((btn) => {
            const active = btn.dataset.element === key;
            btn.classList.toggle("active", active);
            btn.setAttribute("aria-selected", String(active));
        });

        orbitsEl.replaceChildren();
        const totalShells = el.shells.length;
        const minRadius = 46;
        const maxRadius = 142;
        const step = totalShells > 1 ? (maxRadius - minRadius) / (totalShells - 1) : 0;

        el.shells.forEach((electronCount, idx) => {
            const radius = totalShells === 1 ? 82 : minRadius + idx * step;
            const isValence = idx === totalShells - 1;

            const ring = document.createElementNS(svgNS, "circle");
            ring.setAttribute("cx", "160");
            ring.setAttribute("cy", "160");
            ring.setAttribute("r", radius.toFixed(1));
            ring.setAttribute("class", "orbit-ring");
            orbitsEl.appendChild(ring);

            const group = document.createElementNS(svgNS, "g");
            group.setAttribute(
                "class",
                idx % 2 === 1 ? "orbit-group orbit-group--reverse" : "orbit-group"
            );
            group.style.setProperty("--orbit-duration", `${10 + idx * 4}s`);

            for (let e = 0; e < electronCount; e++) {
                const angle = (Math.PI * 2 * e) / electronCount;
                const ex = 160 + radius * Math.cos(angle);
                const ey = 160 + radius * Math.sin(angle);

                const dot = document.createElementNS(svgNS, "circle");
                dot.setAttribute("cx", ex.toFixed(2));
                dot.setAttribute("cy", ey.toFixed(2));
                dot.setAttribute("r", isValence ? "4.2" : totalShells >= 6 ? "2.3" : "3.2");
                dot.setAttribute(
                    "class",
                    isValence ? "electron-dot electron-dot--valence" : "electron-dot"
                );
                group.appendChild(dot);
            }

            orbitsEl.appendChild(group);
        });
    };

    selectEnergyElement = (key) => renderAtom(key, true);

    tabButtons.forEach((btn) => {
        btn.addEventListener("click", (event) => {
            renderAtom(btn.dataset.element, true);
            spawnEnergyBurst(event.clientX ? event : btn);
        });
    });

    renderAtom("H", false);
}

/**
 * Liên kết từ thẻ danh nhân sang nguyên tử năng lượng tương ứng
 */
function initAtomLinks() {
    const jumpLinks = document.querySelectorAll("[data-jump-atom]");
    const atomLab = document.querySelector(".atom-lab");

    jumpLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const key = link.dataset.jumpAtom;
            spawnEnergyBurst(event.clientX ? event : link);
            if (typeof selectEnergyElement === "function" && key) {
                selectEnergyElement(key);
                if (atomLab) {
                    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                    atomLab.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
                }
            }
        });
    });
}

/**
 * Đồng hồ đếm ngược tới thời điểm diễn ra sự kiện
 */
function initCountdown(targetIso) {
    const displayEl = document.getElementById("countdown");
    if (!displayEl || !targetIso) return;

    const targetTime = Date.parse(targetIso);
    if (Number.isNaN(targetTime)) return;

    const pad = (value) => String(value).padStart(2, "0");

    const update = () => {
        const diff = targetTime - Date.now();
        if (diff <= 0) {
            displayEl.textContent = "00:00:00:00";
            return false;
        }

        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        displayEl.textContent = `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
        return true;
    };

    if (update()) {
        const timerId = setInterval(() => {
            if (!update()) {
                clearInterval(timerId);
            }
        }, 1000);
    }
}

/**
 * Nút sao chép địa điểm sự kiện
 */
function initCopyAddress() {
    const btn = document.getElementById("copy-address-btn");
    const addressEl = document.getElementById("station-address");
    const feedbackEl = document.getElementById("copy-feedback");
    if (!btn || !addressEl || !feedbackEl) return;

    btn.addEventListener("click", async () => {
        const cleanText = addressEl.textContent.replace(/^Địa điểm:\s*/i, "").trim();
        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(cleanText);
                feedbackEl.textContent = "Đã sao chép địa điểm!";
            } else {
                feedbackEl.textContent = "Trình duyệt không hỗ trợ sao chép tự động.";
            }
        } catch {
            feedbackEl.textContent = "Không thể sao chép — hãy chọn và copy thủ công.";
        }
    });
}

/**
 * Xử lý form xác nhận tham dự & cấp Thẻ kết nối điện tử
 * (Hiện tại mô phỏng phía client; sau này có thể nối Google Apps Script hoặc Formspree)
 */
function initRsvpForm() {
    const form = document.getElementById("rsvp-form");
    const feedback = document.getElementById("rsvp-feedback");
    const passCard = document.getElementById("connection-pass");
    const passCodeEl = document.getElementById("pass-code");
    const passGuestEl = document.getElementById("pass-guest");
    const passStatusEl = document.getElementById("pass-status");
    const passWishRow = document.getElementById("pass-wish-row");
    const passWishEl = document.getElementById("pass-wish");

    if (!form || !feedback) return;

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const nameInput = form.elements.guestName;
        const statusSelect = form.elements.status;
        const wishInput = form.elements.wish;

        const guestName = nameInput.value.trim();
        const status = statusSelect.value;
        const wish = wishInput ? wishInput.value.trim() : "";

        if (!guestName) {
            feedback.textContent = "Vui lòng nhập tên trạm thu trước khi truyền tải.";
            nameInput.focus();
            return;
        }

        const isJoining = status === "yes";
        feedback.textContent = isJoining
            ? `Đã tiếp nhận kết nối từ trạm "${guestName}" — Hẹn hòa lưới cùng bạn!`
            : `Đã ghi nhận trạng thái từ trạm "${guestName}" — Cảm ơn bạn đã gửi lời chúc!`;

        if (passCard && passCodeEl && passGuestEl && passStatusEl) {
            const nodeNum = String(Math.floor(1000 + Math.random() * 9000));
            passCodeEl.textContent = `BK-PMP-${nodeNum}`;
            passGuestEl.textContent = guestName;
            passStatusEl.textContent = isJoining
                ? "Sẵn sàng hòa lưới (Tham gia)"
                : "Mất điện tạm thời (Gửi lời chúc từ xa)";

            if (passWishRow && passWishEl) {
                if (wish) {
                    passWishEl.textContent = `"${wish}"`;
                    passWishRow.hidden = false;
                } else {
                    passWishRow.hidden = true;
                }
            }

            passCard.hidden = false;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        spawnEnergyBurst(submitBtn || form);

        form.reset();
    });
}
