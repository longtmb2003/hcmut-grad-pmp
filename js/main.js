// ==========================================================================
// PHẠM MINH PHƯƠNG — LỄ TỐT NGHIỆP KỸ SƯ NĂNG LƯỢNG HCMUT
// JavaScript: Đếm ngược · Pháo hoa Tung Mũ · Sổ lưu bút · Lịch & Bản đồ · Lightbox
// ==========================================================================

// Thời gian Lễ Tốt Nghiệp: 08:00 sáng ngày 28/11/2026
const GRADUATION_DATE = new Date("2026-11-28T08:00:00+07:00").getTime();

let celebrationEngine = null;

document.addEventListener("DOMContentLoaded", () => {
    celebrationEngine = new CelebrationEngine("confetti-canvas");
    initCountdown();
    initCopyAddress();
    initCelebration();
    initShareButton();
    initTiltCard();
    initRecentWishes();
    initGuestbook();
    initPhotoModal();
    initRoadmapPathway();

    // Hỗ trợ tự động kích hoạt hiệu ứng nếu có tham số trên URL
    try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("celebrate") === "caps") {
            setTimeout(() => {
                if (celebrationEngine) celebrationEngine.tossCaps(22);
            }, 300);
        } else if (params.get("celebrate") === "fireworks") {
            setTimeout(() => {
                if (celebrationEngine) celebrationEngine.launchFireworks(6);
            }, 300);
        }
    } catch (e) {}
});

/**
 * 1. Đếm ngược đến khoảnh khắc Lễ Trao Bằng
 */
function initCountdown() {
    const countdownEl = document.getElementById("countdown");
    if (!countdownEl) return;

    function updateTimer() {
        const now = Date.now();
        const diff = GRADUATION_DATE - now;

        if (diff <= 0) {
            countdownEl.textContent = "00 : 00 : 00 : 00";
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        const pad = (n) => String(n).padStart(2, "0");
        countdownEl.textContent = `${pad(days)} : ${pad(hours)} : ${pad(minutes)} : ${pad(seconds)}`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
}

/**
 * 2. Sao chép địa chỉ trường vào Clipboard
 */
function initCopyAddress() {
    const copyBtn = document.getElementById("copy-address-btn");
    const addressEl = document.getElementById("event-address");
    if (!copyBtn || !addressEl) return;

    copyBtn.addEventListener("click", async () => {
        const textToCopy = addressEl.textContent.trim();
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(textToCopy);
            } else {
                const textarea = document.createElement("textarea");
                textarea.value = textToCopy;
                textarea.style.position = "fixed";
                textarea.style.opacity = "0";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
            }

            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = "✓ Đã sao chép địa chỉ!";
            copyBtn.style.background = "var(--bk-blue)";
            copyBtn.style.color = "#ffffff";

            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = "";
                copyBtn.style.color = "";
            }, 2500);
        } catch (err) {
            console.warn("Không thể sao chép:", err);
        }
    });
}

// ==========================================================================
// BỘ LỌC TỪ NGỮ THÔ TỤC / CHỬI BẬY (VIỆT & ANH)
// ==========================================================================
const PROFANITY_WORDS = [
    // Viết tắt chửi bậy tiếng Việt phổ biến
    "dm", "dkm", "dcm", "dmm", "vcl", "vkl", "vl", "clgt", "cmn", "cc", "cl",
    // Từ ngữ thô tục tiếng Việt (đã bỏ dấu)
    "dit", "djt", "du ma", "duma", "du me", "dume", "dit me", "djt me", "dit con me",
    "lon", "loz", "l0n", "l0z", "buoi", "cac", "kac", "chet me", "me may", "cha may",
    "deo", "del", "thang cho", "con cho", "suc vat", "mat day", "khon nan", "oc cho",
    "diem", "cave", "lam tinh", "dam dang", "do de tien",
    // Tiếng Anh
    "fuck", "fucking", "fcker", "fck", "shit", "bitch", "asshole", "cunt", "dick", "pussy", "bastard", "slut", "whore"
];

function checkProfanity(rawText) {
    if (!rawText) return false;

    // Chuẩn hóa: chữ thường, gỡ bỏ dấu tiếng Việt
    const clean = rawText
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");

    // 1. Kiểm tra từng từ đơn lẻ sau khi tách dấu câu và khoảng trắng
    const words = clean.split(/[\s,\.\?!_\-\+\*\#\@\(\)\[\]]+/);
    for (const w of words) {
        if (PROFANITY_WORDS.includes(w)) return true;
    }

    // 2. Kiểm tra cụm 2-3 từ liên tiếp (vd: "du ma", "dit me", "me may")
    const simplified = clean.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    for (const phrase of PROFANITY_WORDS) {
        if (phrase.includes(" ") && simplified.includes(phrase)) {
            return true;
        }
    }

    // 3. Kiểm tra các dạng cố tình lách dấu chấm/cách (vd: "d.m", "d-m", "v.c.l", "f.u.c.k")
    const collapsedSingleLetters = clean.replace(/([a-z])[\.\-_]+(?=[a-z])/g, "$1");
    const collapsedWords = collapsedSingleLetters.split(/\s+/);
    for (const w of collapsedWords) {
        if (PROFANITY_WORDS.includes(w)) return true;
    }

    return false;
}

/**
 * 3. Xử lý Form Sổ Lưu Bút, Validate Từ Ngữ & Thẻ Kỷ Niệm
 */
function initGuestbook() {
    const form = document.getElementById("guestbook-form");
    const receipt = document.getElementById("guestbook-receipt");
    const guestNameDisplay = document.getElementById("receipt-guest-name");
    const statusDisplay = document.getElementById("receipt-status");
    const quoteDisplay = document.getElementById("receipt-quote");
    const alertBox = document.getElementById("guestbook-alert-msg");

    if (!form || !receipt) return;

    const nameInput = document.getElementById("guest-name");
    const relationInput = document.getElementById("guest-relation");
    const attendanceInput = document.getElementById("guest-attendance");
    const messageInput = document.getElementById("guest-message");

    // Tự động xóa cảnh báo lỗi khi người dùng bắt đầu chỉnh sửa
    const clearError = () => {
        if (alertBox) {
            alertBox.style.display = "none";
            alertBox.textContent = "";
        }
        if (nameInput) nameInput.classList.remove("input-has-error");
        if (messageInput) messageInput.classList.remove("input-has-error");
    };

    if (nameInput) nameInput.addEventListener("input", clearError);
    if (messageInput) messageInput.addEventListener("input", clearError);

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const name = nameInput ? nameInput.value.trim() : "";
        const relation = relationInput ? relationInput.value : "";
        const attendance = attendanceInput ? attendanceInput.value : "yes";
        const message = messageInput ? messageInput.value.trim() : "";

        // ==========================================
        // VALIDATE: TRÁNH TỪ NGỮ THÔ TỤC / CHỬI BẬY
        // ==========================================
        const hasBadName = checkProfanity(name);
        const hasBadMessage = checkProfanity(message);

        if (hasBadName || hasBadMessage) {
            if (alertBox) {
                alertBox.textContent = "⚠️ Tên hoặc lời nhắn có chứa từ ngữ chưa phù hợp. Vui lòng gửi những lời chúc văn minh và tốt đẹp đến Tân Kỹ sư nhé!";
                alertBox.style.display = "block";
            }

            if (hasBadName && nameInput) {
                nameInput.classList.add("input-has-error");
                nameInput.focus();
            } else if (hasBadMessage && messageInput) {
                messageInput.classList.add("input-has-error");
                messageInput.focus();
            }
            return; // Dừng lại, không submit!
        }

        clearError();

        const finalName = name || "Quý Khách";
        const finalMessage = message || "Chúc Kỹ sư Phạm Minh Phương luôn tràn đầy năng lượng, giữ trọn nhiệt huyết Bách Khoa và vươn xa trên con đường sự nghiệp!";

        if (guestNameDisplay) {
            guestNameDisplay.textContent = relation ? `${finalName} (${relation})` : finalName;
        }

        if (statusDisplay) {
            if (attendance === "yes") {
                statusDisplay.textContent = "✨ Sẽ hiện diện chung vui cùng Phương";
                statusDisplay.style.color = "var(--bk-blue)";
            } else if (attendance === "maybe") {
                statusDisplay.textContent = "⏳ Sẽ cố gắng sắp xếp ghé qua";
                statusDisplay.style.color = "var(--bk-cyan)";
            } else {
                statusDisplay.textContent = "💌 Gửi lời chúc mừng từ phương xa";
                statusDisplay.style.color = "var(--text-muted)";
            }
        }

        if (quoteDisplay) {
            quoteDisplay.textContent = `"${finalMessage}"`;
        }

        // Thêm lời chúc vào Bảng tin Lời Chúc Thời Gian Thực
        addWishToList(finalName, relation, finalMessage);

        // Combo pháo hoa + tung mũ cử nhân rực rỡ
        if (celebrationEngine) {
            celebrationEngine.comboCelebration();
        }
        showToast("🎉 Lời chúc của bạn đã được ghi danh vào Sổ Lưu Bút!");

        receipt.scrollIntoView({ behavior: "smooth", block: "center" });
        receipt.style.transition = "transform 0.35s ease, box-shadow 0.35s ease";
        receipt.style.transform = "scale(1.03)";
        receipt.style.boxShadow = "0 12px 36px rgba(0, 51, 102, 0.25)";

        setTimeout(() => {
            receipt.style.transform = "none";
            receipt.style.boxShadow = "";
        }, 1200);

        const submitBtn = form.querySelector(".btn-guestbook-submit");
        if (submitBtn) {
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = "✓ Đã lưu lời chúc thành công!";
            submitBtn.style.background = "var(--bk-cyan)";
            setTimeout(() => {
                submitBtn.textContent = originalBtnText;
                submitBtn.style.background = "";
            }, 3000);
        }
    });
}

/**
 * 4. Hỗ trợ phóng to ảnh (Lightbox đơn giản, mượt mà)
 */
function initPhotoModal() {
    // Tạo modal element
    const modal = document.createElement("div");
    modal.id = "photo-modal";
    modal.style.cssText = `
        position: fixed;
        inset: 0;
        z-index: 1000;
        background: rgba(0, 40, 85, 0.92);
        backdrop-filter: blur(8px);
        display: none;
        align-items: center;
        justify-content: center;
        padding: 24px;
        cursor: pointer;
    `;

    const imgContainer = document.createElement("div");
    imgContainer.style.cssText = `
        max-width: 900px;
        width: 100%;
        max-height: 85vh;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        border: 2px solid rgba(0, 163, 224, 0.4);
        background: #002855;
        position: relative;
    `;

    const modalImg = document.createElement("img");
    modalImg.id = "modal-image";
    modalImg.style.cssText = `
        width: 100%;
        height: auto;
        max-height: 75vh;
        object-fit: contain;
        display: block;
    `;

    const modalCaption = document.createElement("div");
    modalCaption.id = "modal-caption";
    modalCaption.style.cssText = `
        padding: 16px 20px;
        background: #002855;
        color: #ffffff;
        font-weight: 700;
        font-size: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(255, 255, 255, 0.15);
    `;

    imgContainer.appendChild(modalImg);
    imgContainer.appendChild(modalCaption);
    modal.appendChild(imgContainer);
    document.body.appendChild(modal);

    modal.addEventListener("click", () => {
        modal.style.display = "none";
    });
}

function openPhotoModal(cardEl) {
    const modal = document.getElementById("photo-modal");
    const modalImg = document.getElementById("modal-image");
    const modalCaption = document.getElementById("modal-caption");
    if (!modal || !modalImg || !modalCaption || !cardEl) return;

    const img = cardEl.querySelector("img");
    const title = cardEl.querySelector(".photo-caption-title");
    const year = cardEl.querySelector(".photo-year-tag");

    if (img) modalImg.src = img.src;
    modalCaption.innerHTML = `
        <span>${title ? title.textContent : "Khoảnh khắc Bách Khoa"}</span>
        <span style="font-size: 0.85rem; color: #00a3e0;">${year ? year.textContent : "2026"}</span>
    `;

    modal.style.display = "flex";

    // Khi mở ảnh tung mũ cử nhân, tự động kích hoạt hiệu ứng tung mũ bay trong không gian
    if (title && title.textContent.includes("Tung Mũ") && celebrationEngine) {
        celebrationEngine.tossCaps(16);
        playCapTossSound();
    }
}

// ==========================================================================
// 5. NÚT TUNG MŨ CỬ NHÂN & BẮN PHÁO HOA ĂN MỪNG
// ==========================================================================
function initCelebration() {
    const tossBtn = document.getElementById("btn-toss-caps");
    const fireworkBtn = document.getElementById("btn-fireworks");
    const fabMainBtn = document.getElementById("fab-celebrate-btn");
    const fabCapBtn = document.getElementById("fab-cap-btn");
    const fabFireworkBtn = document.getElementById("fab-firework-btn");
    const fabGroup = document.getElementById("celebrate-fab-group");

    // Nút Tung Mũ trên Hero
    if (tossBtn) {
        tossBtn.addEventListener("click", () => {
            if (celebrationEngine) celebrationEngine.tossCaps(22);
            playCapTossSound();
            showToast("🎓 Tung mũ cử nhân — Tự hào Tân Kỹ sư Bách Khoa!");
        });
    }

    // Nút Bắn Pháo Hoa trên Hero
    if (fireworkBtn) {
        fireworkBtn.addEventListener("click", () => {
            if (celebrationEngine) celebrationEngine.launchFireworks(6);
            showToast("🎆 Pháo hoa rực rỡ chúc mừng tốt nghiệp!");
        });
    }

    // Menu FAB nổi góc màn hình
    if (fabCapBtn) {
        fabCapBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (celebrationEngine) celebrationEngine.tossCaps(20);
            playCapTossSound();
            showToast("🎓 Tung mũ cử nhân chúc mừng!");
        });
    }

    if (fabFireworkBtn) {
        fabFireworkBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            if (celebrationEngine) celebrationEngine.launchFireworks(6);
            showToast("🎆 Pháo hoa chúc mừng Bách Khoa!");
        });
    }

    if (fabMainBtn) {
        fabMainBtn.addEventListener("click", () => {
            if (fabGroup) fabGroup.classList.toggle("active");
            if (celebrationEngine) celebrationEngine.comboCelebration();
            showToast("🎉 Chúc mừng Tân Kỹ sư Phạm Minh Phương!");
        });
    }
}

// ==========================================================================
// 6. CHIA SẺ THIỆP MỜI (WEB SHARE API & CLIPBOARD FALLBACK)
// ==========================================================================
function initShareButton() {
    const shareBtn = document.getElementById("btn-hero-share");
    if (!shareBtn) return;

    shareBtn.addEventListener("click", async () => {
        const shareData = {
            title: "Lễ Tốt Nghiệp Kỹ Sư HCMUT — Phạm Minh Phương",
            text: "Kính mời bạn đến tham dự Lễ Tốt Nghiệp Tân Kỹ Sư Năng Lượng Phạm Minh Phương tại ĐH Bách Khoa TP.HCM (28/11/2026)!",
            url: window.location.href
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                // Người dùng hủy chia sẻ
            }
        } else {
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(window.location.href);
                } else {
                    const temp = document.createElement("input");
                    temp.value = window.location.href;
                    document.body.appendChild(temp);
                    temp.select();
                    document.execCommand("copy");
                    document.body.removeChild(temp);
                }
                showToast("✓ Đã sao chép liên kết thiệp mời vào Clipboard!");
            } catch (err) {
                showToast("✓ Hãy chia sẻ đường link trang web này nhé!");
            }
        }
    });
}

// ==========================================================================
// 7. HIỆU ỨNG THẺ KỸ SƯ 3D TILT CARD (INTERACTIVE PERSPECTIVE)
// ==========================================================================
function initTiltCard() {
    const card = document.querySelector(".engineer-pass-badge");
    if (!card) return;

    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -7;
        const rotateY = ((x - centerX) / centerX) * 7;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
}


// ==========================================================================
// 8. ĐIỀU KHIỂN CON ĐƯỜNG ROADMAP & HOVER TÓM TẮT GIAI ĐOẠN
// ==========================================================================
const ROAD_STAGES_DATA = [
    {
        year: "2021",
        step: "CHẶNG 01 · NĂM 2021",
        phase: "KHỞI ĐẦU",
        icon: "🏛️",
        title: "Bước Vào Giảng Đường Bách Khoa",
        desc: "Đặt chân qua Cổng A2 (268 Lý Thường Kiệt), chính thức trở thành tân sinh viên ngành Kỹ thuật Năng lượng Khóa K21.",
        meta: "📍 Cột mốc xuất phát · 268 Lý Thường Kiệt"
    },
    {
        year: "2022",
        step: "CHẶNG 02 · NĂM 2022",
        phase: "TÔI LUYỆN",
        icon: "🏕️",
        title: "Thao Trường Dĩ An & Đại Cương",
        desc: "Mùa hè quân sự áo lính tôi luyện kỷ luật và tình đồng đội; vượt qua các kỳ thi Toán - Lý kỹ thuật nền tảng vững chắc.",
        meta: "🎖️ Quân sự Dĩ An · Cơ sở 2"
    },
    {
        year: "2023",
        step: "CHẶNG 03 · NĂM 2023",
        phase: "CƠ SỞ NGÀNH",
        icon: "⚡",
        title: "Cơ Sở Kỹ Thuật Năng Lượng",
        desc: "Tiếp cận các học phần Nhiệt động lực học, Truyền nhiệt, Nguyên lý hệ thống năng lượng và thí nghiệm chuyên ngành.",
        meta: "🔬 Làm chủ nguyên lý cốt lõi"
    },
    {
        year: "2024",
        step: "CHẶNG 04 · NĂM 2024",
        phase: "CHUYÊN SÂU",
        icon: "🔋",
        title: "Phòng Lab Pin & Điện Mặt Trời",
        desc: "Đo đạc kiểm tra tế bào pin Lithium, nghiên cứu điện hóa và thiết kế mô phỏng các giải pháp năng lượng mặt trời.",
        meta: "⚡ Phòng Lab Điện Hóa & Pin"
    },
    {
        year: "2025",
        step: "CHẶNG 05 · NĂM 2025",
        phase: "THỰC CHIẾN",
        icon: "🌱",
        title: "Thực Tập Doanh Nghiệp & Net Zero",
        desc: "Mô phỏng ổn định lưới điện phân tán, tham gia giải pháp năng lượng sạch thực tế hướng đến mục tiêu Net Zero.",
        meta: "🌍 Dự án & Doanh nghiệp"
    },
    {
        year: "2026",
        step: "ĐÍCH ĐẾN · NĂM 2026",
        phase: "CÁN ĐÍCH",
        icon: "🎓",
        title: "Vinh Danh Tân Kỹ Sư Năng Lượng",
        desc: "Bảo vệ Khóa luận tốt nghiệp xuất sắc; chính thức nhận bằng Tân Kỹ sư Bách Khoa trong lễ vinh danh ngày 28/11/2026.",
        meta: "🏆 Hội trường A5 · 28/11/2026"
    }
];

function initRoadmapPathway() {
    const milestones = document.querySelectorAll(".road-milestone");
    const navButtons = document.querySelectorAll(".stage-nav-btn");
    const spotlightCard = document.getElementById("road-spotlight-card");

    if (!milestones.length || !spotlightCard) return;

    const stepEl = document.getElementById("spotlight-step");
    const phaseEl = document.getElementById("spotlight-phase");
    const iconEl = document.getElementById("spotlight-icon");
    const titleEl = document.getElementById("spotlight-title");
    const descEl = document.getElementById("spotlight-desc");
    const metaEl = document.getElementById("spotlight-meta");

    function setActiveStage(index) {
        const data = ROAD_STAGES_DATA[index];
        if (!data) return;

        milestones.forEach((m, idx) => {
            if (idx === index) {
                m.classList.add("active");
            } else {
                m.classList.remove("active");
            }
        });

        navButtons.forEach((b, idx) => {
            if (idx === index) {
                b.classList.add("active");
            } else {
                b.classList.remove("active");
            }
        });

        spotlightCard.style.opacity = "0.75";
        spotlightCard.style.transform = "translateY(2px)";

        setTimeout(() => {
            if (stepEl) stepEl.textContent = data.step;
            if (phaseEl) phaseEl.textContent = data.phase;
            if (iconEl) iconEl.textContent = data.icon;
            if (titleEl) titleEl.textContent = data.title;
            if (descEl) descEl.textContent = data.desc;
            if (metaEl) metaEl.textContent = data.meta;

            spotlightCard.style.opacity = "1";
            spotlightCard.style.transform = "translateY(0)";
        }, 80);
    }

    milestones.forEach((m, idx) => {
        m.addEventListener("mouseenter", () => {
            setActiveStage(idx);
        });

        m.addEventListener("click", () => {
            setActiveStage(idx);
            if (navigator.vibrate) navigator.vibrate(8);
        });

        m.addEventListener("focus", () => {
            setActiveStage(idx);
        });
    });

    navButtons.forEach((btn, idx) => {
        btn.addEventListener("click", () => {
            setActiveStage(idx);
            const targetMilestone = milestones[idx];
            if (targetMilestone) {
                targetMilestone.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
            }
            if (navigator.vibrate) navigator.vibrate(8);
        });
    });

    setActiveStage(5);
}

// ==========================================================================
// 9. BẢNG TIN LỜI CHÚC THỜI GIAN THỰC (LIVE WISHES WALL)
// ==========================================================================
const DEFAULT_WISHES = [
    {
        name: "Nguyễn Văn Thành",
        relation: "Bạn bè / Đồng môn K21",
        message: "Chúc mừng Tân Kỹ sư Phương! Những năm tháng Bách Khoa cùng nhau cày cuốc đồ án đã hái quả ngọt rực rỡ. Vững bước và vươn xa nhé bạn hiền!",
        time: "Hôm qua lúc 19:42"
    },
    {
        name: "Cô Lê Thanh Mai",
        relation: "Giảng viên / Thầy cô",
        message: "Chúc mừng em Phương đã hoàn thành xuất sắc đồ án tốt nghiệp ngành Kỹ thuật Năng lượng. Chúc em luôn giữ vững ngọn lửa đam mê và cống hiến cho xã hội.",
        time: "Hôm nay lúc 08:15"
    },
    {
        name: "Gia đình Phương",
        relation: "Gia đình / Người thân",
        message: "Cả nhà luôn tự hào về con. Chúc con đường tương lai rộng mở, luôn tràn đầy năng lượng, nhiệt huyết Bách Khoa và gặt hái nhiều thành công!",
        time: "Vừa xong"
    }
];

function initRecentWishes() {
    const listEl = document.getElementById("recent-wishes-list");
    if (!listEl) return;

    let wishes = [];
    try {
        const stored = localStorage.getItem("pmp_grad_wishes");
        if (stored) {
            wishes = JSON.parse(stored);
        }
    } catch (e) {
        wishes = [];
    }

    if (!Array.isArray(wishes) || wishes.length === 0) {
        wishes = DEFAULT_WISHES;
        try {
            localStorage.setItem("pmp_grad_wishes", JSON.stringify(wishes));
        } catch (e) {}
    }

    renderWishes(wishes);
}

function renderWishes(wishes) {
    const listEl = document.getElementById("recent-wishes-list");
    const countEl = document.getElementById("wishes-counter-pill");
    if (!listEl) return;

    if (countEl) {
        countEl.textContent = `${wishes.length} Lời Chúc Mới Nhất`;
    }

    listEl.innerHTML = wishes.map((w) => {
        const initial = (w.name || "K").trim().charAt(0).toUpperCase();
        return `
            <div class="wish-card">
                <div>
                    <div class="wish-card-head">
                        <div class="wish-avatar-circle">${initial}</div>
                        <div>
                            <div class="wish-author">${escapeHtml(w.name)}</div>
                            <span class="wish-relation-tag">${escapeHtml(w.relation || "Đồng môn")}</span>
                        </div>
                    </div>
                    <div class="wish-text">"${escapeHtml(w.message)}"</div>
                </div>
                <div class="wish-time">${escapeHtml(w.time || "Vừa xong")}</div>
            </div>
        `;
    }).join("");
}

function addWishToList(name, relation, message) {
    let wishes = [];
    try {
        const stored = localStorage.getItem("pmp_grad_wishes");
        if (stored) wishes = JSON.parse(stored);
    } catch (e) {
        wishes = [];
    }

    if (!Array.isArray(wishes) || wishes.length === 0) {
        wishes = [...DEFAULT_WISHES];
    }

    wishes.unshift({
        name,
        relation: relation || "Bạn bè / Đồng môn",
        message,
        time: "Vừa xong"
    });

    try {
        localStorage.setItem("pmp_grad_wishes", JSON.stringify(wishes));
    } catch (e) {}

    renderWishes(wishes);
}

function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================================================
// 9. THÔNG BÁO NHANH (TOAST NOTIFICATION)
// ==========================================================================
function showToast(message) {
    const toast = document.getElementById("toast-notify");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 2800);
}

// ==========================================================================
// 10. ÂM THANH VINH DANH & PHÁO HOA (NATIVE WEB AUDIO API)
// ==========================================================================
function playCapTossSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // Fanfare rộn rã 5 nốt: C5, E5, G5, B5, C6
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.50];
        notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0.001, now + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.55);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.6);
        });
    } catch (e) {}
}

function playFireworkPop() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        // Âm thanh nổ pháo hoa bùng sáng: pitch sweep down
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(320 + Math.random() * 80, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.28);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.32);
    } catch (e) {}
}

function playCelebrationFanfare() {
    playCapTossSound();
}

// ==========================================================================
// 11. ĐỘNG CƠ TUNG MŨ CỬ NHÂN & BẮN PHÁO HOA (CELEBRATION ENGINE)
// ==========================================================================
class CelebrationEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext("2d");
        this.caps = [];
        this.rockets = [];
        this.sparks = [];
        this.confetti = [];
        this.animationId = null;
        this.colors = ["#003366", "#00a3e0", "#ffd166", "#10b981", "#ffffff", "#00509d"];
        this.resize();
        window.addEventListener("resize", () => this.resize());
    }

    resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // 1. HIỆU ỨNG TUNG MŨ CỬ NHÂN (MORTARBOARD CAP TOSS)
    tossCaps(count = 20) {
        this.resize();
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        for (let i = 0; i < count; i++) {
            const startX = screenW * (0.08 + Math.random() * 0.84);
            const startY = screenH + 20 + Math.random() * 40;
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.65;
            const speed = 15 + Math.random() * 10;

            this.caps.push({
                x: startX,
                y: startY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 34 + Math.random() * 18,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 8,
                flipAngle: Math.random() * Math.PI,
                flipSpeed: 0.04 + Math.random() * 0.04,
                opacity: 1,
                decay: 0.0028 + Math.random() * 0.0035
            });
        }

        // Bổ sung ruy-băng bay bổng theo mũ
        this.fireConfetti(35);

        if (!this.animationId) {
            this.loop();
        }
    }

    // 2. HIỆU ỨNG BẮN PHÁO HOA RỰC RỠ (HCMUT FIREWORKS)
    launchFireworks(rocketCount = 5) {
        this.resize();
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        for (let i = 0; i < rocketCount; i++) {
            setTimeout(() => {
                const startX = screenW * (0.15 + Math.random() * 0.7);
                const targetY = screenH * (0.14 + Math.random() * 0.32);
                const color = this.colors[Math.floor(Math.random() * this.colors.length)];

                this.rockets.push({
                    x: startX,
                    y: screenH,
                    targetY: targetY,
                    vx: (Math.random() - 0.5) * 2.8,
                    vy: -(14 + Math.random() * 5),
                    color: color,
                    trail: []
                });

                if (!this.animationId) {
                    this.loop();
                }
            }, i * 220);
        }
    }

    explode(x, y, baseColor) {
        const sparkCount = 65 + Math.floor(Math.random() * 30);
        playFireworkPop();

        for (let i = 0; i < sparkCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 8.5;
            const color = Math.random() > 0.35 ? baseColor : this.colors[Math.floor(Math.random() * this.colors.length)];

            this.sparks.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: 2 + Math.random() * 2.8,
                alpha: 1,
                decay: 0.012 + Math.random() * 0.015,
                gravity: 0.11
            });
        }
    }

    // 3. HIỆU ỨNG RUY-BĂNG & SAO VÀNG (CONFETTI & STARS)
    fireConfetti(count = 80) {
        this.resize();
        const startX = window.innerWidth / 2;
        const startY = window.innerHeight * 0.4;

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 8 + Math.random() * 16;
            this.confetti.push({
                x: startX,
                y: startY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity - 6,
                size: 6 + Math.random() * 9,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 12,
                opacity: 1,
                decay: 0.008 + Math.random() * 0.012,
                isStar: Math.random() > 0.65
            });
        }

        if (!this.animationId) {
            this.loop();
        }
    }

    // 4. COMBO ĂN MỪNG ĐẠI TIỆC
    comboCelebration() {
        this.tossCaps(18);
        this.launchFireworks(5);
        playCelebrationFanfare();
    }

    drawCap(p) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        const flipScale = Math.sin(p.flipAngle);
        ctx.scale(flipScale, 1);
        ctx.globalAlpha = Math.max(0, p.opacity);

        const s = p.size;

        // Vòm mũ bên dưới (Skull cap)
        ctx.fillStyle = "#001833";
        ctx.beginPath();
        ctx.ellipse(0, s * 0.16, s * 0.42, s * 0.22, 0, 0, Math.PI);
        ctx.fill();

        // Mặt nón vuông hình thoi (Square Mortarboard)
        ctx.fillStyle = "#002855";
        ctx.strokeStyle = "#00a3e0";
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.4);
        ctx.lineTo(s * 0.75, 0);
        ctx.lineTo(0, s * 0.4);
        ctx.lineTo(-s * 0.75, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Nút trung tâm vàng danh dự
        ctx.fillStyle = "#ffd166";
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.08, 0, Math.PI * 2);
        ctx.fill();

        // Dây tua rua uốn lượn (Tassel)
        ctx.strokeStyle = "#ffd166";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(s * 0.35, s * 0.35, s * 0.52, s * 0.7);
        ctx.stroke();

        // Đuôi chùm tua rua
        ctx.fillStyle = "#e5a93c";
        ctx.fillRect(s * 0.48, s * 0.68, s * 0.1, s * 0.2);

        ctx.restore();
    }

    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, color) {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
    }

    loop() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 1. Update & Draw Rockets
        for (let i = this.rockets.length - 1; i >= 0; i--) {
            const r = this.rockets[i];
            r.trail.push({ x: r.x, y: r.y });
            if (r.trail.length > 7) r.trail.shift();

            r.x += r.vx;
            r.y += r.vy;
            r.vy *= 0.985;

            // Vệt lửa đuôi pháo hoa
            this.ctx.save();
            this.ctx.strokeStyle = r.color;
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            for (let j = 0; j < r.trail.length; j++) {
                const pt = r.trail[j];
                if (j === 0) this.ctx.moveTo(pt.x, pt.y);
                else this.ctx.lineTo(pt.x, pt.y);
            }
            this.ctx.stroke();
            this.ctx.restore();

            if (r.y <= r.targetY || r.vy >= -1.5) {
                this.explode(r.x, r.y, r.color);
                this.rockets.splice(i, 1);
            }
        }

        // 2. Update & Draw Sparks
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const s = this.sparks[i];
            s.x += s.vx;
            s.y += s.vy;
            s.vy += s.gravity;
            s.vx *= 0.96;
            s.vy *= 0.96;
            s.alpha -= s.decay;

            if (s.alpha <= 0 || s.y > this.canvas.height) {
                this.sparks.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.globalAlpha = Math.max(0, s.alpha);
            this.ctx.fillStyle = s.color;
            this.ctx.shadowColor = s.color;
            this.ctx.shadowBlur = 6;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }

        // 3. Update & Draw Caps
        for (let i = this.caps.length - 1; i >= 0; i--) {
            const c = this.caps[i];
            c.x += c.vx;
            c.y += c.vy;
            c.vy += 0.32; // Trọng lực rơi
            c.vx *= 0.985;
            c.rotation += c.rotationSpeed;
            c.flipAngle += c.flipSpeed;
            c.opacity -= c.decay;

            if (c.y > this.canvas.height + 60 || c.opacity <= 0) {
                this.caps.splice(i, 1);
                continue;
            }

            this.drawCap(c);
        }

        // 4. Update & Draw Confetti / Stars
        for (let i = this.confetti.length - 1; i >= 0; i--) {
            const p = this.confetti[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.36;
            p.vx *= 0.98;
            p.rotation += p.rotationSpeed;
            p.opacity -= p.decay;

            if (p.opacity <= 0 || p.y > this.canvas.height + 50) {
                this.confetti.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = Math.max(0, p.opacity);

            if (p.isStar) {
                this.drawStar(this.ctx, 0, 0, 5, p.size, p.size / 2, "#ffd166");
            } else {
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
            }
            this.ctx.restore();
        }

        const totalActive = this.rockets.length + this.sparks.length + this.caps.length + this.confetti.length;
        if (totalActive > 0) {
            this.animationId = requestAnimationFrame(() => this.loop());
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.animationId = null;
        }
    }
}
