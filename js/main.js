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
    initGratitudeStory();
    initCampusGuide();
    initQuickWishesAndPass();
    initEnvelopeExperience();
    initBackToTop();

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

    // Tự động xóa cảnh báo lỗi & cập nhật Thẻ Lưu Niệm theo thời gian thực
    const syncLiveReceipt = () => {
        const liveName = nameInput ? nameInput.value.trim() : "";
        const liveRel = relationInput ? relationInput.value : "";
        const liveAtt = attendanceInput ? attendanceInput.value : "yes";
        const liveMsg = messageInput ? messageInput.value.trim() : "";

        if (guestNameDisplay) {
            if (liveName) {
                guestNameDisplay.textContent = liveRel ? `${liveName} (${liveRel})` : liveName;
            } else {
                guestNameDisplay.textContent = "Bạn Thân Mến";
            }
        }

        if (statusDisplay) {
            if (liveAtt === "yes") {
                statusDisplay.textContent = "✨ Sẽ hiện diện chung vui cùng Phương";
                statusDisplay.style.color = "var(--bk-blue)";
            } else if (liveAtt === "maybe") {
                statusDisplay.textContent = "⏳ Sẽ cố gắng sắp xếp ghé qua";
                statusDisplay.style.color = "var(--bk-cyan)";
            } else {
                statusDisplay.textContent = "💌 Gửi lời chúc mừng từ phương xa";
                statusDisplay.style.color = "var(--text-muted)";
            }
        }

        if (quoteDisplay) {
            quoteDisplay.textContent = liveMsg
                ? `"${liveMsg}"`
                : `"Chúc bạn luôn giữ trọn ngọn lửa nhiệt huyết, bền bỉ và gặt hái nhiều thành công rực rỡ trên con đường sự nghiệp!"`;
        }
    };

    const clearError = () => {
        if (alertBox) {
            alertBox.style.display = "none";
            alertBox.textContent = "";
        }
        if (nameInput) nameInput.classList.remove("input-has-error");
        if (messageInput) messageInput.classList.remove("input-has-error");
        syncLiveReceipt();
    };

    if (nameInput) nameInput.addEventListener("input", clearError);
    if (messageInput) messageInput.addEventListener("input", clearError);
    if (relationInput) relationInput.addEventListener("change", syncLiveReceipt);
    if (attendanceInput) attendanceInput.addEventListener("change", syncLiveReceipt);

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

        const finalName = name || "Bạn";
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
            if (fabGroup) {
                const isOpen = fabGroup.classList.toggle("active");
                fabMainBtn.setAttribute("aria-expanded", String(isOpen));
            }
            if (celebrationEngine) celebrationEngine.comboCelebration();
            showToast("🎉 Chúc mừng Tân Kỹ sư Phạm Minh Phương!");
        });
    }

    document.addEventListener("click", (e) => {
        if (fabGroup && fabGroup.classList.contains("active") && !fabGroup.contains(e.target)) {
            fabGroup.classList.remove("active");
            if (fabMainBtn) fabMainBtn.setAttribute("aria-expanded", "false");
        }
    });
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
// 7. HIỆU ỨNG THẺ CHÂN DUNG 3D HOLOGRAPHIC TILT (INTERACTIVE PERSPECTIVE)
// ==========================================================================
function initTiltCard() {
    const card = document.getElementById("hero-portrait-card") || document.querySelector(".hero-portrait-card");
    if (!card) return;

    card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;

        card.style.setProperty("--glare-x", `${glareX.toFixed(1)}%`);
        card.style.setProperty("--glare-y", `${glareY.toFixed(1)}%`);
        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;
    });

    card.addEventListener("mouseleave", () => {
        card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
    });
}

// ==========================================================================
// 7B. TRẠM TIẾP SỨC NĂNG LƯỢNG TÂN KỸ SƯ (INTERACTIVE ENERGY REACTOR)
// ==========================================================================
function playEnergyChargeSound(boostCount) {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        const baseFreq = 440 + Math.min(boostCount, 12) * 35;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.45, now + 0.14);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.11, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
    } catch (e) {}
}

function initGratitudeStory() {
    const tabBtns = document.querySelectorAll(".letter-tab-btn");
    const letterPaper = document.getElementById("letter-paper-body");
    const salutationEl = document.getElementById("letter-salutation");
    const letterTextEl = document.getElementById("letter-text");
    const sparkBtn = document.getElementById("btn-spark-tribute");
    const sparkCounterEl = document.getElementById("spark-counter");

    const LETTERS = {
        family: {
            salutation: "Kính gửi Ba Mẹ và Gia Đình thân yêu,",
            text: "Năm năm dưới mái trường Bách Khoa là hành trình dài đầy thử thách nhưng luôn ấm áp vì có gia đình làm điểm tựa. Cảm ơn Ba Mẹ đã luôn tin tưởng, hy sinh thầm lặng và tiếp thêm nghị lực để con có thể tự hào khoác lên mình tấm áo Tân Kỹ sư ngày hôm nay."
        },
        teachers: {
            salutation: "Kính gửi Quý Thầy Cô Khoa & Bộ môn,",
            text: "Em xin gửi lời tri ân sâu sắc tới Quý Thầy Cô đã tận tâm truyền đạt tri thức, dìu dắt em qua từng giờ thí nghiệm, đồ án chuyên ngành đến buổi bảo vệ Khóa luận tốt nghiệp. Những bài học tại Bách Khoa sẽ mãi là hành trang quý giá nhất của em."
        },
        friends: {
            salutation: "Gửi những người bạn, anh chị em chiến hữu K21,",
            text: "Cảm ơn tất cả mọi người vì đã cùng Phương đi qua những mùa quân sự Dĩ An, những đêm chạy deadline đồ án và cả những tiếng cười rộn rã sân trường. Chúc cho chúng ta sau dấu mốc 28/11 sẽ luôn giữ trọn ngọn lửa nhiệt huyết và bay thật cao!"
        }
    };

    tabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.target;
            const entry = LETTERS[key];
            if (!entry) return;

            tabBtns.forEach((b) => {
                b.classList.toggle("active", b === btn);
                b.setAttribute("aria-selected", b === btn ? "true" : "false");
            });

            if (letterPaper) {
                letterPaper.classList.remove("is-switching");
                void letterPaper.offsetWidth;
                letterPaper.classList.add("is-switching");
            }
            if (salutationEl) salutationEl.textContent = entry.salutation;
            if (letterTextEl) letterTextEl.textContent = entry.text;
        });
    });

    if (sparkBtn && sparkCounterEl) {
        let sparkCount = 2026;
        let userClicks = 0;
        try {
            const saved = parseInt(localStorage.getItem("pmp_tribute_sparks"), 10);
            if (!isNaN(saved) && saved >= 2026) sparkCount = saved;
        } catch (e) {}

        sparkCounterEl.textContent = sparkCount.toLocaleString("vi-VN");
        sparkBtn.addEventListener("click", () => {
            sparkCount += 1;
            userClicks += 1;
            sparkCounterEl.textContent = sparkCount.toLocaleString("vi-VN");
            try {
                localStorage.setItem("pmp_tribute_sparks", String(sparkCount));
            } catch (e) {}

            sparkBtn.classList.remove("is-pulsing");
            void sparkBtn.offsetWidth;
            sparkBtn.classList.add("is-pulsing");
            playEnergyChargeSound(userClicks);

            if (userClicks % 5 === 0 && celebrationEngine) {
                celebrationEngine.tossCaps(8);
            }
            showToast(`⚡ Cảm ơn bạn đã gửi tia sáng chúc mừng thứ ${sparkCount.toLocaleString("vi-VN")}!`);
        });
    }

    // Hộp Kỷ Vật 5 Năm (Interactive Stacked Memory Deck)
    const MEMORIES = [
        {
            year: "2021",
            icon: "🏛️",
            title: "Ngày Đầu Bước Qua Cổng A2",
            desc: "Nhận chiếc thẻ sinh viên Bách Khoa đầu tiên tại 268 Lý Thường Kiệt, chính thức bắt đầu thanh xuân cùng ngành Kỹ thuật Năng lượng.",
            place: "📍 Giảng đường Lý Thường Kiệt"
        },
        {
            year: "2022 – 2023",
            icon: "🏕️",
            title: "Dĩ An & Những Đêm Ôn Thi",
            desc: "Mùa hè quân sự áo lính đầy nắng gió, những đêm thức trắng cùng chiến hữu giải từng bài Toán kỹ thuật và Nhiệt động lực học.",
            place: "🎖️ Cơ sở Dĩ An & Thư viện"
        },
        {
            year: "2024 – 2025",
            icon: "🔋",
            title: "Lab Pin Lithium & Điện Xanh",
            desc: "Hàng trăm giờ đo đạc điện hóa, mô phỏng hệ thống điện mặt trời và những đồ án thực chiến hướng tới năng lượng bền vững.",
            place: "⚡ Phòng Lab Điện Hóa & Năng Lượng"
        },
        {
            year: "28/11/2026",
            icon: "🎓",
            title: "Khoảnh Khắc Vinh Danh A5",
            desc: "Khoác lên mình chiếc áo Tân Kỹ sư trong Lễ Tốt Nghiệp tại Hội trường A5 — khép lại 5 năm sinh viên, mở ra hành trình rực rỡ mới.",
            place: "🏆 Hội trường A5 · ĐH Bách Khoa"
        }
    ];

    const deckCounterEl = document.getElementById("memory-deck-counter");
    const activeCard = document.getElementById("memory-active-card");
    const yearEl = document.getElementById("memory-year");
    const iconEl = document.getElementById("memory-icon");
    const titleEl = document.getElementById("memory-title");
    const descEl = document.getElementById("memory-desc");
    const placeEl = document.getElementById("memory-place");
    const prevBtn = document.getElementById("memory-prev-btn");
    const nextBtn = document.getElementById("memory-next-btn");
    const dotBtns = document.querySelectorAll(".m-dot");

    if (!activeCard) return;

    let currentIdx = 0;

    function renderMemory(index, animate = true) {
        currentIdx = (index + MEMORIES.length) % MEMORIES.length;
        const item = MEMORIES[currentIdx];

        if (animate) {
            activeCard.classList.remove("is-flipping");
            void activeCard.offsetWidth;
            activeCard.classList.add("is-flipping");
        }

        if (deckCounterEl) deckCounterEl.textContent = `0${currentIdx + 1} / 0${MEMORIES.length}`;
        if (yearEl) yearEl.textContent = item.year;
        if (iconEl) iconEl.textContent = item.icon;
        if (titleEl) titleEl.textContent = item.title;
        if (descEl) descEl.textContent = item.desc;
        if (placeEl) placeEl.textContent = item.place;

        activeCard.classList.toggle("is-finale", currentIdx === MEMORIES.length - 1);
        dotBtns.forEach((dot, i) => dot.classList.toggle("active", i === currentIdx));
    }

    if (prevBtn) prevBtn.addEventListener("click", () => renderMemory(currentIdx - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => renderMemory(currentIdx + 1));
    activeCard.addEventListener("click", () => renderMemory(currentIdx + 1));
    activeCard.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            renderMemory(currentIdx + 1);
        } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            renderMemory(currentIdx - 1);
        }
    });

    dotBtns.forEach((dot) => {
        dot.addEventListener("click", () => {
            const idx = parseInt(dot.dataset.index, 10);
            if (!isNaN(idx)) renderMemory(idx);
        });
    });

    renderMemory(0, false);
}

// ==========================================================================
// 7C. CẨM NANG TỌA ĐỘ CAMPUS BÁCH KHOA (INTERACTIVE EVENT TABS)
// ==========================================================================
function initCampusGuide() {
    const tabBtns = document.querySelectorAll(".guide-tab-btn");
    const contentBox = document.getElementById("campus-guide-content");
    if (!tabBtns.length || !contentBox) return;

    const GUIDE_CONTENT = {
        parking: "<strong>Gửi xe thuận tiện:</strong> Cổng sau <strong>142 Tô Hiến Thành</strong> hoặc bãi xe <strong>268 Lý Thường Kiệt</strong> đều có bãi giữ xe máy rộng rãi; ô tô có thể đỗ dọc sân nội bộ theo hướng dẫn bảo vệ.",
        hall: "<strong>Tọa độ Hội trường A5:</strong> Nằm ngay khu vực sân trung tâm (cạnh Nhà A4 & Thư viện). Phương sẽ đón khách và chụp ảnh lưu niệm tại sảnh trước lễ từ <strong>07:30 AM</strong>.",
        photo: "<strong>Góc Check-in đẹp nhất:</strong> Cổng A2 268 Lý Thường Kiệt, Tượng đài Bách Khoa, hàng cây xanh sân trung tâm A5 và sảnh tòa C2 đón nắng sáng."
    };

    tabBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const key = btn.getAttribute("data-guide");
            tabBtns.forEach((b) => {
                b.classList.remove("active");
                b.setAttribute("aria-selected", "false");
            });
            btn.classList.add("active");
            btn.setAttribute("aria-selected", "true");
            if (GUIDE_CONTENT[key]) {
                contentBox.innerHTML = GUIDE_CONTENT[key];
            }
        });
    });
}

// ==========================================================================
// 7D. GỢI Ý LỜI CHÚC NHANH & TẢI THẺ LƯU NIỆM VIP (PNG CANVAS EXPORT)
// ==========================================================================
function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const words = text.split(/\s+/);
    let line = "";
    let lineCount = 0;

    for (let i = 0; i < words.length; i++) {
        const testLine = line ? `${line} ${words[i]}` : words[i];
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, x, y);
            line = words[i];
            y += lineHeight;
            lineCount++;
            if (lineCount >= maxLines - 1) {
                const remaining = words.slice(i).join(" ");
                let truncated = remaining;
                while (ctx.measureText(`${truncated}...`).width > maxWidth && truncated.length > 0) {
                    truncated = truncated.slice(0, -1);
                }
                ctx.fillText(`${truncated}...`, x, y);
                return;
            }
        } else {
            line = testLine;
        }
    }
    if (line) ctx.fillText(line, x, y);
}

function initQuickWishesAndPass() {
    const wishChips = document.querySelectorAll(".wish-chip-btn");
    const msgInput = document.getElementById("guest-message");

    wishChips.forEach((chip) => {
        chip.addEventListener("click", () => {
            const wish = chip.getAttribute("data-wish");
            if (msgInput && wish) {
                msgInput.value = wish;
                msgInput.dispatchEvent(new Event("input", { bubbles: true }));
                msgInput.focus();
            }
        });
    });

    const downloadBtn = document.getElementById("btn-download-pass");
    if (!downloadBtn) return;

    downloadBtn.addEventListener("click", () => {
        const guestName = (document.getElementById("receipt-guest-name")?.textContent || "Bạn Thân Mến").trim();
        const statusText = (document.getElementById("receipt-status")?.textContent || "✨ Chung vui cùng Tân Kỹ sư").trim();
        const quoteText = (document.getElementById("receipt-quote")?.textContent || "\"Chúc mừng tốt nghiệp!\"").trim();

        const canvas = document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 560;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Nền Royal Navy Gradient sang trọng
        const bgGrad = ctx.createLinearGradient(0, 0, 1000, 560);
        bgGrad.addColorStop(0, "#001936");
        bgGrad.addColorStop(0.55, "#002855");
        bgGrad.addColorStop(1, "#003b7a");
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1000, 560);

        // Họa tiết lưới năng lượng chìm
        ctx.strokeStyle = "rgba(0, 163, 224, 0.14)";
        ctx.lineWidth = 1;
        for (let x = 0; x <= 1000; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 560);
            ctx.stroke();
        }
        for (let y = 0; y <= 560; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(1000, y);
            ctx.stroke();
        }

        // Khung viền kép Vàng + Cyan
        ctx.strokeStyle = "#e5a93c";
        ctx.lineWidth = 3;
        ctx.strokeRect(24, 24, 952, 512);
        ctx.strokeStyle = "rgba(0, 163, 224, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(34, 34, 932, 492);

        // Dải Header
        ctx.fillStyle = "#38bdf8";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("TRƯỜNG ĐẠI HỌC BÁCH KHOA TP.HCM · ĐHQG-HCM", 64, 78);

        ctx.fillStyle = "#fde68a";
        ctx.font = "bold 30px Georgia, serif";
        ctx.fillText("THẺ LƯU NIỆM LỄ TỐT NGHIỆP 2026", 64, 118);

        // Đường ngăn cách
        const lineGrad = ctx.createLinearGradient(64, 0, 936, 0);
        lineGrad.addColorStop(0, "#00a3e0");
        lineGrad.addColorStop(1, "#e5a93c");
        ctx.strokeStyle = lineGrad;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(64, 140);
        ctx.lineTo(936, 140);
        ctx.stroke();

        // Thông tin khách mời & tân kỹ sư
        ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
        ctx.font = "18px sans-serif";
        ctx.fillText("Kính mời / Trân trọng cảm ơn:", 64, 184);

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 28px Georgia, serif";
        ctx.fillText(guestName, 64, 220);

        ctx.fillStyle = "#7dd3fc";
        ctx.font = "bold 18px sans-serif";
        ctx.fillText(`Trạng thái: ${statusText}`, 64, 256);

        ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
        ctx.font = "18px sans-serif";
        ctx.fillText("Tân Kỹ sư: Phạm Minh Phương — Kỹ thuật Năng lượng (Khóa K2021)", 64, 290);

        // Khung trích dẫn lời chúc
        ctx.fillStyle = "rgba(0, 18, 42, 0.65)";
        ctx.fillRect(64, 316, 872, 118);
        ctx.fillStyle = "#00a3e0";
        ctx.fillRect(64, 316, 6, 118);

        ctx.fillStyle = "#f1f5f9";
        ctx.font = "italic 20px Georgia, serif";
        wrapCanvasText(ctx, quoteText, 90, 356, 820, 30, 3);

        // Chân thẻ: Ngày giờ & Con dấu
        ctx.fillStyle = "#fde68a";
        ctx.font = "bold 17px sans-serif";
        ctx.fillText("⏰ 08:00 AM · 28/11/2026   |   📍 Hội trường A5 · 268 Lý Thường Kiệt, Q.10", 64, 486);

        ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
        ctx.font = "bold 14px monospace";
        ctx.textAlign = "right";
        ctx.fillText("PASS ID: BK-K21-2026", 936, 486);

        // Tải ảnh về máy
        const link = document.createElement("a");
        link.download = "The-Luu-Niem-HCMUT-2026.png";
        link.href = canvas.toDataURL("image/png");
        link.click();

        showToast("📸 Đã tải xuống Thẻ Lưu Niệm PNG!");
    });
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

// ==========================================================================
// 11. TRẢI NGHIỆM MỞ PHONG THƯ GREENVELOPE-STYLE (3D ENVELOPE REVEAL)
// ==========================================================================
function initEnvelopeExperience() {
    const overlay = document.getElementById("envelope-overlay");
    const envelope = document.getElementById("bk-envelope");
    const openBtn = document.getElementById("btn-open-envelope");
    const continueBtn = document.getElementById("btn-continue-home");
    const skipBtn = document.getElementById("btn-skip-envelope");
    const replayNavBtn = document.getElementById("btn-replay-envelope");
    const recipientDisplay = document.getElementById("env-recipient-name");
    const cardRecipientDisplay = document.getElementById("env-card-recipient");

    if (!overlay || !envelope) return;

    let isAnimating = false;
    let focusTimer = null;

    // Cá nhân hóa tên khách mời nếu URL có tham số ?to=TenKhach
    try {
        const params = new URLSearchParams(window.location.search);
        const toName = params.get("to");
        if (toName && toName.trim()) {
            const cleanName = toName.trim();
            if (recipientDisplay) recipientDisplay.textContent = cleanName;
            if (cardRecipientDisplay) cardRecipientDisplay.textContent = cleanName;
            const receiptName = document.getElementById("receipt-guest-name");
            const guestInput = document.getElementById("guest-name");
            if (receiptName) receiptName.textContent = cleanName;
            if (guestInput && !guestInput.value) guestInput.value = cleanName;
        }

        // Bỏ qua hiệu ứng nếu có ?skip=1 hoặc mở trực tiếp section qua #hash
        if (params.get("skip") === "1" || window.location.hash) {
            overlay.classList.add("is-dismissed");
            document.body.classList.remove("envelope-locked");
        }
    } catch (e) {}

    function dismissOverlay(withCelebration = false) {
        clearTimeout(focusTimer);
        overlay.classList.add("is-dismissed");
        document.body.classList.remove("envelope-locked");
        if (withCelebration) {
            if (celebrationEngine) {
                celebrationEngine.tossCaps(14);
            }
            showToast("🎓 Chào mừng bạn đến với Thiệp Mời Lễ Tốt Nghiệp!");
        }
    }

    function openEnvelopeSequence() {
        if (isAnimating || envelope.classList.contains("is-open")) return;
        isAnimating = true;

        // Bước 1: Mở sáp niêm phong, bật nắp phong thư & rút thiệp ra
        envelope.classList.add("is-open");
        playCapTossSound();

        // Bước 2: Phóng to tấm thiệp vào trung tâm, ẩn phong thư ra sau & hiện nút Tiếp Tục
        clearTimeout(focusTimer);
        focusTimer = setTimeout(() => {
            envelope.classList.add("is-card-focused");
            overlay.classList.add("is-card-focused");
            if (openBtn) openBtn.hidden = true;
            if (skipBtn) skipBtn.hidden = true;
            if (continueBtn) continueBtn.hidden = false;
            isAnimating = false;
        }, 780);
    }

    function replayEnvelopeSequence() {
        clearTimeout(focusTimer);
        isAnimating = false;
        envelope.classList.remove("is-open", "is-card-focused");
        overlay.classList.remove("is-dismissed", "is-card-focused");
        document.body.classList.add("envelope-locked");
        if (openBtn) openBtn.hidden = false;
        if (skipBtn) skipBtn.hidden = false;
        if (continueBtn) continueBtn.hidden = true;
        const fabGroup = document.getElementById("celebrate-fab-group");
        if (fabGroup) fabGroup.classList.remove("active");
    }

    envelope.addEventListener("click", openEnvelopeSequence);
    envelope.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openEnvelopeSequence();
        }
    });

    if (openBtn) openBtn.addEventListener("click", openEnvelopeSequence);
    if (continueBtn) continueBtn.addEventListener("click", () => dismissOverlay(true));
    if (skipBtn) skipBtn.addEventListener("click", () => dismissOverlay(false));
    if (replayNavBtn) replayNavBtn.addEventListener("click", replayEnvelopeSequence);
}

// ==========================================================================
// 12. NÚT CUỘN LÊN ĐẦU TRANG (BACK TO TOP)
// ==========================================================================
function initBackToTop() {
    const btn = document.getElementById("btn-back-to-top");
    if (!btn) return;

    function toggleVisibility() {
        const shouldShow = window.scrollY > 360;
        btn.classList.toggle("is-visible", shouldShow);
    }

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    toggleVisibility();
}
